
module.exports = (g) => {
  //
  const r = g.chai.request(g.baseurl)
  "files": {
    "modifyGroups": "fileupdater",
    "attrs": [{
      "name": "nazev",
      "component": "dyn-input",
      "fieldcomponent": true,
      "label": "Nazev",
      "rules": "required",
      "type": "string"
    }, {
      "name": "size",
      "fieldcomponent": true,
      "type": "integer"
    }]
  }
  const newConfig = `
domains:
  - api.huhu.cz

cors:
  - web1.domain3.cz

collections:
  files:
    modifyGroups: fileupdater
    attrs:
      - name: nazev
        component: dyn-input
        fieldcomponent: true
        label: Nazev
        rules: required
        type: string
      - name: size
        fieldcomponent: true
        type: integer  
  `

  return describe('config', () => {

    const fileName = path.join(process.env.CONFIG_FOLDER, '2.yaml')
    let origos = null

    before(async () => {
      origos = await fs.promises.readFile(fileName, 'utf-8')
    })

    after(async () => {
      await fs.promises.writeFile(fileName, origos, 'utf-8')
    })

    it('shall trigger events config added and return non 404 onwards', async () => {
      const res = await r.get('/api.domain2.cz/files?currentPage=1')
      res.status.should.equal(200)
      await fs.promises.writeFile(fileName, newConfig)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const res2 = await r.get('/api.domain2.cz/files?currentPage=1')
      res2.status.should.equal(404)
      const res3 = await r.get('/api.huhu.cz/files?currentPage=1')
      res3.status.should.equal(200)
    })

    // const p1 = {
    //   title: 'app1'
    // }
    // it('shall create a new item p1', async () => {
    //   // g.mockUser.usergroups.push('waterman_admin')
    //   const res = await r.post('/events').send(p1)
    //   res.status.should.equal(201)
    // })

  })
}
