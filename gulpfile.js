var gulp    = require('gulp'),
    sass    = require('gulp-sass')(require('sass')),
    plumber = require('gulp-plumber'),
    connect = require('gulp-connect'),
    notify  = require('gulp-notify'),
    pug     = require('gulp-pug'),
    rename  = require('gulp-rename'),
    uglify  = require('gulp-uglify'),
    sourcemaps    = require('gulp-sourcemaps'),
    changed       = require('gulp-changed'),
    cached       = require('gulp-cached'),
    autoprefixer = require('gulp-autoprefixer');


var path = require('path');

//path
var paths = {
  dest: {
    html: './dest/',
    css: './dest/assets/css',
    js: './dest/assets/js',
    img: './dest/assets/img',
    font: './dest/assets/font',
  },
  src: {
    pug: './src/pug',
    scss: './src/scss',
    js: './src/js',
    img: './src/img',
    font: './src/font',
  }
};

function showPathObj(obj) {
  for (let i in obj) {
    for (let j  in obj[i]) {
     console.log(paths[i][j]);
    }
  }
  return false;
}

const main = () => {

  console.log('call is main');
  return true;
};
showPathObj(paths);

// paths.doc_root = './/';
// paths.css_src = 'src/sass/**/*.scss';
// paths.css_dist = paths.doc_root + 'dest/assets/css/';
// paths.js_src = 'src/**/*.js';


function reload(done) {
  connect.server({
    livereload: true,
    port: 8080
  });
  done();
}

function styles() {
  return (
    gulp.src('src/sass/styles.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest('dest/assets/css'))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('dest/assets/css'))
    .pipe(connect.reload())
  );
}


// function compileAllSass(done) {
//   return gulp.src('./app/**/*.scss')
//     .pipe(sourcemaps.init())
//     .pipe(plumber({
//       errorHandler: notify.onError({
//         title: 'scss Compile Failed', // 任意のタイトルを表示させる
//         message: '<%= error.message %>' // エラー内容を表示させる
//       })
//     }))
//     .pipe(sass())
//     .pipe(sourcemaps.write('./'))
//     .pipe(gulp.dest('./app/'))
//     .pipe(notify('Compile'));
//   done();
// }


function scripts() {
  return (
    gulp.src('src/js/scripts.js')
    .pipe(plumber())
    .pipe(gulp.dest('dest/assets/js'))
    .pipe(uglify())
    .pipe(rename('scripts.min.js'))
    .pipe(gulp.dest('dest/assets/js'))
    .pipe(connect.reload())
  );
}

function html() {
  return (
    gulp.src('./dest/*.html')
    .pipe(plumber())
    .pipe(connect.reload())
  );
}


// pug 処理
function views() {
  return (
    gulp.src('src/pug/pages/**/*.pug')
    .pipe(plumber())
    .pipe(pug({
        pretty: true
    }))
    .pipe(gulp.dest('./dest'))
    .pipe(connect.reload())
  );
}


// gulp.watch(ファイル, 処理)
function watchTask(done) {
  gulp.watch('*.html', html);
  gulp.watch('src/sass/**/*.scss', styles);
  gulp.watch('src/js/scripts.js', scripts);
  gulp.watch('src/pug/pages/**/*.pug', views);
  done();
}


var watch = gulp.parallel(watchTask, reload);
var build = gulp.series(gulp.parallel(styles, scripts, html, views));

exports.reload = reload;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.views = views;
exports.watch = watch;
exports.build = build;
exports.default = watch;
