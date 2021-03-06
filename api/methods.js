
import { whereFilter } from 'knex-filter-loopback'
import _ from 'underscore'

export default { create, update, list }

function list (name, query, configs, knex) {
  const perPage = Number(query.perPage) || 10
  const currentPage = Number(query.currentPage) || null
  const fields = query.fields ? query.fields.split(',') : null
  const sort = query.sort ? query.sort.split(':') : null
  const filter = query.filter ? JSON.parse(query.filter) : null
  let qb = knex(name)
  qb = filter ? qb.where(whereFilter(filter)) : qb
  qb = fields ? qb.select(fields) : qb
  qb = sort ? qb.orderBy(sort[0], sort[1]) : qb
  return currentPage ? qb.paginate({ perPage, currentPage }) : qb
}

function create (name, data, author, configs, knex) {
  const editables = _.map(configs[name].attrs, i => i.name)
  data = _.pick(data, editables)
  data.createdby = author
  return knex(name).insert(data).returning('*')
}

function update (name, id, data, configs, knex) {
  const editables = _.map(configs[name].attrs, i => i.name)
  data = _.pick(data, editables)
  return knex(name).where({ id }).update(data).returning('*')
}

// function canIUpdate (id, user, knex) {
//   return knex(TNAMES.PROJEKTY).where({ id }).first().then(p => {
//     return Number(p.manager) === Number(user)
//   })
// }