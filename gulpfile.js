const path          = require('path'),
      fs            = require('fs'),
      {src, dest, watch, series, parallel, lastRun} = require('gulp'),
      sass          = require('gulp-sass')(require('sass')),
      cleanCss      = require('gulp-clean-css'),
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
      concat        = require('gulp-concat'),
      browserSync   = require('browser-sync'),
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


// ローカルサーバ起動
const buildServer = done => {
  browserSync.init({
    server: {
      baseDir: './dest/'
    }
  });
  done();
};

// ブラウザ自動リロード
const browserReload = done => {
  browserSync.reload();
  done();
};


// All Pug Files => html Compile
const views = () => {
  const jsonData = JSON.parse(fs.readFileSync(FILEPATH.data.json));

  return (
    src(FILEPATH.src.pug, '!' + './src/pug/**/_*.pug')
    .pipe(debug({
      title: 'PugCompile =>'
    }))
    .pipe(changed(FILEPATH.dest.html))
    // .pipe(plumber())
    .pipe(pug({
      locals: jsonData,
      pretty: true
    }))
    .pipe(dest(FILEPATH.dest.html))
    // .pipe(connect.reload())
  );
};


// Pug => html
const singleviews = (file) => {
  const jsonData = JSON.parse(fs.readFileSync(FILEPATH.data.json));

  let expectPATH = 'src/pug/pages/';

  let targetFILE = file.replace(expectPATH, '');
  let destPATH = path.dirname(FILEPATH.dest.html + '/' + targetFILE);

  return (
    src(file)
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
    .pipe(dest(destPATH))
    // .pipe(notify('Pug Compile'))
  );
};

//SCSS Compile
const styles = () => {
  return (
    src(FILEPATH.src.scss, '!' + '.src/scss/_lib/*')
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
    // .pipe(sass({outputStyle: 'expanded'}))
    // .pipe(dest(FILEPATH.dest.css))
    // .pipe(sass({outputStyle: 'compressed'}))
    .pipe(sourcemaps.write('./'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(mode.prod(cleanCss()))
    .pipe(dest(FILEPATH.dest.css))
    .pipe(connect.reload())
    // .pipe(notify('SCSS Compile'))
  );
};


// JS Compile
const scripts = () => {
  return (
    src(
      './src/js/jquery.js',
      './src/js/bootstrap.bundle.js',
      // './node_modules/jquery/dist/jquery.js',
      // './node_modules/bootstrap/dist/js/bootstrap.bundle.js',
      '!' + './src/js/lib/*.js',
      '!' + './src/js/bundle/*.js',
      '!' + './src/js/main.js',
    )
    .pipe(plumber())
    .pipe(uglify())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(dest(FILEPATH.dest.js))
    .pipe(connect.reload())
  );
};



// webpack
const bundleJs = () => {
  return webpackStream(webpackConfig, webpack)
  .pipe(dest(FILEPATH.dest.js));
};


// CSS 外部ライブラリ 結合
const concatCss = done => {
  src([
    './src/scss/_lib/_slick-theme.scss',
    './src/scss/_lib/_slick.scss',
    'node_modules/animsition/dist/css/animsition.css',

  ])
  .pipe(concat('lib.css'))
  .pipe(sass())
  // .pipe(sass({outputStyle: 'compressed'}))
  .pipe(sourcemaps.write('./'))
  .pipe(rename({
    suffix: '.min'
  }))
  .pipe(dest(FILEPATH.dest.css));
  done();
};

// JS 外部ライブラリ 結合
const concatJs = done => {
  src([
    // './src/js/_lib/slick.js',
    // './src/js/_lib/gsap.min.js',
    // './src/js/_lib/ofi.min.js',
    // './src/js/_lib/animsition.min.js',
    './node_modules/slick-carousel/slick/slick.min.js',
    './node_modules/gsap/dist/gsap.min.js',
    './node_modules/object-fit-images/dist/ofi.min.js',
    './node_modules/animsition/dist/js/animsition.min.js',
    './src/js/_lib/inview.js',
 ])
  .pipe(concat('lib.js'))
  .pipe(dest(FILEPATH.dest.js));
  done();
};

// Image Comporess
const images = done => {
    src('./src/img/**/*', {since : lastRun(images)})
    .pipe(mode.prod(imagemin([
      imagemin.optipng(),
      imagemin.gifsicle()
      ]
    )))
    .pipe(dest(FILEPATH.dest.img));
    done();
};

const copyFavicon = done => {
  flag = fs.existsSync('./src/favicon.ico');
  destflag = fs.existsSync('./dest/favicon.ico');

  if(flag && !destflag) {
    src('./src/favicon.ico')
    .pipe(dest('./dest/'));
  }

  src('./src/fonts/*').pipe(dest('./dest/assets/fonts/'));
  done();
};

const copyFonts = done => {
  fonts = './src/fonts/*';
  src(fonts).pipe(dest('./dest/assets/fonts/'));
  done();
};

// watch(TargetFILE, Function)
const watchTask = done => {
  watch(FILEPATH.src.scss, series(styles, browserReload));
  watch(FILEPATH.src.img, series(images, browserReload));
	watch(FILEPATH.src.js, series(bundleJs, browserReload));

  let singlePUG = watch(FILEPATH.src.pug);
  singlePUG.on('change', (e, stats) => {
    singleviews(e);
  });
  done();
};


const build = series(parallel(styles,
  views,
  images,
  scripts,
  bundleJs,
  concatCss,
  concatJs,
  copyFavicon,
  copyFonts
));

exports.views = views;
exports.styles = styles;
exports.scripts = scripts;

exports.bundleJs = bundleJs;
exports.concatCss = concatCss;
exports.concatJs = concatJs;

exports.images = images;
exports.copyFavicon = copyFavicon;
exports.copyFonts = copyFonts;

exports.watch = watch;
exports.build = build;
exports.default = parallel(buildServer, watchTask);
