# metalsmith-tags

  A metalsmith plugin to create dedicated pages for tags in posts or pages.

## Installation

    $ npm install metalsmith-tags

## Javascript Usage

  Pass the plugin to `Metalsmith#use`:

```js
var tags = require('metalsmith-tags');

metalsmith
	.use(tags({
	    handle: 'tags', // how do you describe tags in your pages yaml
	    path:'topics', // path for result pages
	    template:'/partials/tag.hbt' // template to use for tag listing
	}));
```

  This will generate `/topics/[tagname].html` pages in your `biuld` directory with array of `posts` objects. You can use `tag` for tag name in your handlebars.

  Use `metalsmith-permalink` to convert into a custom permalink pattern to files, as you would do with anything else.

## Known Issues

* Only handlebars are tested at the moment.
* CLI tools are not tested.

## Contribution

  Feel free to contribute to this plugin. Fork, commit, send pull request.
  Issues, suggestions and bugs are more than welcome.
  Thanks!

## License

  MIT