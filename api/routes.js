import bodyParser from 'body-parser'
import _ from 'underscore'
import methods from './methods'
import loadConfig from './config_manager'

export default (ctx) => {
  const { knex, auth, app } = ctx
  const JSONBodyParser = bodyParser.json()
  const configs = loadConfig(knex)

  app.get('/:name', _getConfig, (req, res, next) => {    
    methods.list(req.query, req.entityCfg, knex).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.get('/_:name/config.json', _getConfig, (req, res, next) => {
    res.json(req.entityCfg)
  })

  app.post('/:name',
    _getConfig,
    // auth.requireMembership(ROLE.PROJECT_INSERTER),
    JSONBodyParser,
    (req, res, next) => {
      methods.create(req.body, auth.getUID(req), req.entityCfg, knex)
        .then(created => { res.status(201).json(created[0]) })
        .catch(next)
    })

  app.put('/:name/:id',
    _getConfig,
    // (req, res, next) => {
    //   methods.canIUpdate(req.params.id, auth.getUID(req), knex).then(can => {
    //     return can ? next() : next(401)
    //   }).catch(next)
    // },
    JSONBodyParser,
    (req, res, next) => {
      const uid = auth.getUID(req)
      methods.update(req.params.id, req.body, uid, req.entityCfg, knex)
        .then(updated => { res.json(updated[0]) })
        .catch(next)
    })

  function _getConfig (req, res, next) {
    const domain = process.env.DOMAIN || req.hostname
    req.entityCfg = _.get(configs, [domain, req.params.name], null)
    return req.entityCfg ? next() : next(404)
  }

  return app
}
