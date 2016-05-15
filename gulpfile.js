'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');

gulp.task('serve', function() {
  browserSync({
    open: true,
    server: {
      baseDir: 'src'
    }
  });
  gulp.watch(['src/*.html', 'src/*.js']).on('change', browserSync.reload);
})
