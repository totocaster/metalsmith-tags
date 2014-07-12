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

  return function(files,metalsmith,done){
    var trimSafeTag = function(tag) {
      return tag.trim().replace(/ /g,"-");
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

    for (var tag in tagList) {
        files[opts.path + '/' + tag + '.html'] = {
               template: opts.template,
               mode: '0644',
               contents: '',
               tag: tag,
               posts: tagList[tag]
        };
    }
   done();
  };
}