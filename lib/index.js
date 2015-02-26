/**
 * Expose `plugin`.
 */

module.exports = plugin;


/**
 * A metalsmith plugin to create dedicated pages for tags in posts or pages.
 *
 * @return {Function}
 */

function plugin(opts) {
  var tagList = {};
  opts = opts || {};
  opts.path = opts.path || "tags";
  opts.template = opts.template || "partials/tag.hbt";
  opts.handle = opts.handle || 'tags';
  opts.sortBy = opts.sortBy || 'title';
  opts.reverse = opts.reverse || false;


  return function(files,metalsmith,done){
    var trimSafeTag = function(tag) {
      return tag.trim().replace(/ /g,"-");
    };

    var sortBy = function( a, b ) {
      a = a[opts.sortBy];
      b = b[opts.sortBy];
      if (!a && !b) return 0;
      if (!a) return -1;
      if (!b) return 1;
      if (b > a) return -1;
      if (a > b) return 1;
      return 0;
    };

    for (var file in files) {
      if (files[file][opts.handle]) {
        files[file][opts.handle] = files[file][opts.handle].split(",").map(trimSafeTag);
      }
      for (var tagIndex in files[file][opts.handle]) {
        var localTag = files[file][opts.handle][tagIndex];
        if (!tagList[localTag]) {
          tagList[localTag] = [];
        }
        tagList[localTag].push(files[file]);
      }
    }

    // Add to metalsmith.data for access outside of the tag files.
    var metadata = metalsmith.metadata();
    metadata.tags = metadata.tags || {};

    for (var tag in tagList) {
        var posts = tagList[tag].sort(sortBy);
        if ( opts.reverse ) {
          posts.reverse();
        }
        metadata.tags[tag] = posts;
        files[opts.path + '/' + tag + '.html'] = {
               template: opts.template,
               mode: '0644',
               contents: '',
               tag: tag,
               posts: posts
        };
    }

    // update metadata
    metalsmith.metadata(metadata);

    done();
  };
}
