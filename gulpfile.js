const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync').create();
const useref = require('gulp-useref'); // js + css concatenation (make 1 file)
const uglify = require('gulp-uglify'); // js minification
const cleancss = require('gulp-clean-css'); // css minification
const gulpIf = require('gulp-if'); // conditionally run a task
const imagemin = require('gulp-imagemin'); // optimize images (reduce size)
const cache = require('gulp-cache'); // used for save optimized images in cache
const del = require('del'); // clean/delete unused files
const babel = require('gulp-babel'); // transpile es6 to es5 (no module support)
const nunjucksRender = require('gulp-nunjucks-render'); // template engine
// postcss
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer'); // automatically add vendor prefixes
const flexbugs = require('postcss-flexbugs-fixes'); // flexbox fixes

/* Development tasks
–––––––––––––––––––––––––––––––––––––––––––––––––– */

gulp.task('browserSync', (done) => { // Start browserSync local server
  browserSync.init({
    server: {
      baseDir: 'app',
    },
  });
  done();
});

gulp.task('nunjucks', (done) => { // build html files from templates and partials
  gulp.src('app/pages/**/*.+(nunjucks)')
    .pipe(nunjucksRender({ // render templates with nunjucks
      path: ['app/templates'],
    }))
    .pipe(gulp.dest('app')) // output files in app folder
    .pipe(browserSync.reload({ // browser refresh
      stream: true,
    }));
  done();
});

gulp.task('sass', (done) => {
  const processors = [
    autoprefixer(),
    flexbugs,
  ];
  gulp.src('app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError)) // Convert SCSS to CSS with gulp-sass, log errors to console
    .pipe(postcss(processors))
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({ // browser refresh
      stream: true,
    }));
  done();
});

gulp.task('watch', (done) => { // Watchers
  gulp.watch('app/**/*.nunjucks', gulp.series('nunjucks'));
  gulp.watch('app/scss/**/*.scss', gulp.series('sass'));
  // Reload browser whenever JS files change
  gulp.watch('app/js/**/*.js', browserSync.reload);
  done();
});

/* Build tasks (Optimization)
–––––––––––––––––––––––––––––––––––––––––––––––––– */

// Optimize CSS and JavaScript
gulp.task('useref', (done) => {
  gulp.src('app/*.html')
    .pipe(useref()) // concatenate
    .pipe(gulpIf('*.js', babel({ presets: ['@babel/preset-env'] }))) // transpile es6 to es5
    .pipe(gulpIf('*.js', uglify())) // minify only js files
    .pipe(gulpIf('*.css', cleancss({ compatibility: 'ie8' }))) // minify only css files
    .pipe(gulp.dest('dist'));
  done();
});

// Optimize images
gulp.task('images', (done) => {
  gulp.src('app/images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(cache(imagemin())) // cache minified images (only new/modified images get compressed)
    .pipe(gulp.dest('dist/images'));
  done();
});

// Cleaning
gulp.task('clean:dist', (done) => { // delete dist folder whenever task is run
  del.sync('dist');
  done();
});

/* Run sequences
–––––––––––––––––––––––––––––––––––––––––––––––––– */
gulp.task('default', gulp.series('nunjucks', gulp.parallel('sass', 'browserSync'), 'watch'), (done) => { done(); });
gulp.task('build', gulp.series('clean:dist', 'nunjucks', 'sass', gulp.parallel('useref', 'images')), (done) => { done(); });
