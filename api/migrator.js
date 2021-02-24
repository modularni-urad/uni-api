import _ from 'underscore'

function columnDefinition (config, table, knex) {
  let sb = table[config.type](config.name)
  if (config.rules && config.rules.required) {
    sb = sb.notNullable()
  }
  if (config.default) {
    sb.defaultTo(config.default)
  }
}

export default async function (config, knex) {
  const tableExists = await knex.schema.hasTable(config.name)
  if (tableExists) {
    await Promise.all(_.each(config.attrs, a => {
      columnDefinition(a, table, knex)
    }))
  } else {
    await knex.schema.createTable(config.name, (table) => {
      table.increments('id').primary()
      table.timestamp('created').notNullable().defaultTo(knex.fn.now())
      table.timestamp('createdby').notNullable()
      _.each(config.attrs, a => {
        columnDefinition(a, table, knex)
      })
    })
  }
}

// hasColumn