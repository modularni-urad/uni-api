import _ from 'underscore'
import methods from 'entity-api-base'
import loadConfig from './config_manager'

export default (ctx) => {
  const { knex, auth, app, express } = ctx
  const JSONBodyParser = express.json()
  const configs = loadConfig(knex)

  app.get('/:name', _getConfig, (req, res, next) => {
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : undefined
    methods.list(req.query, req.entityCfg, knex).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.get('/:name/config.json', _getConfig, (req, res, next) => {
    res.json(_.omit(req.entityCfg, 'tablename', 'domain'))
  })
  app.get('/:name/export.csv', _getConfig, (req, res, next) => {
    res.set({
      'Content-Type': 'text/csv',
      'Transfer-Encoding': 'chunked'
    })
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : undefined
    methods.csv_export(req.query, req.entityCfg, res, knex)
      .then(created => {
        res.end()
      })
      .catch(next)
  })

  app.post('/:name', _getConfig, auth.required, _canModify, JSONBodyParser, _checkData, (req, res, next) => {
    Object.assign(req.body, { createdby: req.user.id })
    req.entityCfg.beforeCreate && req.entityCfg.beforeCreate(req.body, req.user)
    console.log(req.body);
    methods.create(req.body, req.entityCfg, knex)
      .then(created => { res.status(201).json(created[0]) })
      .catch(next)
  })

  app.put('/:name/:id', _getConfig, auth.required, _canModify, JSONBodyParser, _checkData, async (req, res, next) => {
    try {
      const existing = await methods.get(req.params.id, req.entityCfg, knex)
      req.entityCfg.beforeUpdate && req.entityCfg.beforeUpdate(req.body, existing, req.user)
      const updated = await methods.update(req.params.id, req.body, req.entityCfg, knex)
      res.json(updated[0])
    } catch(err) {
      next(err)
    }
  })
  
  function _canModify (req, res, next) {
    function amIModifyer () {
      if (!req.entityCfg.modifyGroups) return true
      const required = req.entityCfg.modifyGroups.split(',')
      const i = _.intersection(required, req.user.groups)
      return i.length > 0
    }
    const canI = req.user && amIModifyer()
    return canI ? next() : next(401)
  }

  function _checkData (req, res, next) {
    try {
      methods.check_data(req.body, req.entityCfg)
      next()
    } catch (err) {
      next(err)
    }
  }

  function _getConfig (req, res, next) {
    const domain = process.env.DOMAIN || req.hostname
    req.entityCfg = _.get(configs, [domain, req.params.name], null)
    
    return req.entityCfg ? next() : next(404)
  }

  return app
}
