# metalsmith-tags

  A metalsmith plugin to create dedicated pages for tags in provided in metalsmith pages.

  **NOTE**: looking for new maintainers of this project. please consult [this issue for discussion.](https://github.com/totocaster/metalsmith-tags/issues/26)

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
      "path": "topics/:tag.html",
      "layout": "/partials/tag.hbt",
      /* Can also use deprecated template property.
      "template": "/partials/tag.hbt",
      */
      "normalize": true,
      "sortBy": "date",
      "reverse": true,
      "skipMetadata": false,
      "slug": {
        "mode": "rfc3986"
      }
    }
  }
}
```

## JavaScript Usage

  Pass the plugin to `Metalsmith#use`:

```js
var tags = require('metalsmith-tags');

metalsmith
  .use(tags({
    // yaml key for tag list in you pages
    handle: 'tags',
    // path for result pages
    path:'topics/:tag.html',
    // layout to use for tag listing
    layout:'/partials/tag.hbt',
    // Can also use `template` property for use with the (deprecated)
    // metalsmith-templates plugin. The `template` property is deprecated here
    // as well but still available for use.
    // template:'/partials/tag.hbt',
    // ------
    // Normalize special characters like ØçßÜ to their ASCII equivalents ocssü
    // makes use of the value assigned to the 'slug' property below
    normalize: true,
    // provide posts sorted by 'date' (optional)
    sortBy: 'date',
    // sort direction (optional)
    reverse: true,
    // skip updating metalsmith's metadata object.
    // useful for improving performance on large blogs
    // (optional)
    skipMetadata: false,
    // Use a non-default key in the metadata. Useful if you you want to
    // have two sets of tags in different sets with metalsmith-branch.
    metadataKey: "category",
    // Any options you want to pass to the [slug](https://github.com/dodo/node-slug) package.
    // Can also supply a custom slug function.
    // slug: function(tag) { return tag.toLowerCase() }
    slug: {mode: 'rfc3986'}
  }));
```

## Result

  This will generate `topics/[tagname].html` pages in your `build` directory with array of `pagination.files` objects on which you can iterate on. You can use `tag` for tag name in your layouts. (You can refer to tests folder for tags layout.)

  The `tags` property on your pages will remain, but it will be modified to an array of objects containing a `name` and `slug` property for each tag.

  You can use `metalsmith-permalink` to customize the permalink of the tag pages as you would do with anything else.

  It is possible to use `opts.metadataKey` for defining the name of the global tag list.
  By default it is `'tags'`.

### Normalized characters

  Handle with care. This is to be seen rather as a fallback as it heavily depends on your 'slug' settings. If you use the standard setting provided in this readme (*rfc3986*), you should be good to go.  Should fix [issue #48](https://github.com/totocaster/metalsmith-tags/issues/48).

## Pagination

  Additionally you can paginate your tag pages.  To do so add two additional properties to your configuration object, `pathPage` and `perPage`, and modify `path` to point to the root pagination location:

```json
{
  "handle": "tags",
  "path": "topics/:tag/index.html",
  "pathPage": "topics/:tag/:num/index.html",
  "perPage": 6,
  "layout": "/partials/tag.hbt",
  /* Can also use deprecated template property.
  "template": "/partials/tag.hbt",
  */
  "sortBy": "date",
  "reverse": true,
  "skipMetadata": false,
  "slug": {
    "mode": "rfc3986"
  }
}
```

  This will paginate your array of tags so that 6 appear per page, with additional tag pages being nested underneath the first page of tags.  For additional details please look at the tests.

## Contribution

  Feel free to contribute to this plug-in. Fork, commit, send pull request.
  Issues, suggestions and bugs are more than welcome.

  In case you add functionality, please write corresponding test. Test using `npm test`.

  Thanks!

## License

  MIT
