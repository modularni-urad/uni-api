import express from 'express'
import cors from 'cors'
import { attachPaginate } from 'knex-paginate'
import initErrorHandlers from 'modularni-urad-utils/error_handlers'
import { 
  required, requireMembership, isMember, getUID 
} from 'modularni-urad-utils/auth'
import initDB from 'modularni-urad-utils/db'
import initRoutes from './api/routes'

export async function init (mocks = null) {
  const knex = mocks ? await mocks.dbinit() : await initDB(false)
  attachPaginate()
  const app = express()
  app.use(cors())
  const auth = { required, requireMembership, isMember, getUID }

  initRoutes({ express, knex, auth, app })

  initErrorHandlers(app) // ERROR HANDLING
  return app
}
