import fs from 'fs'
import path from 'path'
import _ from 'underscore'
import chokidar from 'chokidar'
import migrator from './migrator'

const CONF_FOLDER = path.resolve(process.env.CONF_FOLDER || './configs')
const configs = {}
const _beingLoaded = {}

export default function load (knex) {

  async function _loadConfig (file) {
    const config = require(file).default
    return config
  }

  chokidar.watch(CONF_FOLDER).on('add', async (filepath, stats) => {
    if (_beingLoaded[filepath]) return
    _beingLoaded[filepath] = true
    const domain = path.basename(path.dirname(filepath))
    configs[domain] = domain in configs ? configs[domain] : {}
    const config = await _loadConfig(filepath)
    config.domain = domain
    await migrator(config, knex)
    configs[domain][config.name] = config
    delete _beingLoaded[filepath]
  })
  
  chokidar.watch(CONF_FOLDER).on('change', (filepath, stats) => {
    console.log(filepath)
    // TODO: dodelat zmenu
  })

  return configs
}