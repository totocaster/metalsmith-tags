# metalsmith-tags

  A metalsmith plugin to add tag pages to Metalsmith's `files` object.

  **NOTE**: We are looking for new maintainers for this project. Please consult [this issue for discussion.](https://github.com/totocaster/metalsmith-tags/issues/26)

## Installation

    $ npm install --save metalsmith-tags

## How to tag pages

Add your tags to the frontmatter as comma separated strings using the `tags` handle:

```
---
title: This is a tagged page
tags: tagged, page, metalsmith, plugin
---

Hello World
```

You can configure a different tags handle with the `handle` option.

This plugin currently does not support tagging using arrays. With a YAML frontmatter tags defined like this

```
---
tags:
  - tag 1
  - tag 2
  - tag 3
---
```

are ignored. Likewise, tags defined with an array in a JSON frontmatter like this

```
---
{
  "tags": ["tag 1", "tag 2", "tag 2"],
}
---
```

are ignored as well.

## JSON configuration

```json
{
  "plugins": {
    "metalsmith-tags": {
      "handle": "tags",
      "path": "topics/:tag.html",
      "layout": "/partials/tag.hbt",
      "sortBy": "date",
      "reverse": true,
      "slug": {
        "mode": "rfc3986"
      }
    }
  }
}
```

## Programmatic configuration

```js
var tags = require('metalsmith-tags');

metalsmith
  .use(tags({
    // YAML key for tag list in you pages
    handle: 'tags',
    // path for result pages
    path:'topics/:tag.html',
    // layout to use for tag listing
    layout:'/partials/tag.hbt',
    // provide posts sorted by 'date' (optional)
    sortBy: 'date',
    // sort direction (optional)
    reverse: true,
    // Any options you want to pass to the [slug](https://github.com/dodo/node-slug) package.
    // Can also supply a custom slug function.
    // slug: function(tag) { return tag.toLowerCase() }
    slug: {mode: 'rfc3986'}
  }));
```

## Metadata

This plugin alters the following metadata.

### Page metadata

The `tags` handle on tagged pages is converted into an array of sorted tag objects. The following tags

```
tags: tag, another tag, yet another tag
```

results in

```
tags: [
  { name: 'another tag', urlSafe: 'another-tag' },
  { name: 'tag', urlSafe: 'tag' },
  { name: 'yet another tag', 'yet-another-tag' }
]
```

You can use the resulting `tags` array to create links to tag pages.

### Global tags object

This plugin adds object `tags` with all tags to the global metadata. `tags` has the following structure:

```
{
  tag 1: [page objects of pages tagged with tag 1],
  tag 2: [page objects of pages tagged with tag 2],
  ...
}
```

Page objects are references to page objects in Metalsmith's `files`. You can access the `urlSafe` version like this:

```
tags['tag 1'].urlSafe
```

Note: the global `tags` object is not accessible on pages that have a `tags` handle. You can use `opts.metadataKey` to rename global tags object.

## Pagination

Tag pages can be paginated. Pagination requires the following pagination properties in the plugin configuration:

- `path` should be set to the location of the first pagination page, e.g. `tags/:tag/index.html`.
- `pathPage` should be set to the location of following pagination pages, e.g. `tags/:tag/:num/index.html`.
- `perPage` indicated the number of tagged files per page.

The default for `perPage` is `0`, which turns off pagination. This means that only one tag page per tag is generated.

Pagination does two things:

1. It adds the pagination pages to `files` so subsequent plugins such as [`metalsmith-layouts`](https://github.com/superwolff/metalsmith-layouts) can process them.
2. It adds a `pagination` object to each generated page. You can access assigned files via `pagination.files`, the previous pagination page via `pagination.previous` and the following pagination page via `pagination.next`.

## Contribution

Feel free to contribute to this plug-in. Fork, commit, send pull request. Issues, suggestions and bugs are more than welcome. Please make sure that `npm test` passes before submitting a pull request.

In case you add functionality, please write corresponding tests.

Thanks!

## License

MIT
