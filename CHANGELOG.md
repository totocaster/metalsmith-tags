<a name="1.0.0"></a>
# 1.0.0

* Feature: Use [node-slug](https://github.com/dodo/node-slug) package when creating a page's slug.

<a name="0.13.0"></a>
# 0.13.0

* Feature: added better support for `metalsmith-pagination` plug-in.

<a name="0.12.0"></a>
# 0.12.0

* Feature: added new `tagsUrlSafe` property to every file, so there is access to url safe tag slugs.

<a name="0.11.0"></a>
# 0.11.0

* Feature: added support for metalsmith-layouts.

<a name="0.10.1"></a>
# 0.10.1

* Feature: allow skipping of updating of metadata.

<a name="0.10.0"></a>
# 0.10.0

* Performance: hopefully improve performance of metalsmith-tags with large blogs by
reducing overhead.

<a name="0.9.1"></a>
# 0.9.1

* Bugfix: When trimming a tag make sure it's a string.

<a name="0.9.0"></a>
# 0.9.0

* Bugfix: Don't convert spaces in tags to `-` for views. [#16](https://github.com/totocaster/metalsmith-tags/pull/16)
* Update dependencies.

<a name="0.8.1"></a>
# 0.8.1

* Adds support for arrays of tags [#3](https://github.com/totocaster/metalsmith-tags/pull/3)


<a name="0.8.0"></a>
# 0.8.0

* Support metalsmith `1.x` [#13](https://github.com/totocaster/metalsmith-tags/pull/13)
* Use `metalsmith.data()` so you can now manipulate the data later as you desire. [#13](https://github.com/totocaster/metalsmith-tags/pull/13)
* Unified code style.