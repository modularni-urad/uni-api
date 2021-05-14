/* global describe it */
import fs from 'fs'
import path from 'path'
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)
  const newConfig = `export default {
    name: 'events',
    attrs: [
      {
        "name": "title",
        "type": 'string',
        "component": "dyn-input",
        "label": "Nazev",
        "rules": 'required'
      }
    ]
  }`
  const fileName = path.join(process.env.CONF_FOLDER, process.env.DOMAIN, 'events.js')

  return describe('config', () => {

    after(async () => {
      try {
        await fs.promises.unlink(fileName)
      } catch (_) {}
    })

    it('shall get posts config.json', async () => {
      const res = await r.get('/_posts/config.json')
      res.status.should.equal(200)
      res.body.attrs.should.have.lengthOf(4)
      res.body.attrs[0].name.should.equal('title')
    })

    it('must NOT get any events', async () => {
      const res = await r.get('/events')
      res.status.should.equal(404)
    })

    it('shall trigger events config added and return non 404 onwards', async () => {
      await fs.promises.writeFile(fileName, newConfig)
      await new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 1500)
      })
      const res = await r.get('/events')
      res.status.should.equal(200)
      res.body.should.have.lengthOf(0)
    })

  })
}
