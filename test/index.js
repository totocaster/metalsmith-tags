var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var layouts = require('metalsmith-layouts');
var tags = require('../lib');
var Handlebars = require('handlebars');
var moment = require('moment');
var slug = require('slug');

Handlebars.registerHelper('dateFormat', function(context, format) {
  var f = format || 'DD/MM/YYYY';
  return moment(new Date(context)).utcOffset('+0000').format(f);
});

describe('metalsmith-tags', function() {

  it('should modify comma separated tags into dehumanized array', function(done) {
    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path:'topics'
      }))
      .build(function(err,files){
        if (err) return done(err);
        assert.equal(files['index.html'].tags.toString(),[
          { name: 'hello', slug: 'hello'},
          { name: 'world', slug: 'world'},
          { name: 'this is', slug: 'this-is'},
          { name: 'tag', slug: 'tag'},
          { name: 'skol', slug: 'skol'},
        ].toString());
        done();
      });
  });

  it('should create a tags property to metalsmith.metadata', function(done) {
    var tagList;

    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics'
      }))
      .use(function(files, metalsmith, done) {
        tagList = metalsmith.metadata().tags;
        done();
      })
      .build(function(err, files){
        if (err) return done(err);
        var tagListKeys = Object.keys(tagList).sort();
        assert.deepEqual(tagListKeys, [
          'hello',
          'skol',
          'skØl',
          'sköl',
          'skøl',
          'tag',
          'this',
          'this is',
          'world',
        ]);
        // Ensure every object in the metadata tags array is a data object.
        tagListKeys.forEach(function(tagName) {
          var tagPostsArray = tagList[tagName];
          tagPostsArray.forEach(function(fileData) {
            assert.equal(typeof fileData, 'object');
            assert.ok(fileData.stats);
            assert.ok(fileData.contents);
            assert.ok(fileData.tags);
          });
        });
        done();
      });
  });
  
  it('should normalize special characters into their ascii equivalent using given slug function', function(done) {
    var tagList;

    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics',
        normalize: true,
      }))
      .use(function(files, metalsmith, done) {
        tagList = metalsmith.metadata().tags;
        done();
      })
      .build(function(err, files){
        if (err) return done(err);
        var tagListKeys = Object.keys(tagList).sort();
        assert.deepEqual(tagListKeys, [
          'hello',
          'skol',
          'tag',
          'this',
          'this-is',
          'world',
        ]);
        // Ensure every object in the metadata tags array is a data object.
        tagListKeys.forEach(function(tagName) {
          var tagPostsArray = tagList[tagName];
          tagPostsArray.forEach(function(fileData) {
            assert.equal(typeof fileData, 'object');
            assert.ok(fileData.stats);
            assert.ok(fileData.contents);
            assert.ok(fileData.tags);
          });
        });
        done();
      });
  });

  it('should add a urlSafe property to each tag post list', function(done) {
    var tagList;

    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics',
      }))
      .use(function(files, metalsmith, done) {
        tagList = metalsmith.metadata().tags;
        done();
      })
      .build(function(err, files){
        if (err) return done(err);
        var tagListKeys = Object.keys(tagList).sort();
        assert.deepEqual(tagListKeys, [
          'hello',
          'skol',
          'skØl',
          'sköl',
          'skøl',
          'tag',
          'this',
          'this is',
          'world',
        ]);
        // Ensure every object in the metadata tags array is a data object.
        tagListKeys.forEach(function(tagName) {
          var tagPostsArray = tagList[tagName];
          assert.ok(tagList[tagName].urlSafe);
          assert.equal(typeof tagList[tagName].urlSafe, 'string');
          assert.equal(slug(tagName, {mode: 'rfc3986'}), tagList[tagName].urlSafe);
        });
        done();
      });
  });

  it('should skip creating a tags property on metalsmith.metadata', function(done) {
    var tagList;

    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics',
        skipMetadata: true
      }))
      .use(function(files, metalsmith, done) {
        tagList = metalsmith.metadata().tags;
        done();
      })
      .build(function(err, files){
        if (err) return done(err);
        assert.equal(typeof tagList, 'undefined');
        done();
      });
  });

  var templateConfig = {
    engine: 'handlebars',
    directory: './',
    pattern: "topics/**/*.html"
  };

  it('should create tag page with post lists according to template and sorted by date decreasing', function(done) {
    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics/:tag.html',
        layout: './tag.hbt',
        normalize: true,
        sortBy: 'date',
        reverse: true
      }))
      .use(layouts(templateConfig))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/expected/no-pagination/topics', 'test/fixtures/build/topics');
        done();
      });
  });

  it('should create tag pages with pagination with post lists according to template and sorted by date decreasing', function(done) {
    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics/:tag/index.html',
        pathPage: 'topics/:tag/:num/index.html',
        perPage: 1,
        layout: './tag.hbt',
        normalize: true,
        sortBy: 'date',
        reverse: true
      }))
      .use(layouts(templateConfig))
      .build(function(err){
        if (err) return done(err);
        equal('test/fixtures/expected/pagination/topics', 'test/fixtures/build/topics');
        done();
      });
  });

  it('should support custom slug functions', function(done) {
    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path: 'topics',
        slug: function(tag) {
          return tag.toUpperCase();
        }
      }))
      .build(function(err, files) {
        if (err) return done(err);
        assert.equal(files['index.html'].tags.toString(),[
          { name: 'hello', slug: 'HELLO'},
          { name: 'world', slug: 'WORLD'},
          { name: 'this is', slug: 'THIS IS'},
          { name: 'tag', slug: 'TAG'},
          { name: 'skol', slug: 'SKOL'},
        ].toString());
        done();
      });
  })
});
