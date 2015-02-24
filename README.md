# metalsmith-tags

  A metalsmith plugin to create dedicated pages for tags in provided in metalsmith pages.

  > **IMPORTANT**: Due to change in my primary focus and lack of time, I no longer can mainteint this repository. Thus, I'm looking for someone who can continue delepoing it further. Please tweet me if interested.  

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

You can use different handle for the tags, by configuring the `handle` option. `tags` is the default.


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

  This will generate `topics/[tagname].html` pages in your `build` directory with array of `posts` objects on which you can iterate on. You can use `tag` for tag name in your templates. (You can refer to tests folder for tags template.)

  The `tags` property on your pages will remain but it will be modified to an array of String containing the tags.

  You can use `metalsmith-permalink` to customize the permalink of the tag pages as you would do with anything else.

## Contribution

  Feel free to contribute to this plug-in. Fork, commit, send pull request.
  Issues, suggestions and bugs are more than welcome.

  In case you add functionality, please write corresponding test. Test using `npm test`.

  Thanks!

## License

  MIT
