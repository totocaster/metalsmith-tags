/**
 * A metalsmith plugin to create dedicated pages for tags in posts or pages.
 *
 * @return {Function}
 */
function plugin(opts) {
  /**
   * Holds a mapping of tag names to an array of files with that tag.
   * @type {Object}
   */
  var tagList = {};

  opts = opts || {};
  opts.path = opts.path || 'tags/:tag/index.html';
  opts.pathPage = opts.pathPage || 'tags/:tag/:num/index.html';
  opts.template = opts.template || 'partials/tag.hbt';
  opts.handle = opts.handle || 'tags';
  opts.sortBy = opts.sortBy || 'title';
  opts.reverse = opts.reverse || false;
  opts.perPage  = opts.perPage || 0;

  return function(files, metalsmith, done) {
    var trimSafeTag = function(tag) {
      return tag.trim().replace(/ /g,'-');
    };

    var sortBy = function(a, b) {
      a = a[opts.sortBy];
      b = b[opts.sortBy];
      if (!a && !b) return 0;
      if (!a) return -1;
      if (!b) return 1;
      if (b > a) return -1;
      if (a > b) return 1;
      return 0;
    };

    var getFilePath = function(path, opts) {
      return path.replace(/:num/g, opts.num).replace(/:tag/g, opts.tag);
    };

    // Find all tags and their associated files.
    Object.keys(files).forEach(function(file) {
      var data = files[file];

      // If we have tag data for this file then turn it into an array of
      // individual tags where each tag has been sanitized.
      if (data[opts.handle]) {
        data[opts.handle] = data[opts.handle].split(',').map(trimSafeTag);

        // Add each tag to our overall tagList.
        data[opts.handle].forEach(function(tag) {
          if (!tagList[tag]) {
            tagList[tag] = [];
          }
          tagList[tag].push(data);
        });
      }
    });

    // Add to metalsmith.metadata for access outside of the tag files.
    var metadata = metalsmith.metadata();
    metadata.tags = metadata.tags || {};

    for (var tag in tagList) {
      var posts = tagList[tag].sort(sortBy);

      if (opts.reverse) {
        posts.reverse();
      }

      metadata.tags[tag] = posts;

      // If we set opts.perPage to 0 then we don't want to paginate and as such
      // we should have all posts shown on one page.
      var postsPerPage = opts.perPage === 0 ? posts.length : opts.perPage;
      var numPages = Math.ceil(posts.length / postsPerPage);
      var pages = [];

      for (var i = 0; i < numPages; i++) {
        var pageFiles = posts.slice(i * postsPerPage, (i + 1) * postsPerPage);

        // Generate a new file based on the filename with correct metadata.
        var page = {
          template: opts.template,
          contents: '',
          tag: tag,
          pagination: {
            num:   i + 1,
            pages: pages,
            tag:  tag,
            files: pageFiles
          }
        };

        // Render the non-first pages differently to the rest, when set.
        if (i > 0 && opts.pathPage) {
          files[getFilePath(opts.pathPage, page.pagination)] = page;
        } else {
          files[getFilePath(opts.path, page.pagination)] = page;
        }

        // Update next/prev references.
        var previousPage = pages[i - 1];
        if (previousPage) {
          page.pagination.previous = previousPage;
          previousPage.pagination.next = page;
        }

        pages.push(page);
      }
    }

    // update metadata
    metalsmith.metadata(metadata);

    done();
  };
}

/**
 * Expose `plugin`.
 */

module.exports = plugin;
