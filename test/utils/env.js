import path from 'path'
process.env.PORT = 33333
process.env.DATABASE_URL = ':memory:'
process.env.NODE_ENV = 'test'
process.env.CONF_FOLDER = path.resolve(path.dirname(__filename), '../confs')
process.env.DOMAIN = 'testdomain.cz'
process.env.SESSION_SERVICE_PORT = 24000
process.env.SESSION_SERVICE = `http://localhost:${process.env.SESSION_SERVICE_PORT}`
