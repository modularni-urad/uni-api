import path from 'path'
process.env.DATABASE_URL = ':memory:'
process.env.NODE_ENV = 'test'
process.env.CONF_FOLDER = path.resolve(path.dirname(__filename), '../confs')
