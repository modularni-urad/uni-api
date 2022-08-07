import _ from 'underscore'
import { newDb } from 'pg-mem'

export default function initDB () {
  const db = newDb();

  // create a Knex instance bound to this db
  //  =>  This replaces require('knex')({ ... })
  const knex = db.adapters.createKnex({ debug: true })

  return new Promise(resolve => resolve(knex))
}
