const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');

gulp.task('default', (done) => {
    console.log('Concating and moving all the css files in styles folder');

    gulp.src(['./public/styles/reset.css', './public/styles/**.css'])
        .pipe(concat('stylesheet.min.css'))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('./public/dist'));

    done();
});