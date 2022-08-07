import init from './api/routes.js'
import migrateAll from './api/migrator.js'

async function migrateCollections(config, knex, schema) {
  await migrateAll(config, knex, schema)
}

async function migrateTenantConfig(keys2migrate, knex, configs) {
  const currKey = keys2migrate.pop()
  const config = configs[currKey]
  console.log(`----- uni: migration to schema ${config.orgid} start ------`)
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS "${config.orgid}"`)
  config.collections && await migrateCollections(config, knex, config.orgid)
  console.log(`----- uni: migration to schema ${config.orgid} ended ------`)
  return keys2migrate.length > 0 
    ? migrateTenantConfig(keys2migrate, knex, configs) : 'ok'
}

function migrateDB (knex, schemas = null, configs = null) {
  return configs.collections !== undefined
    ? migrateCollections(configs, knex) // configs are in fact single config
    : migrateTenantConfig(Object.keys(configs), knex, configs)
}

export default { init, migrateDB }