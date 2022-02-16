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
  debug = require('gulp-debug');

var path = require('path');


// PATH
const FILEPATH = {
  dest: {
    html: './dest',
    css: './dest/assets/css',
    js: './dest/assets/js',
    img: './dest/assets/img',
    font: './dest/assets/font',
  },

  src: {
    pug: './src/pug/pages/**/*.pug',
    scss: './src/scss/**/*.scss',
    js: './src/js/*.js',
    img: './src/img',
    font: './src/font',
  }
};


function showPathObj(obj) {
  for (let i in obj) {
    for (let j  in obj[i]) {
      console.log(FILEPATH[i][j]);
    }
  }
  return false;
}


function reload(done) {
  connect.server({
    livereload: true,
    port: 8080
  });
  done();
}

const styles = () => {
  return (
    gulp.src(FILEPATH.src.scss)
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'scss Compile Failed', // 任意のタイトルを表示させる
        message: '<%= error.message %>' // エラー内容を表示させる
      })
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest(FILEPATH.dest.css))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.write('./'))
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest(FILEPATH.dest.css))
    .pipe(connect.reload())
    .pipe(notify('Compile'))
  );
};


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


// Wip
const scripts = () => {
  return (
    gulp.src(FILEPATH.src.js)
    .pipe(plumber())
    .pipe(gulp.dest(FILEPATH.dest.js))
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(FILEPATH.dest.js))
    .pipe(connect.reload())
  );
};


// Wip
const html = () => {
  return (
    gulp.src('./dest/*.html')
    .pipe(plumber())
    .pipe(connect.reload())
  );
};


// Wip
// Pug => html Compile
const views = () => {
  return (
    gulp.src(FILEPATH.src.pug)
    .pipe(debug())
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(FILEPATH.dest.html))
    .pipe(connect.reload())
  );
};


// Wip
// gulp.watch(ファイル, 処理)
function watchTask(done) {
  gulp.watch('*.html', html);
  gulp.watch(FILEPATH.src.scss, styles);
  gulp.watch(FILEPATH.src.js, scripts);
  gulp.watch(FILEPATH.src.pug, views);
  // target_pug.on('change', function(e, stats) {
  //   views(e);
  // });
  done();
}


const watch = gulp.parallel(watchTask, reload);
const build = gulp.series(gulp.parallel(styles, scripts, html, views));

exports.reload = reload;
exports.styles = styles;
exports.scripts = scripts;
exports.html = html;
exports.views = views;
exports.watch = watch;
exports.build = build;
exports.default = watch;



const main = () => {
  console.log('call is main');

  styles();

  showPathObj(FILEPATH);
  return true;
};

main();
