const gulp = require('gulp');
const concat = require('gulp-concat');
const cleanCSS = require('gulp-clean-css');
const nodemon = require('gulp-nodemon');

gulp.task('dev', (done) => {

    let stream = nodemon({
        script: 'server.js',
        ext: 'html js css',
        ignore: 'stylesheet.min.css',
        tasks: ['concatCSS']
    });

    stream.on('restart', () => {
        console.log('restarted!');
    })
        .on('crash', () => {
            console.error('Application has crashed!\n');
            stream.emit('restart', 10);
        });

    done();
});

gulp.task('default', (done) => {

    gulp.src(['./public/styles/reset.css', './public/styles/**.css'])
        .pipe(concat('stylesheet.min.css'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public/dist'));

    done();
});


gulp.task('concatCSS', () => {
    return gulp.src(['./public/styles/reset.css', './public/styles/**.css'])
        .pipe(concat('stylesheet.min.css'))
        .pipe(cleanCSS({
            compatibility: 'ie8'
        }))
        .pipe(gulp.dest('./public/dist'));
});