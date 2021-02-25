import bodyParser from 'body-parser'
import methods from './methods'
import loadConfig from './config_manager'

export default async (ctx) => {
  const { knex, auth, app } = ctx
  const JSONBodyParser = bodyParser.json()
  const configs = await loadConfig(knex)

  app.get('/:name', (req, res, next) => {
    if (!configs[req.params.name]) return next(404)
    methods.list(req.params.name, req.query, configs, knex).then(info => {
      res.json(info)
      next()
    }).catch(next)
  })

  app.get('/_:name/config.json', (req, res, next) => {
    if (!configs[req.params.name]) return next(404)
    res.json(configs[req.params.name])
  })

  app.post('/:name',
    // auth.requireMembership(ROLE.PROJECT_INSERTER),
    JSONBodyParser,
    (req, res, next) => {
      if (!configs[req.params.name]) return next(404)
      methods.create(req.params.name, req.body, auth.getUID(req), configs, knex)
        .then(created => { res.status(201).json(created[0]) })
        .catch(next)
    })

  app.put('/:name/:id',
    // (req, res, next) => {
    //   methods.canIUpdate(req.params.id, auth.getUID(req), knex).then(can => {
    //     return can ? next() : next(401)
    //   }).catch(next)
    // },
    JSONBodyParser,
    (req, res, next) => {
      if (!configs[req.params.name]) return next(404)
      methods.update(req.params.name, req.params.id, req.body, configs, knex)
        .then(updated => { res.json(updated[0]) })
        .catch(next)
    })

  return app
}
