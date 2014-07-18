var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var templates = require('metalsmith-templates');
var tags = require('..');

describe('metalsmith-tags', function(){

	it('should modify comma separated tags into dehumanized array', function(done){
		Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path:'topics'
      }))
      .build(function(err,files){
        if (err) return done(err);
        assert.equal(files['index.html'].tags.toString(),["hello","world","this-is","tag"].toString());
        done();
      });
  });

  it('should create tag page wirh post lists acording to template', function(done){
    Metalsmith('test/fixtures')
      .use(tags({
        handle: 'tags',
        path:'topics',
        template:'/../tag.hbt'
      }))
      .use(templates({engine:'handlebars'}))
      .build(function(err,files){
        if (err) return done(err);
        equal('test/fixtures/expected/topics', 'test/fixtures/build/topics');
        done();
      });
  });

});
