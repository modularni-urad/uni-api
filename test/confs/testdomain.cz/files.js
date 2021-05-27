function beforeUpdate(body, existing, user) {
  if (body.file) {
    body.size = body.file.size
    body.ctype = body.file.type
    body.filename = body.file.name
    delete body.file
  }
}
function beforeCreate(body, user) {
  if (!body.file) throw new Error('no file specified')
  beforeUpdate(body)
}

export default {
  name: 'files',
  beforeCreate: beforeCreate,
  beforeUpdate: beforeUpdate,
  modifyGroups: 'fileupdater',
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