import chai from 'chai'
import chaiHttp from 'chai-http'
import express from 'express'
import tenantConfigs from './env/configs.js'
import dbinit from './env/dbinit.js'
import { APIError } from 'modularni-urad-utils/errors.js'
import { attachPaginate } from 'knex-paginate'
import SessionServiceMock from 'modularni-urad-utils/test/mocks/sessionService.js'
import auth from 'modularni-urad-utils/auth.js'
import ApiModule from '../index.js'
import InitSuites from './index.js'
chai.use(chaiHttp)
chai.should()

const port = process.env.PORT || 3333
const g = { 
  chai, port,
  baseurl: `http://localhost:${port}`,
  mockUser: { id: 42 },
  sessionBasket: []
}
g.sessionSrvcMock = SessionServiceMock(process.env.SESSION_SERVICE_PORT, g)

describe('app', () => {

  before(async () => {
    const knex = await dbinit()
    attachPaginate()
    await ApiModule.migrateDB(knex, null, tenantConfigs)

    const app = express()
    const appContext = { 
      express, knex, auth, 
      bodyParser: express.json(),
      ErrorClass: APIError
    }
    const mwarez = ApiModule.init(appContext)
    const initReq = (req, res, next) => {
      req.tenantcfg = tenantConfigs
      next()
    }
    app.use(initReq, mwarez)

    app.use((error, req, res, next) => {
      if (error instanceof APIError) {
        return res.status(error.name).send(error.message)
      }
      console.error(error)
      res.status(500).send(error.message || error.toString())
    })

    return new Promise((resolve, reject) => {
      g.server = app.listen(port, '127.0.0.1', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  })

  after(done => {
    g.sessionSrvcMock.close()
    g.server.close()
    done()
  })

  describe('UNI API', () => InitSuites(g) )
})
