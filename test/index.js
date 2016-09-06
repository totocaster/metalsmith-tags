var assert = require('assert');
var Metalsmith = require('metalsmith');
var tags = require('../lib');

describe('metalsmith-tags', function() {
  describe('default behavior', function() {
    it('should convert comma separated page tags into sorted tag objects array', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags());
      builder.build(function(err, files) {
        if (err) return done(err);
        assert.deepEqual(files['index.html'].tags, {
          hello: { urlSafe: 'hello' },
          tag: { urlSafe: 'tag' },
          'this is': { urlSafe: 'this-is' },
          world: { urlSafe: 'world' }
        });
        done();
      });
    });

    it('should add tags object to metadata with tags sorted in ascending order', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags());
      builder.build(function(err, files) {
        if (err) return done(err);
        var tags = builder.metadata().tags;

        // check tags are sorted in ascending order
        assert.deepEqual(Object.keys(tags), ['hello', 'tag', 'this', 'this is', 'world']);
        done();
      });
    });

    it('should sort tagged files by title ascending', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags());
      builder.build(function(err, files) {
        if (err) return done(err);
        var tags = builder.metadata().tags;

        // check sort order for tagged files for 'hello' tag
        // title from json.html not included since it defines tags as array instead of comma separated string
        assert.deepEqual(tags['hello'].map(function(file) { return file.title; }), [
          'about',
          'test',
          'test page 2'
        ]);

        // check sort order for tagged files for 'tag' tag
        // title from json.html not included since it defines tags as array instead of comma separated string
        assert.deepEqual(tags['tag'].map(function(file) { return file.title; }), [
          'test',
          'test page 2'
        ]);

        // check sort order for tagged files for 'this' tag
        assert.deepEqual(tags['this'].map(function(file) { return file.title; }), [
          'test page 2'
        ]);

        // check sort order for tagged files for 'this is' tag
        assert.deepEqual(tags['this is'].map(function(file) { return file.title; }), [
          'test'
        ]);

        // check sort order for tagged files for 'world' tag
        assert.deepEqual(tags['world'].map(function(file) { return file.title; }), [
          'test'
        ]);

        done();
      });
    });

    it('should add property \'urlSafe\' to each tag in tag object', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags());
      builder.build(function(err, files) {
        if (err) return done(err);
        var tags = builder.metadata().tags;

        // check urlSafe property for all tags
        assert.equal(tags['hello'].urlSafe, 'hello');
        assert.equal(tags['tag'].urlSafe, 'tag');
        assert.equal(tags['this'].urlSafe, 'this');
        assert.equal(tags['this is'].urlSafe, 'this-is');
        assert.equal(tags['world'].urlSafe, 'world');

        done();
      });
    });

    it('should create tag pages with tagged pages sorted asc in page metadata', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags());
      builder.build(function(err, files) {
        if (err) return done(err);

        // check tag page for 'hello' tag
        var taggedFiles = files['tags/hello/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'about',
          'test',
          'test page 2'
        ]);

        // check tag page for `tag` tag
        taggedFiles = files['tags/tag/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test',
          'test page 2'
        ]);

        // check tag page for `this` tag
        taggedFiles = files['tags/this/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test page 2'
        ]);

        // check tag page for 'this is' tag
        taggedFiles = files['tags/this-is/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test'
        ]);

        // check tag page for 'world' tag
        taggedFiles = files['tags/world/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test'
        ]);

        done();
      });
    });

    it('should create paginated tag pages', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags({
        path: 'topics/:tag/index.html',
        pathPage: 'topics/:tag/:num/index.html',
        perPage: 2
      }));
      builder.build(function(err, files) {
        if (err) return done(err);

        // check tag pages for 'hello' tag

        // first tag page
        var taggedFiles = files['topics/hello/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'about',
          'test'
        ]);

        // second tag page
        taggedFiles = files['topics/hello/2/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test page 2'
        ]);

        // check tag pages for 'tag' tag

        // only one tag page
        taggedFiles = files['topics/tag/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test',
          'test page 2'
        ]);

        // check tag pages for 'this' tag

        // only one tag page
        taggedFiles = files['topics/this/index.html'].pagination.files;
        assert.deepEqual(taggedFiles.map(function(file) { return file.title; }), [
          'test page 2'
        ]);

        done();
      });
    });
  });

  describe('configuration options', function() {
    it('should sort tagged files by date ascending', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags({
        sortBy: 'date'
      }));
      builder.build(function(err, files) {
        if (err) return done(err);
        var tags = builder.metadata().tags;

        assert.deepEqual(tags['hello'].map(function(file) { return file.title; }), [
          'test page 2',
          'test',
          'about'
        ]);

        assert.deepEqual(tags['tag'].map(function(file) { return file.title; }), [
          'test page 2',
          'test'
        ]);

        done();
      });
    });

    it('should sort tagged files by date descending', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags({
        reverse: true,
        sortBy: 'date'
      }));
      builder.build(function(err, files) {
        if (err) return done(err);
        var tags = builder.metadata().tags;

        assert.deepEqual(tags['hello'].map(function(file) { return file.title; }), [
          'about',
          'test',
          'test page 2'
        ]);

        assert.deepEqual(tags['tag'].map(function(file) { return file.title; }), [
          'test',
          'test page 2'
        ]);

        done();
      });
    });

    it('should support a custom slug function', function(done) {
      var builder = Metalsmith('test/fixtures');
      builder.use(tags({
        slug: function(tag) { return tag.toUpperCase(); }
      }));
      builder.build(function(err, files) {
        if (err) return done(err);

        assert.deepEqual(files['index.html'].tags, {
          hello: { urlSafe: 'HELLO' },
          tag: { urlSafe: 'TAG' },
          'this is': { urlSafe: 'THIS IS' },
          world: { urlSafe: 'WORLD' }
        });

        done();
      });
    });
  });
});
