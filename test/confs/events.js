export default {
  name: 'events',
  attrs: [
    {
      "name": "title",
      "type": 'string',
      "component": "dyn-input",
      "label": "Nazev",
      "rules": 'required'
    },
    {
      "name": "obrazek",
      "type": 'string',
      "component": "dyn-input",
      "label": "Obrazek"
    },
    {
      "name": "cas",
      "type": 'date',
      "component": "dyn-input",
      "label": "Cas"
    },
    {
      "name": "content",
      "type": 'text',
      "label": "obsah",
      "component": "dyn-textarea"
    }
  ]
}