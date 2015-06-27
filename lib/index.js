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
  opts.metadataKey = opts.metadataKey || 'tags';
  opts.sortBy = opts.sortBy || 'title';
  opts.reverse = opts.reverse || false;
  opts.perPage  = opts.perPage || 0;

  return function(files, metalsmith, done) {
    /**
     * Get a safe tag
     * @param {string} a tag name
     * @return {string} safe tag
     */
    function safeTag(tag) {
      return tag.replace(/ /g, '-');
    }

    /**
     * Sort tags by property given in opts.sortBy.
     * @param {Object} a Post object.
     * @param {Object} b Post object.
     * @return {number} sort value.
     */
    function sortBy(a, b) {
      a = a[opts.sortBy];
      b = b[opts.sortBy];
      if (!a && !b) {
        return 0;
      }
      if (!a) {
        return -1;
      }
      if (!b) {
        return 1;
      }
      if (b > a) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    }

    function getFilePath(path, opts) {
      return path
        .replace(/:num/g, opts.num)
        .replace(/:tag/g, safeTag(opts.tag));
    }

    // Find all tags and their associated files.
    for (var index in files) {
      var data = files[index];

      if (data) {
        var tagsData = data[opts.handle];

        // If we have tag data for this file then turn it into an array of
        // individual tags where each tag has been sanitized.
        if (tagsData) {
          if (typeof tagsData === 'string') {
            tagsData = tagsData.split(',');
          }

          // Save formatted tags data.
          // Trims leading + trailing white space from tag.
          data[opts.handle] = tagsData.map(function(tag) {
            return String(tag).trim();
          });

          var handle = data[opts.handle];

          // Add each tag to our overall tagList.
          for (var j = 0, tag = handle[0]; j < handle.length; j++) {

            if (!tagList[tag]) {
              tagList[tag] = [];
            }

            tagList[tag].push(index);
            tag = handle[j];
          }
        }
      }
    }

    // Add to metalsmith.metadata for access outside of the tag files.
    var metadata = metalsmith.metadata();

    metadata[opts.metadataKey] = metadata[opts.metadataKey] || {};

    Object.keys(tagList).forEach(function(tag) {
      // Sort tags via opts.sortBy property value.
      var posts = tagList[tag].sort(sortBy);

      // Reverse posts if desired.
      if (opts.reverse) {
        posts.reverse();
      }

      metadata[opts.metadataKey][tag] = posts;

      // If we set opts.perPage to 0 then we don't want to paginate and as such
      // we should have all posts shown on one page.
      var postsPerPage = opts.perPage === 0 ? posts.length : opts.perPage;
      var numPages = Math.ceil(posts.length / postsPerPage);
      var pages = [];

      for (var i = 0; i < numPages; i++) {
        var pageFiles = posts.slice(i * postsPerPage, (i + 1) * postsPerPage);

        for (var j = pageFiles.length - 1; j >= 0; j--) {
          pageFiles[j] = files[pageFiles[j]]
        };

        // Generate a new file based on the filename with correct metadata.
        var page = {
          template: opts.template,
          contents: '',
          tag: tag,
          pagination: {
            num: i + 1,
            pages: pages,
            tag: tag,
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
    });

    // update metadata
    metalsmith.metadata(metadata);

    done();
  };
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
