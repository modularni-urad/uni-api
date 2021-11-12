import chai from 'chai'
const chaiHttp = require('chai-http')
chai.use(chaiHttp)

const g = require('./env/init')

describe('app', () => {
  before(done => {
    const TestedModule = require('../index')
    g.InitApp(TestedModule.default).then(app => {
      g.server = app.listen(g.port, '127.0.0.1', (err) => {
        if (err) return done(err)
        done()
      })
    }).catch(done)
  })
  after(done => {
    g.server.close()
    g.close()
    done()
  })

  describe('API', () => {
    //
    const submodules = [
      './posts_t',
      './files_t',
      './config_t'
    ]
    submodules.map((i) => {
      const subMod = require(i)
      subMod(g)
    })
  })
})
