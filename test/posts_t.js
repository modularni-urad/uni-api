/* global describe it */
const chai = require('chai')
chai.should()
// import _ from 'underscore'

module.exports = (g) => {
  //
  const r = chai.request(g.baseurl)

  const p1 = {
    title: 'app1',
    obrazek: 'p1',
    published: '',
    content: 'fjdkjf'
  }

  return describe('posts', () => {
    // it('must not create a new item wihout approp group', async () => {
    //   const res = await r.post('/points').send(p1)
    //   res.status.should.equal(403)
    // })

    it('must not create a new post on wrong domain', async () => {
      const res = await r.post('/posts').send(p1)
        .set('Host', 'wrong.cz')
        .set('Authorization', 'Bearer f')
      res.status.should.equal(404)
    })


    it('shall create a new item p1', async () => {
      // g.mockUser.usergroups.push('waterman_admin')
      const res = await r.post('/posts').send(p1)
        .set('Host', 'api.domain1.cz')
        .set('Authorization', 'Bearer f')
      res.status.should.equal(201)
    })

    // it('shall update the item pok1', () => {
    //   const change = {
    //     name: 'pok1changed'
    //   }
    //   return r.put(`/tasks/${p.id}`).send(change)
    //   .set('Authorization', g.gimliToken)
    //   .then(res => {
    //     res.should.have.status(200)
    //   })
    // })

    it('shall get the pok1 with pagination', async () => {
      const res = await r.get('/posts?currentPage=1&perPage=10&sort=id:asc')
        .set('Host', 'api.domain1.cz')
      res.status.should.equal(200)
      res.body.data.should.have.lengthOf(1)
      res.body.data[0].title.should.equal(p1.title)
      res.body.pagination.currentPage = 1
    })

    it('shall get the pok1 with filter', async () => {
      const filter = JSON.stringify({ title: p1.title })
      const res = await r.get('/posts?filter=' + filter)
        .set('Host', 'api.domain1.cz')
      res.status.should.equal(200)
      res.body.should.have.lengthOf(1)
      res.body[0].title.should.equal(p1.title)
    })

    it('shall get csv export', async () => {
      const res = await r.get('/posts/export.csv').set('Host', 'api.domain1.cz')
      res.status.should.equal(200)
      res.headers['content-type'].indexOf('text/csv').should.equal(0)
    })
  })
}