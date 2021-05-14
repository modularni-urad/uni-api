import express from 'express'
import cors from 'cors'
import { attachPaginate } from 'knex-paginate'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import initAuth from 'modularni-urad-utils/auth'
import initDB from 'modularni-urad-utils/db'
import initRoutes from './api/routes'

export async function init (mocks = null) {
  const knex = mocks ? await mocks.dbinit() : await initDB(false)
  attachPaginate()
  const app = express()
  app.use(cors())
  const auth = mocks ? mocks.auth : initAuth(app)

  initRoutes({ express, knex, auth, app })

  initErrorHandlers(app) // ERROR HANDLING
  return app
}

if (process.env.NODE_ENV !== 'test') {
  const host = process.env.HOST || '127.0.0.1'
  const port = process.env.PORT || 3000
  init().then(app => {
    app.listen(port, host, (err) => {
      if (err) throw err
      console.log(`frodo do magic on ${host}:${port}`)
    })
  }).catch(err => {
    console.error(err)
  })
}
