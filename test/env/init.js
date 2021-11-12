import path from 'path'
const SessionServiceMock = require('modularni-urad-utils/test/mocks/sessionService')

process.env.DATABASE_URL = ':memory:'
process.env.NODE_ENV = 'test'
process.env.SESSION_SERVICE_PORT = 24000
process.env.SESSION_SERVICE = `http://localhost:${process.env.SESSION_SERVICE_PORT}`
process.env.CONFIG_FOLDER = path.join(__dirname, '../configs')

const port = process.env.PORT || 3333
const g = {
  port,
  baseurl: `http://localhost:${port}`,
  mockUser: { id: 42 },
  sessionBasket: []
}
g.sessionSrvcMock = SessionServiceMock.default(process.env.SESSION_SERVICE_PORT, g)

g.InitApp = function (initFn) {
  const mocks = {
    dbinit: require('./dbinit').default
  }
  return initFn(mocks)
}

g.close = function() {
  g.sessionSrvcMock.close()
}

module.exports = g