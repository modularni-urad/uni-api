import _ from 'underscore'
import { APIError } from 'modularni-urad-utils'
import methods from 'entity-api-base'

export default (ctx, app) => {
  const { knex, auth, express } = ctx
  const JSONBodyParser = express.json()

  app.get('/:name', _getConfig, (req, res, next) => {
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : undefined
    methods.list(req.query, req.entityCfg, knex).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.get('/:name/config.json', _getConfig, (req, res, next) => {
    res.json(_.omit(req.entityCfg, 'tablename', 'orgid'))
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

  app.post('/:name', 
    _getConfig, auth.session, _required, _canModify, JSONBodyParser, _checkData, 
    async (req, res, next) => {
      Object.assign(req.body, { createdby: req.user.id })
      try {
        const created = await methods.create(req.body, req.entityCfg, knex)
        res.status(201).json(created[0])
      } catch (err) {
        next(new APIError(400, err.toString()))
      }
    })

  app.put('/:name/:id', _getConfig, auth.session, auth.required, 
    _canModify, JSONBodyParser, _checkData, 
    async (req, res, next) => {
      try {
        const existing = await methods.get(req.params.id, req.entityCfg, knex)
        const updated = await methods.update(req.params.id, req.body, req.entityCfg, knex)
        res.json(updated[0])
      } catch(err) {
        next(new APIError(400, err.toString()))
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
    return canI ? next() : next(new APIError(401, 'i am not modifier'))
  }

  function _checkData (req, res, next) {
    try {
      methods.check_data(req.body, req.entityCfg)
      next()
    } catch (err) {
      next(new APIError(400, 'wrong data'))
    }
  }

  function _getConfig (req, res, next) {
    req.entityCfg = _.get(req.config, ['collections', req.params.name], null)
    return req.entityCfg
      ? next() 
      : next(new APIError(404, `unknown collection ${req.params.name}`))
  }

  function _getSystemUser (req) {
    const found = _.find(_.keys(req.entityCfg.insertingIPs), i => {
      return req.ip === i
    })
    found && Object.assign(req, { user: { id: req.entityCfg.insertingIPs[found] }})
  }

  function _required (req, res, next) {
    req.entityCfg.insertingIPs && _getSystemUser(req)
    return req.user === undefined
      ? auth.required(req, res, next)
      : next()
  }

  return app
}
