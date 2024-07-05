const gulp = require("gulp");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const purgecss = require("gulp-purgecss");
const concat = require("gulp-concat");
const browserSync = require("browser-sync").create();

// Paths
const cssFolderPath = "css";
const scssFolderPath = "scss";
const jsFolderPath = "js";
const jsComponentsPath = "js/components/*.js";

// Compile CSS from SCSS
function compileCss() {
  return gulp
    .src(scssFolderPath + "/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(
      purgecss({
        content: ["*.html", jsFolderPath + "/scripts.js"],
        defaultExtractor: (content) => content.match(/[\w-/:%@]+(?<!:)/g) || [],
      })
    )
    .pipe(gulp.dest(cssFolderPath))
    .pipe(browserSync.stream());
}

// Concatenate JavaScript components
function scripts() {
  return gulp.src([jsComponentsPath])
    .pipe(concat("scripts.js"))
    .pipe(gulp.dest(jsFolderPath))
    .pipe(browserSync.stream());
}

// BrowserSync initialization
function browserSyncServe(done) {
  browserSync.init({
    server: {
      baseDir: './'
    },
    notify: false
  });
  done();
}

// Reload Browser
function browserSyncReload(done) {
  browserSync.reload();
  done();
}

// Watch task
function watchFiles() {
  gulp.watch("*.html", browserSyncReload);
  gulp.watch(scssFolderPath + "/**/*.scss", compileCss);
  gulp.watch([jsComponentsPath], scripts);
}

// Default task
gulp.task("default", gulp.series(gulp.parallel(compileCss, scripts), browserSyncServe, watchFiles));

module.exports = {
  compileCss,
  scripts,
  watchFiles,
  browserSyncServe,
  browserSyncReload
};