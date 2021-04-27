function solveFile(body) {
  const file = body.file
  delete body.file
  body.size = file.size
  body.ctype = file.type
  body.filename = file.name
}
function beforeCreate(body) {
  if (!body.file) throw new Error('no file specified')
  solveFile(body)
}

export default {
  name: 'files',
  beforeCreate: beforeCreate,
  beforeUpdate: solveFile,
  attrs: [
    {
      "name": "file",
      "component": "dyn-fileinput",
      "label": "Soubor"
    }, {
      "name": "nazev",
      "component": "dyn-input",
      "fieldcomponent": true,
      "label": "Nazev",
      "rules": "required",
      "type": 'string'
    }, {
      "name": "filename",
      "fieldcomponent": true,
      "type": 'string'
    }, {
      "name": "ctype",
      "fieldcomponent": true,
      "type": 'string'
    }, {
      "name": "size",
      "fieldcomponent": true,
      "type": 'integer'
    }
  ]
}