export default {
  name: 'posts',
  attrs: [
    {
      "name": "title",
      "component": "dyn-input",
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
      "component": "dyn-input",
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