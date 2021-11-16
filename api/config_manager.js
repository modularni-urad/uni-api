import _ from 'underscore'
import migrator from './migrator'
import { createTableName } from './migrator'

export default function getConfigHook (knex) {

  return async function PrepareEntityConfigs (configs) {
    for (let orgid in configs) {
      for (let name in configs[orgid].collections) {
        const i = configs[orgid].collections[name]
        i.name = name
        i.orgid = orgid
        i.tablename = createTableName(i)
        i.editables = i.editables || _.reduce(i.attrs, (acc, i) => {
          acc.push(i.name)
          return acc
        }, [])
      }
    }
    return migrator(configs, knex)
  }
  
}