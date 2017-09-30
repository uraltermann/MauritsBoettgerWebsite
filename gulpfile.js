const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref'); // js + css concatenation (make 1 file)
const uglify = require('gulp-uglify'); // js minification
const cssnano = require('gulp-cssnano'); // css minification
const gulpIf = require('gulp-if'); // conditionally run a task
const imagemin = require('gulp-imagemin'); // optimize images (reduce size)
const cache = require('gulp-cache'); // used for save optimized images in cache
const del = require('del'); // clean/delete unused files
const runSequence = require('run-sequence'); // specify sequence of tasks
const babel = require('gulp-babel'); // transpile es6 to es5 (no module support)
const nunjucksRender = require('gulp-nunjucks-render'); // template engine
// postcss
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer'); // automatically add vendor prefixes
const flexbugs = require('postcss-flexbugs-fixes'); // flexbox fixes

/* Development tasks
–––––––––––––––––––––––––––––––––––––––––––––––––– */

gulp.task('browserSync', () => { // Start browserSync local server
  browserSync.init({
    server: {
      baseDir: 'app',
    },
  });
});

gulp.task('nunjucks', () => { // build html files from templates and partials
  gulp.src('app/pages/**/*.+(nunjucks)')
    .pipe(nunjucksRender({ // render templates with nunjucks
      path: ['app/templates'],
    }))
    .pipe(gulp.dest('app')) // output files in app folder
    .pipe(browserSync.reload({ // browser refresh
      stream: true,
    }));
});

gulp.task('sass', () => {
  const processors = [
    autoprefixer({ browsers: ['Chrome >= 35', 'Firefox >= 38', 'Edge >= 12', 'Explorer >= 10', 'iOS >= 8', 'Safari >= 8', 'Android 2.3', 'Android >= 4', 'Opera >= 12'] }),
    flexbugs,
  ];
  gulp.src('app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError)) // Convert SCSS to CSS with gulp-sass, log errors to console
    .pipe(postcss(processors))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({ // browser refresh
      stream: true,
    }));
});

gulp.task('watch', () => { // Watchers
  gulp.watch('app/**/*.nunjucks', ['nunjucks']);
  gulp.watch('app/scss/**/*.scss', ['sass']);
  // Reload browser whenever JS files change
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

/* Build tasks (Optimization)
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// Optimize CSS and JavaScript
gulp.task('useref', () => {
  gulp.src('app/*.html')
    .pipe(useref()) // concatenate
    .pipe(gulpIf('*.js', babel({ presets: ['es2015'] }))) // transpile es6 to es5
    .pipe(gulpIf('*.js', uglify())) // minify only js files
    .pipe(gulpIf('*.css', cssnano())) // minify only css files
    .pipe(gulp.dest('dist'));
});

// Optimize images
gulp.task('images', () => {
  gulp.src('app/images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagemin())) // cache minified images (only new/modified images get compressed)
    .pipe(gulp.dest('dist/images'));
});

// Cleaning
gulp.task('clean:dist', () => { // delete dist folder whenever task is run
  del.sync('dist');
});

/* Run sequences
–––––––––––––––––––––––––––––––––––––––––––––––––– */
gulp.task('default', (callback) => {
  runSequence('nunjucks', ['sass', 'browserSync'], 'watch', callback);
});

gulp.task('build', (callback) => {
  runSequence('clean:dist', 'nunjucks', 'sass', ['useref', 'images'], callback);
});
