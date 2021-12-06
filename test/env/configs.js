export default {
  collections: {
    "posts": {
      "attrs": [{
        "name": "title",
        "component": "dyn-input",
        "field": true,
        "type": "string",
        "label": "Nazev",
        "rules": "required"
      }, {
        "name": "obrazek",
        "component": "dyn-input",
        "field": true,
        "type": "string",
        "label": "Obrazek"
      }, {
        "name": "published",
        "component": "dyn-input",
        "inputtype": "date",
        "field": true,
        "type": "date",
        "label": "Publikováno"
      }, {
        "name": "content",
        "component": "dyn-textarea",
        "field": true,
        "type": "text",
        "label": "obsah"
      }]
    }
  }
}