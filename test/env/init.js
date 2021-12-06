import path from 'path'
import express from 'express'
import tenantConfigs from './configs'
import dbinit from './dbinit'
import { initErrorHandlers, APIError } from 'modularni-urad-utils'
import { attachPaginate } from 'knex-paginate'
const SessionServiceMock = require('modularni-urad-utils/test/mocks/sessionService')

module.exports = (g) => {
  process.env.DATABASE_URL = ':memory:'
  process.env.NODE_ENV = 'test'
  process.env.SESSION_SERVICE_PORT = 24000
  process.env.SESSION_SERVICE = `http://localhost:${process.env.SESSION_SERVICE_PORT}`

  const port = process.env.PORT || 3333
  Object.assign(g, {
    port,
    baseurl: `http://localhost:${port}`,
    mockUser: { id: 42 },
    sessionBasket: []
  })
  g.require = function(name) {
    try {
      return require(name)
    } catch (err) {
      console.error(err)
    }    
  }
  g.sessionSrvcMock = SessionServiceMock.default(process.env.SESSION_SERVICE_PORT, g)

  g.InitApp = async function (ApiModule) {
    const auth = require('modularni-urad-utils/auth').default
    const knex = await dbinit()
    attachPaginate()
    await ApiModule.migrateDB(knex, null, tenantConfigs)

    const app = express()
    const appContext = { 
      express, knex, auth, 
      bodyParser: express.json(),
      ErrorClass: APIError,
      require: function(name) {
        try {
          return require(name)
        } catch (err) {
          console.error(err)
        }    
      }
    }
    const mwarez = ApiModule.init(appContext)
    const initReq = (req, res, next) => {
      req.tenantcfg = tenantConfigs
      next()
    }
    app.use(initReq, mwarez)

    initErrorHandlers(app)

    return new Promise((resolve, reject) => {
      g.server = app.listen(port, '127.0.0.1', (err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }

  g.close = async function() {
    g.sessionSrvcMock.close()
    g.server.close()
  }
}