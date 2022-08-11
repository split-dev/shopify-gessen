'use strict';

const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  changed = require('gulp-changed'),
  rename = require("gulp-rename"),
  sass = require('gulp-sass')(require('sass')),
  uglify = require('gulp-uglify-es').default,
  scsslint = require('gulp-scss-lint');

/**
 * Asset paths.
 */
const scssSrc = 'scss/**/*.scss';
const jsSrc = 'js/*.js';
const assetsDir = '../assets/';

/**
 * Scss lint
 */
gulp.task('scss-lint', function () {
  return gulp.src(scssSrc)
    .pipe(scsslint());
});

/**
 * SCSS task
 */
gulp.task('css', function () {
  return gulp.src('scss/*.output.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename(function (path) {
      path.basename = path.basename.replace('.output', '.min');
    }))
    .pipe(gulp.dest(assetsDir));
});

/**
 * JS task
 *
 * Note: you may or may not want to include the 2 below:
 * babel polyfill and jquery
 */
const jsFiles = [
  // './node_modules/babel-polyfill/dist/polyfill.js',
  // './node_modules/jquery/dist/jquery.slim.js',
  jsSrc,
];
const jsDest = assetsDir;

gulp.task('js', function () {
  return gulp.src(jsFiles)
    .pipe(gulp.dest(jsDest))
    .pipe(uglify())
    .pipe(rename(function (path) {
      path.basename += '.min';
    }))
    .pipe(gulp.dest(jsDest));
});

/**
 * Images task
 */
gulp.task('images', function () {
  return gulp.src('image/**')
    .pipe(changed(assetsDir)) // ignore unchanged files
    .pipe(gulp.dest(assetsDir))
});

/**
 * Fonts task
 */
gulp.task('fonts', function () {
  return gulp.src('font/**')
    .pipe(changed(assetsDir)) // ignore unchanged files
    .pipe(gulp.dest(assetsDir))
});

/**
 * Watch task
 */
gulp.task('watch', function () {
  gulp.watch(scssSrc, gulp.series('css'));
  gulp.watch(jsSrc, gulp.series('js'));
  gulp.watch('image/*.{jpg,jpeg,png,gif,svg}', gulp.series('images'));
  gulp.watch('font/*.{eot,svg,ttf,woff,woff2}', gulp.series('fonts'));
});

/**
 * Default task
 */
gulp.task('default', gulp.series('css', 'js', 'images', 'fonts', 'watch'));