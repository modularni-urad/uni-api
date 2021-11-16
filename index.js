import express from 'express'
import cors from 'cors'
import { attachPaginate } from 'knex-paginate'
import { auth, initDB, initErrorHandlers,
  initConfigManager,
  CORSconfigCallback, createLoadOrgConfigMW } from 'modularni-urad-utils'
import ConfigManager from './api/config_manager'
import initRoutes from './api/routes'

export default async function init (mocks = null) {
  const knex = mocks ? await mocks.dbinit() : await initDB(false)
  attachPaginate()
  await initConfigManager(process.env.CONFIG_FOLDER, ConfigManager(knex))
  
  const app = express()
  process.env.NODE_ENV !== 'test' && app.use(cors(CORSconfigCallback))

  const api = express()
  initRoutes({ express, knex, auth }, api)

  app.use('/:domain/', createLoadOrgConfigMW(req => req.params.domain), api)

  initErrorHandlers(app) // ERROR HANDLING
  return app
}
