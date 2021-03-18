export default {
  name: 'posts',
  attrs: [
    {
      "name": "title",
      "component": "dyn-input",
      "field": true,
      "type": 'string',
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
      "name": "published",
      "type": 'date',
      "field": true,
      "component": "dyn-input",
      "inputtype": "date",
      "label": "Publikováno"
    },
    {
      "name": "content",
      "type": 'text',
      "label": "obsah",
      "component": "dyn-textarea"
    }
  ]
}
