const path          = require('path'),
      fs            = require('fs'),
      gulp          = require('gulp'),
      sass          = require('gulp-sass')(require('sass')),
      plumber       = require('gulp-plumber'),
      connect       = require('gulp-connect'),
      notify        = require('gulp-notify'),
      pug           = require('gulp-pug'),
      rename        = require('gulp-rename'),
      uglify        = require('gulp-uglify'),
      sourcemaps    = require('gulp-sourcemaps'),
      changed       = require('gulp-changed'),
      cached        = require('gulp-cached'),
      autoprefixer  = require('gulp-autoprefixer'),
      debug         = require('gulp-debug'),
      data          = require('gulp-data'),
      imagemin      = require('gulp-imagemin'),
      webpack       = require("webpack"),
      webpackStream = require("webpack-stream"),
      webpackConfig = require("./webpack.config");

const mode = require('gulp-mode')({
  modes: ['prod', 'dev'],
  default: 'dev',
  verbose: false,
});


// PATH
const FILEPATH = {
  data: {
    json: './src/data/site.json'
  },
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
    img: './src/img/**/*',
    font: './src/font',
  }
};

const showPathObj = (obj) => {
  for (let i in obj) {
    for (let j  in obj[i]) {
      console.log(FILEPATH[i][j]);
    }
  }
  return false;
};

const server = (done) => {
  connect.server({
    root: './dest',
    livereload: true,
    port: 8080
  });
  done();
};


//scss Compile
const styles = () => {
  return (
    gulp.src(FILEPATH.src.scss)
    .pipe(debug({
      title: 'SCSS Compile =>'
    }))
    .pipe(sourcemaps.init())
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'scss Compile Failed', // show Any Title
        message: '<%= error.message %>' // Notie Error
      })
    }))
    .pipe(sass())
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 3 versions'],
      cascade: false
    }))
    // expanded, nested, compact, compressed
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(gulp.dest(FILEPATH.dest.css))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.write('./'))
    // .pipe(rename({
    //   suffix: '.min'
    // }))
    .pipe(gulp.dest(FILEPATH.dest.css))
    .pipe(connect.reload())
    // .pipe(notify('Compile'))
  );
};


const compress = [
  './src/js/bootstrap.bundle.js',
  './src/js/jquery.js',
  '!' + './src/js/bundle/*.js',
  '!' + './src/js/webpack.js',
];

// Wip
// JS Compile
const scripts = () => {
  return (
    gulp.src(compress)
    // .pipe(plumber())
    .pipe(gulp.dest(FILEPATH.dest.js))
    .pipe(uglify())
    // .pipe(rename({
    //   suffix: '.min'
    // }))
    .pipe(gulp.dest(FILEPATH.dest.js))
    .pipe(connect.reload())
  );
};


const html = () => {
  return (
    gulp.src('./dest/*.html')
    .pipe(plumber())
    .pipe(connect.reload())
  );
};


// All Pug Files => html Compile
const views = () => {
  const jsonData = JSON.parse(fs.readFileSync(FILEPATH.data.json));

  return (
    gulp.src(FILEPATH.src.pug, '!' + './src/pug/**/_*.pug')
    .pipe(debug({
      title: 'PugCompile =>'
    }))
    .pipe(changed(FILEPATH.dest.html))
    // .pipe(plumber())
    .pipe(pug({
      locals: jsonData,
      pretty: true
    }))
    .pipe(gulp.dest(FILEPATH.dest.html))
    // .pipe(connect.reload())
  );
};



// 更新があったファイルのみをコンパイル
// Pug => html
const singleviews = (file) => {
  const jsonData = JSON.parse(fs.readFileSync(FILEPATH.data.json));

  let expectPATH = 'src/pug/pages/';

  let targetFILE = file.replace(expectPATH, '');
  let destPATH = path.dirname(FILEPATH.dest.html + '/' + targetFILE);

  return (
    gulp.src(file)
    .pipe(debug({
      title: 'PugCompile =>',
      showCount: false
    }))
    .pipe(plumber({
      errorHandler: notify.onError({
        title: 'Pug Compile Failed', // Any message
        message: '<%= error.message %>' // show Error message
      })
    }))
    .pipe(pug({
      locals: jsonData,
      pretty: true
    }))
    .pipe(gulp.dest(destPATH))
    .pipe(notify('Compile'))
  );
};


// webpack
const bundleJs = () => {
  return webpackStream(webpackConfig, webpack)
  .pipe(gulp.dest(FILEPATH.dest.js));
}; 

// Image Comporess 
const images = done => {
    gulp.src('./src/img/**/*', {since : gulp.lastRun(images)})
    .pipe(mode.prod(imagemin([
      imagemin.optipng(),
      imagemin.gifsicle()
      ]
    )))
    .pipe(gulp.dest(FILEPATH.dest.img));
    done();
};

const copy = done => {
  flag = fs.existsSync('./src/favicon.ico');
  destflag = fs.existsSync('./dest/favicon.ico');

  if(flag && !destflag) {
    gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./dest/'));
  }
  done();
};

// gulp.watch(TargetFILE, Function)
function watchTask(done) {
  gulp.watch('*.html', html);
  gulp.watch(FILEPATH.src.scss, styles);
  gulp.watch(FILEPATH.src.js, scripts);
  gulp.watch(FILEPATH.src.img, images);
	gulp.watch(FILEPATH.src.js, bundleJs);

  var singlePUG = gulp.watch(FILEPATH.src.pug);
  singlePUG.on('change', (e, stats) => {
    singleviews(e);
  });
  done();
}



// const watch = gulp.parallel(watchTask);
const watch = gulp.parallel(watchTask, server);
const build = gulp.series(gulp.parallel(styles, scripts, html, views, images, bundleJs));

exports.server = server;
exports.images = images;
exports.styles = styles;
exports.scripts = scripts;
exports.bundleJs = bundleJs;
exports.html = html;
exports.views = views;
exports.copy = copy;
exports.watch = watch;
exports.build = build;
exports.default = watch;



const main = () => {
  console.log('call is main');

  // showPathObj(FILEPATH);
  return true;
};

// main();
