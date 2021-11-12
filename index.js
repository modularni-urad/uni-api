import express from 'express'
import cors from 'cors'
import { attachPaginate } from 'knex-paginate'
import {
  auth,
  initDB,
  initErrorHandlers,
  GetConfigWatcher,
  setupCORS, CORSconfigCallback,
  loadOrgID
} from 'modularni-urad-utils'
import { RRRR as setupConfigs } from './api/config_manager'
import initRoutes from './api/routes'

export default async function init (mocks = null) {
  const knex = mocks ? await mocks.dbinit() : await initDB(false)
  attachPaginate()

  const confWatcher = GetConfigWatcher(process.env.CONFIG_FOLDER)
  const loadedPromise = new Promise((resolve, reject) => {
    confWatcher.on('loaded', configs => {
      setupCORS(configs)
      setupConfigs(configs, knex).then(resolve)
    })
    confWatcher.on('changed', (orgid, configs) => {
      setupConfigs(configs, knex)
      setupCORS(configs)
    })
  })
  
  const app = express()
  app.use(loadOrgID)
  process.env.NODE_ENV !== 'test' && app.use(cors(CORSconfigCallback))

  initRoutes({ express, knex, auth }, app)

  initErrorHandlers(app) // ERROR HANDLING
  await loadedPromise
  return app
}
