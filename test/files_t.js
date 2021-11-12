/* global describe it */
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p1 = {
    nazev: 'soubor 1',
    size: 77391
  }
  const change = {
    nazev: 'pok1changed'
  }

  return describe('files', () => {

    it('must not create a new file without approp group', async () => {
      const res = await r.post('/files').send(p1)
        .set('Host', 'api.domain2.cz')
        .set('Authorization', 'Bearer f')
      res.status.should.equal(401)
    })

    it('must not create a new post on wrong domain', async () => {
      g.mockUser.groups = [ 'fileupdater' ]
      const res = await r.post('/files').send(p1)
        .set('Host', 'api.domain1.cz')
        .set('Authorization', 'Bearer f')
      res.status.should.equal(404)
    })

    it('shall create a new file', async () => {
      const res = await r.post('/files').send(p1)
        .set('Authorization', 'Bearer f')
        .set('Host', 'api.domain2.cz')
      res.status.should.equal(201)
      const res2 = await r.get('/files?currentPage=1').set('Host', 'api.domain2.cz')
      res2.body.data[0].nazev.should.equal(p1.nazev)
      Object.assign(p1, { id: res2.body.data[0].id })
    })

    it('shall update the file', async () => {
      const res = await r.put(`/files/${p1.id}`).send(change)
        .set('Authorization', 'Bearer f')
        .set('Host', 'api.domain2.cz')
      res.should.have.status(200)
    })

    it('shall get the file', async () => {
      const res = await r.get('/files?currentPage=1').set('Host', 'api.domain2.cz')
      res.status.should.equal(200)
      res.body.data.should.have.lengthOf(1)
      res.body.data[0].nazev.should.equal(change.nazev)
    })
  })
}
