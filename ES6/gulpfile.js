var fs = require("fs"),
    gulp = require('gulp'),
    rename = require('gulp-rename'),
    browserSync = require('browser-sync'),
    gutil = require('gulp-util'),
    source = require('vinyl-source-stream'),
    assign = require('lodash.assign'),
    notify = require('gulp-notify'),
    minifycss = require('gulp-minify-css'),
    sass = require('gulp-sass'),
    browserify = require("browserify"),
    babelify = require('babelify');

var project_list = ['detector','qrcode','upload'];
var project = 'upload';

//browserify  所以项目的编译
var _bundleConfigs = [];
for (var project of project_list) {
    var _item = {
        entries: 'src/' + project + '/index.js',
        dest: 'build/' + project + '/',
        outputName: 'index.js'
    };
    _bundleConfigs.push(_item);
}

gulp.task('browserify', function(callback) {
    var bundleQueue = _bundleConfigs.length;

    var browserifyThis = function(bundleConfig) {

        var bundler = browserify({
            cache: {},
            packageCache: {},
            fullPaths: false,
            entries: bundleConfig.entries,
            debug: true
        });

        bundler.transform(babelify.configure({
            stage: 1
        }));

        var bundle = function() {

            return bundler
                .bundle()
                .on('error', function(err) {
                    console.log("Error : " + err.message);
                })
                .pipe(source(bundleConfig.outputName))
                .pipe(gulp.dest(bundleConfig.dest))
                .on('finish', reportFinished);
        };

        /*if (global.isWatching) {
            // Wrap with watchify and rebundle on changes
            bundler = watchify(bundler);
            // Rebundle on update
            bundler.on('update', bundle);
        }*/

        var reportFinished = function() {
            console.log(111)

            if (bundleQueue) {
                bundleQueue--;
                if (bundleQueue === 0) {
                    callback();
                }
            }
        };

        return bundle();
    };

    _bundleConfigs.forEach(browserifyThis);

});


// 单个项目的js编译
var _bundleOneConfigs = {
    entries: 'demo/' + project + '/js/app.js',
    dest: 'demo/' + project + '/js/',
    outputName: 'bundle.js'
};

gulp.task('browserify_one', function(callback) {
    var browserifyThis = function(bundleConfig) {
        var bundler = browserify({
            cache: {},
            packageCache: {},
            fullPaths: false,
            entries: bundleConfig.entries,
            debug: true
        });

        bundler.transform(babelify.configure({
            stage: 1
        }));

        var bundle = function() {
            return bundler
                .bundle()
                .on('error', function(err) {
                    console.log("Error : " + err.message);
                })
                .pipe(source(bundleConfig.outputName))
                .pipe(gulp.dest(bundleConfig.dest))
                .pipe(browserSync.stream({
                    stream: true
                }))
                .on('finish', callback);
        };


        return bundle();
    };

    browserifyThis(_bundleOneConfigs);
});

function browserSyncTask(callback) {
    // Serve files from the root of this project
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
    callback();
}

function sassTask(callback) {
    // Serve files from the root of this project
    gulp.src(['demo/' + project + '/sass/main.scss'])
        .pipe(sass())
        .on('error', gutil.log)
        .pipe(rename('app.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('demo/' + project + '/css/'))
        .pipe(browserSync.stream({
            stream: true
        }))
        .pipe(notify('app.css to build complete'))
        .on('finish', callback);
}

function watchTask() {
    gulp.watch(['src/' + project + '/**/*.js',
        'demo/' + project + '/js/app.js'
    ], gulp.series('browserify_one'));
    gulp.watch(['demo/' + project + '/sass/*.scss'], gulp.series(sassTask));
}

gulp.task('watch', gulp.series(
    browserSyncTask,
    gulp.parallel(sassTask, watchTask)
));

gulp.task('build', gulp.series(
    'browserify'
));