var _ = require('lodash');
var slug = require('slug');
var sortObj = require('sort-object');

/**
 * A metalsmith plugin to create tag pages for tagged pages (usually posts).
 *
 * @return {Function}
 */
module.exports = function plugin(opts) {
  opts = opts || {};
  opts.path = opts.path || 'tags/:tag/index.html'; // default accomodates pagination
  opts.pathPage = opts.pathPage || 'tags/:tag/:num/index.html';
  opts.handle = opts.handle || 'tags';
  opts.metadataKey = opts.metadataKey || 'tags';
  opts.sortBy = opts.sortBy || 'title';
  opts.reverse = opts.reverse || false;
  opts.perPage = opts.perPage || 0;
  opts.slug = opts.slug || {mode: 'rfc3986'};

  /**
   * Get a safe tag
   * @param {string} a tag name
   * @return {string} safe tag
   */
  function safeTag(tag) {
    if (typeof opts.slug === 'function') {
      return opts.slug(tag);
    }

    return slug(tag, opts.slug);
  }

  function getFilePath(path, opts) {
    return path
      .replace(/:num/g, opts.num)
      .replace(/:tag/g, safeTag(opts.tag));
  }

  return function(files, metalsmith, done) {
    var metadata = metalsmith.metadata();
    var allTags = {}; // map tag names to array of tagged pages

    // Check all files in files object for tags.
    for (var fileName in files) {
      var file = files[fileName];
      if (!file) {
        continue;
      }

      var fileTags = file[opts.handle];

      // If tags for this file are defined, convert them into array of tags.
      if (fileTags && typeof fileTags === 'string') {
        // TODO in current implementation page tags need to be a comma separated string.
        // They should be defined as array.
        fileTags = fileTags.split(',');

        // Re-initialize tags handle as object.
        file[opts.handle] = {};

        fileTags.forEach(function(rawTag) {
          var tag = rawTag.trim();
          file[opts.handle][tag] = { urlSafe: safeTag(tag) };

          // Add file tag to allTags and initialize array of tagged pages.
          if (!allTags[tag]) {
            allTags[tag] = [];
          }

          // Store reference to tagged file.
          allTags[tag].push(file);
        });

        // sort file tags by name
        file[opts.handle] = sortObj(file[opts.handle]);
      }
    }

    // At his point object properties (tags) in allTags are not sorted.
    // Sort properties.
    allTags = sortObj(allTags);

    // At this point the array of files for each tag in allTags is not sorted.
    // Sort by property defined in opts.sortBy.
    for (var tag in allTags) {
      allTags[tag] = _.sortBy(allTags[tag], opts.sortBy);

      // Reverse posts if desired.
      if (opts.reverse) allTags[tag].reverse();

      // Add urlSafe property
      allTags[tag].urlSafe = safeTag(tag);

      // Compute paginations: create 1 or more tag pages for current tag.

      // If opts.perPage === 0 create only 1 page with all posts.
      var perTagPage = opts.perPage === 0 ? allTags[tag].length : opts.perPage;
      var numTagPages = Math.ceil(allTags[tag].length / perTagPage);
      var tagPages = [];

      for (var i = 0; i < numTagPages; i++) {
        var tagPageFiles = allTags[tag].slice(i * perTagPage, (i + 1) * perTagPage);

        // New paginated tag page.
        var tagPage = {
          layout: opts.layout,
          contents: '',
          pagination: {
            num: i + 1, // current page number
            tag: tag,
            pages: tagPages, // all tag pages for current tag
            files: tagPageFiles
          }
        };

        // Render the non-first pages differently to the rest, when set.
        if (i > 0 && opts.pathPage) {
          tagPage.path = getFilePath(opts.pathPage, tagPage.pagination);
        } else {
          tagPage.path = getFilePath(opts.path, tagPage.pagination);
        }

        // Add tag page to files.
        files[tagPage.path] = tagPage;

        // Update next/prev references.
        var prevTagPage = tagPages[i - 1];
        if (prevTagPage) {
          tagPage.pagination.previous = prevTagPage;
          prevTagPage.pagination.next = tagPage;
        }

        tagPages.push(tagPage);
      }
    }

    // Add allTags to metadata
    metadata[opts.metadataKey] = allTags;

    done();
  };
};
