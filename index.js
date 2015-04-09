var through = require('through2'),
    gutil = require('gulp-util'),
    git = require('gulp-git');

/**
 * @param opts {object} Module options, passed _also_ to underlying `git.tag`
 * @param opts.key {string?} The key in package.json from which version is read, defaults to 'version'
 * @param opts.prefix {string?} Prefix prepended to version when creating tag name, defaults to 'v'
 * @param opts.push {boolean?} Push tags tagging? Default: true
 * @param opts.version {string?} Alternatively, just pass the version string here. Default: undefined.
 */
module.exports = function (opts) {
    if (!opts) {
        opts = {};
    }
    if (!opts.key) {
        opts.key = 'version';
    }
    if (typeof opts.prefix === 'undefined') {
        opts.prefix = 'v';
    }
    if (typeof opts.message === 'undefined') {
        opts.message = 'Tagging as %VERSION%';
    }

    function modifyContents (file, enc, cb) {
        var version = opts.version; // OK if undefined at this time
        if (!opts.version) {
            if (file.isNull()) {
                return cb(null, file);
            }
            if (file.isStream()) {
                return cb(new Error('gulp-tag-version: streams not supported'));
            }

            var json = JSON.parse(file.contents.toString());
            version = json[opts.key];
        }

        var tag = opts.prefix + version;
        var message = opts.message.replace('%VERSION%', tag);

        gutil.log('Tagging as: ' + gutil.colors.cyan(tag));
        git.tag(tag, message, opts);

        cb(null, file);
    }

    return through.obj(modifyContents);
};
