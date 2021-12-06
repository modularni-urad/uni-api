const _entityMWDB = {}

export function invalidateEntityMW (tenantid, name) {
  delete _entityMWDB[[tenantid, name]]
}

export default (ctx) => {
  const { knex, auth, express, bodyParser, ErrorClass } = ctx
  const _ = ctx.require('underscore')
  const EntityMWBase = ctx.require('entity-api-base').default
  const app = express()

  app.get('/:name', _getConfig, (req, res, next) => {
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : undefined
    req.entityMW.list(req.query, req.tenantid).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.get('/:name/config.json', _getConfig, (req, res, next) => {
    res.json(_.omit(req.entityCfg, 'tablename'))
  })
  
  app.get('/:name/export.csv', _getConfig, (req, res, next) => {
    res.set({
      'Content-Type': 'text/csv',
      'Transfer-Encoding': 'chunked'
    })
    req.query.filter = req.query.filter ? JSON.parse(req.query.filter) : undefined
    req.entityMW.csv_export(req.query, res, req.tenantid)
      .then(created => {
        res.end()
      })
      .catch(next)
  })

  app.post('/:name', 
    _getConfig, auth.session, _required, _canModify, bodyParser, _checkData, 
    async (req, res, next) => {
      Object.assign(req.body, { createdby: req.user.id })
      try {
        const created = await req.entityMW.create(req.body, req.tenantid)
        res.status(201).json(created[0])
      } catch (err) {
        next(new ErrorClass(400, err.toString()))
      }
    })

  app.put('/:name/:id', _getConfig, auth.session, auth.required, 
    _canModify, bodyParser, _checkData, 
    async (req, res, next) => {
      try {
        const existing = await req.entityMW.get(req.params.id, req.tenantid)
        const updated = await req.entityMW.update(req.params.id, req.body, req.tenantid)
        res.json(updated[0])
      } catch(err) {
        next(new ErrorClass(400, err.toString()))
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
    return canI ? next() : next(new ErrorClass(401, 'i am not modifier'))
  }

  function _checkData (req, res, next) {
    try {
      req.entityMW.check_data(req.body)
      next()
    } catch (err) {
      next(new ErrorClass(400, 'wrong data'))
    }
  }

  function _createEntityMW (tenantid, name, entityCfg) {
    const config = {
      tablename: name,
      editables: entityCfg.editables || entityCfg.attrs.map(i => {
        return i.name
      })
    }
    const key = [tenantid, name]
    _entityMWDB[key] = EntityMWBase(config, knex, ErrorClass)
    return _entityMWDB[key]
  }

  function _getConfig (req, res, next) {
    req.entityCfg = _.get(req.tenantcfg, ['collections', req.params.name], null)
    req.entityMW = _entityMWDB[[req.tenantid, req.params.name]] || 
      _createEntityMW(req.tenantid, req.params.name, req.entityCfg)
    return req.entityCfg
      ? next() 
      : next(new ErrorClass(404, `unknown collection ${req.params.name}`))
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
