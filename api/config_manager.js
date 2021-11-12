import _ from 'underscore'
import migrator from './migrator'
import { createTableName } from './migrator'
import { setupOrgID } from 'modularni-urad-utils'

export async function RRRR (configs, knex) {
  setupOrgID(configs)
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