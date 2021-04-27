/* global describe it */
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p1 = {
    nazev: 'soubor 1'
  }
  const change = {
    nazev: 'pok1changed',
    file: {
      name: 'f2.md',
      size: 200,
      type: 'text/markdown'
    }
  }

  return describe('files', () => {

    it('shall create a new file', async () => {
      const file = {
        name: 'f1.md',
        size: 100,
        type: 'text/markdown'
      }
      const data = Object.assign({ file }, p1)
      const res = await r.post('/files').send(data)
      res.status.should.equal(201)
      // res.body.filename.should.equal(file.name)
      Object.assign(p1, { id: res.body })
    })

    it('shall update the file', () => {
      return r.put(`/files/${p1.id}`).send(change)
      .then(res => {
        res.should.have.status(200)
      })
    })

    it('shall get the file', async () => {
      const res = await r.get('/files')
      res.status.should.equal(200)
      res.body.should.have.lengthOf(1)
      res.body[0].nazev.should.equal(change.nazev)
      res.body[0].size.should.equal(change.file.size)
    })
  })
}
