import { invalidateEntityMW } from './routes.js'

function columnDefinition (config, table, knex) {
  let sb = table[config.type](config.name)
  if (config.rules && config.rules.indexOf('required') >= 0) {
    sb = sb.notNullable()
  }
  if (config.default) {
    sb.defaultTo(config.default)
  }
}

function createColumnsDefinition (table, config, knex) {
  config.attrs.map(a => {
    if (a.type !== undefined) {
      columnDefinition(a, table, knex)
    }
  })
}

export default async function migrateTenantConfig (config, knex, schema) {
  return migrate(Object.keys(config.collections), config, knex, schema)
}

async function migrate (tableNames, config, knex, schema) {
  const builder = schema ? knex.schema.withSchema(schema) : knex.schema
  const collectionName = tableNames.pop()
  const tableExists = await builder.hasTable(collectionName)
  if (tableExists) {
    // await Promise.all(_.each(config.attrs, a => {
    //   columnDefinition(a, table, knex) // TODO
    //   hasColumn
    // }))
  } else {
    await builder.createTable(collectionName, (table) => {
      table.increments('id').primary()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.string('createdby', 128).notNullable()
      createColumnsDefinition(table, config.collections[collectionName])
    })
  }
  invalidateEntityMW(config.orgid, collectionName)
  return tableNames.length > 0    // if there is any collection left
    ? migrate(tableNames, config, knex, schema) // recurse
    : 'ok'  // end elseway
}
