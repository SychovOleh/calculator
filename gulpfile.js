const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');
const clean = require('gulp-clean');
const babel = require("gulp-babel");
const autoprefixer = require('gulp-autoprefixer');


gulp.task('sass', function() {
  return gulp.src('./src/styles/main.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      browsers: ['last 7 versions'],
      cascade: false
    }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('scripts', function() {
  return gulp.src('./src/**/*.js')
    .pipe(babel({
      "presets": ["env"]
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./dist'));
});

gulp.task('watch', ['sass', 'scripts'], function() {
  gulp.watch('./src/styles/**/*.scss', ['sass']);
  gulp.watch('./src/js/**/*.js', ['scripts']);
});