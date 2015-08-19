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
  opts.layout = opts.layout || 'partials/tag.hbt';
  opts.handle = opts.handle || 'tags';
  opts.metadataKey = opts.metadataKey || 'tags';
  opts.sortBy = opts.sortBy || 'title';
  opts.reverse = opts.reverse || false;
  opts.perPage  = opts.perPage || 0;
  opts.skipMetadata = opts.skipMetadata || false;

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
    // Using a for-loop so we don't incur the cost of creating a large array
    // of file names that we use to loop over the files object.
    for (var fileName in files) {
      var data = files[fileName];
      if (!data) {
        continue;
      }

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

        // Add each tag to our overall tagList.
        data[opts.handle].forEach(function(tag) {
          // Initialize array if it doesn't exist.
          if (!tagList[tag]) {
            tagList[tag] = [];
          }

          // Store a reference to where the file data exists to reduce our
          // overhead.
          tagList[tag].push(fileName);
        });
      }
    }

    // Add to metalsmith.metadata for access outside of the tag files.
    if (!opts.skipMetadata) {
      var metadata = metalsmith.metadata();
      metadata[opts.metadataKey] = metadata[opts.metadataKey] || {};
    }

    for (var tag in tagList) {
      // Map the array of tagList names back to the actual data object.
      // Sort tags via opts.sortBy property value.
      var posts = tagList[tag].map(function(fileName) {
        return files[fileName];
      }).sort(sortBy);

      // Reverse posts if desired.
      if (opts.reverse) {
        posts.reverse();
      }

      if (!opts.skipMetadata) {
        metadata[opts.metadataKey][tag] = posts;
      }

      // If we set opts.perPage to 0 then we don't want to paginate and as such
      // we should have all posts shown on one page.
      var postsPerPage = opts.perPage === 0 ? posts.length : opts.perPage;
      var numPages = Math.ceil(posts.length / postsPerPage);
      var pages = [];

      for (var i = 0; i < numPages; i++) {
        var pageFiles = posts.slice(i * postsPerPage, (i + 1) * postsPerPage);

        // Generate a new file based on the filename with correct metadata.
        var page = {
          layout: opts.layout,
          // TODO: remove this property when metalsmith-templates usage
          // declines.
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
    }

    // update metadata
    if (!opts.skipMetadata) {
      metalsmith.metadata(metadata);
    }

    done();
  };
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
