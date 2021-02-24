import fs from 'fs'
import path from 'path'
import _ from 'underscore'
import chokidar from 'chokidar'
import migrator from './migrator'

const CONF_FOLDER = path.resolve(process.env.CONF_FOLDER || './configs')
const configs = {}

export default async function load (knex) {
  const files = await fs.promises.readdir(CONF_FOLDER)
  await Promise.all(_.map(files, async f => {
    const config = require(path.join(CONF_FOLDER, f)).default
    await migrator(config, knex)
    configs[config.name] = config
    return config
  }))
  return configs
}

chokidar.watch(CONF_FOLDER).on('all', (event, path) => {
  console.log(event, path)
})