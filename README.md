# metalsmith-tags

  A metalsmith plugin to create dedicated pages for tags in provided in metalsmith pages.

## Installation

    $ npm install metalsmith-tags

## Description in Pages

  In your pages:

```
---
title: This is page with tags
tags: tagged, page, metalsmith, plugin
---

Hello World
```

You can use different handle for tags, by configuting option. `tags` is default.


## CLI Usage

  Install the node modules and then add the `metalsmith-tags` key to your `metalsmith.json` plugins. The simplest use case just requires tag handle you want to use:

```json
{
  "plugins": {
    "metalsmith-tags": {
      "handle": "tags",
      "path": "topics",
      "template": "/partials/tag.hbt",
      "sortBy": "date",
      "reverse": true
    }
  }
}
```

## Javascript Usage

  Pass the plugin to `Metalsmith#use`:

```js
var tags = require('metalsmith-tags');

metalsmith
	.use(tags({
	    handle: 'tags',                  // yaml key for tag list in you pages
	    path:'topics',                   // path for result pages
	    template:'/partials/tag.hbt',    // template to use for tag listing
      sortBy: 'date',                  // provide posts sorted by 'date' (optional)
      reverse: true                    // sort direction (optional)
	}));
```

## Result

  This will generate `topics/[tagname].html` pages in your `biuld` directory with array of `posts` objects on which you can iterate on. You can use `tag` for tag name in your templates. (You can refer to tests folder for tags template.)

  After plug-in your pages will remain tag properties, but it will me modified to `Array` and won't remain as comma separated values.

  Use `metalsmith-permalink` to convert into a custom perma-link pattern to files, as you would do with anything else.

## Contribution

  Feel free to contribute to this plug-in. Fork, commit, send pull request.
  Issues, suggestions and bugs are more than welcome.

  In case you add functionality, please write corresponding test. Test using `npm test`.

  Thanks!

## License

  MIT