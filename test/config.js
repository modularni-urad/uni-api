/* global describe it */
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  return describe('config', () => {
    it('shall get posts config.json', async () => {
      const res = await r.get('/_posts/config.json')
      res.status.should.equal(200)
      res.body.attrs.should.have.lengthOf(4)
      res.body.attrs[0].name.should.equal('title')
    })
  })
}
