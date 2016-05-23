/**
 * Created by atassi on 16/02/2016.
 */
const gulp = require('gulp');
const mocha = require('gulp-mocha');
var exit = require('gulp-exit');
var server = require( 'gulp-develop-server' );


gulp.task('start', function () {
  server.listen( { path: './server.js' } );
});

gulp.task('api-tests', ['start'], function() {
  gulp
    .src(['test/spec/rest_api/api.js']).
    pipe(mocha());
});

gulp.task('converters-tests', ['frustum-cullings-tests'], function() {
  gulp
    .src(['test/spec/converters/converters_test.js']).
    pipe(mocha())
});

gulp.task('frustum-cullings-tests',['api-tests'], function() {
  gulp
      .src(['test/spec/3DOptimization/FrustumCulling.js']).
  pipe(mocha()).pipe(exit());

});


gulp.task('default', ['converters-tests']);
