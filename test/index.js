var assert = require('assert');
var equal = require('assert-dir-equal');
var Metalsmith = require('metalsmith');
var templates = require('metalsmith-templates');
var tags = require('..');
var Handlebars = require('handlebars');
var moment = require('moment');

Handlebars.registerHelper('dateFormat', function (context, format, block) {
    var f = format || "DD/MM/YYYY";
    return moment( new Date(context) ).format(f);
});

describe('metalsmith-tags', function () {

    it('should modify comma separated tags into dehumanized array', function (done) {
        Metalsmith('test/fixtures')
            .use(tags({
                handle: 'tags',
                path:'topics'
            }))
            .build(function (err, files) {
                if (err) return done(err);
                assert.equal(files['index.html'].tags.toString(),["hello","world","this-is","tag"].toString());
                done();
            });
    });

    it('should create tag page with post lists according to template and sorted by date decreasing', function (done) {
        Metalsmith('test/fixtures')
            .use(tags({
                handle: 'tags',
                path:'topics',
                template:'/../tag.hbt',
                sortBy: 'date',
                reverse: true
            }))
            .use(templates({engine:'handlebars'}))
            .build(function (err, files) {
                if (err) return done(err);
                equal('test/fixtures/expected/topics', 'test/fixtures/build/topics');
                done();
            });
    });

});
