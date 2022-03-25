var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', (done) => {
    console.log('Concating and moving all the css files in styles folder');
    gulp.src('./public/styles/**.css')
        .pipe(concat('stylesheet.min.css'))
        .pipe(gulp.dest('./public/dist'));

    done();
});