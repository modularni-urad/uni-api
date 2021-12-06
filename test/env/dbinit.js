import _ from 'underscore'
const Knex = require('knex')

export default function initDB () {
  const opts = {
    client: 'sqlite3',
    connection: {
      filename: process.env.DATABASE_URL
    },
    useNullAsDefault: true,
    debug: true
  }
  const knex = Knex(opts)

  return new Promise(resolve => resolve(knex))
}
