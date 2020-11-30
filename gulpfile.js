let build_file = require("path").basename(__dirname);
let source_file = '#src';

let fs = require('fs');

let path = {
	build: {
		html: build_file + "/",
		css: build_file + "/css/",
		js: build_file + "/js/",
		img: build_file + "/img/",
		fonts: build_file + "/fonts/",
	},
	src: {
		html: [source_file + "/*.html", "!" + source_file + "/_*.html"],
		css: source_file + "/scss/style.scss",
		js: source_file + "/js/main.js",
		img: source_file + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
		fonts: source_file + "/fonts/*.ttf",
	},
	watch: {
		html: source_file + "/**/*.html",
		css: source_file + "/scss/**/*.scss",
		js: source_file + "/js/**/*.js",
		img: source_file + "/img/**/*.+(png|jpg|gif|ico|svg|webp)",
	},
	clean: "./" + build_file + "/"
}

let { src, dest } = require('gulp'),
	gulp = require('gulp'),
	browserSync = require('browser-sync').create(),
	fileInclude = require('gulp-file-include'),
	del = require('del'),
	scss = require('gulp-sass'),
	prefix = require('gulp-autoprefixer'),
	media = require('gulp-group-css-media-queries'),
	cleanCss = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	uglify = require('gulp-uglify-es').default,
	imagemin = require('gulp-imagemin'),
	webp = require('gulp-webp'),
	webphtml = require('gulp-webp-html'),
	webpcss = require('gulp-webpcss'),
	ttf2woff = require('gulp-ttf2woff'),
	ttf2woff2 = require('gulp-ttf2woff2'),
	fonter = require('gulp-fonter');

function browsersync() {
	browserSync.init({
		server: {
			baseDir: "./" + build_file + "/"
		},
		port: 3000,
		notify: false
	})
}

function html() {
	return src(path.src.html)
		.pipe(fileInclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream())
}

function css() {
	return src(path.src.css)
		.pipe(
			scss({
				outputStyle: "expanded"
			})
		)
		.pipe(media())
		.pipe(prefix({
			overrideBrowserslist: ['last 5 versions'],
			cascade: true
		}))
		.pipe(webpcss({webpClass: '.webp', noWebpClass: '.no-webp'}))
		.pipe(dest(path.build.css))
		.pipe(cleanCss())
		.pipe(
			rename({
				extname: ".min.css"
			})
		)
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream())
}

function js() {
	return src(path.src.js)
		.pipe(fileInclude())
		.pipe(dest(path.build.js))
		.pipe(uglify())
		.pipe(
			rename({
				extname: ".min.js"
			})
		)
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

function img() {
	return src(path.src.img)
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))
		.pipe(
			imagemin(
				{
					interlaced: true,
					progressive: true,
					optimizationLevel: 3,
					svgoPlugins: [{ removeViewBox: false }]
				}
			)
		)
		.pipe(dest(path.build.img))
		.pipe(browserSync.stream())
}

function fonts() {
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
}

gulp.task('otf2ttf', function() {
	return src([source_file + "/fonts/*.otf"])
		.pipe(
			fonter({
				formats: ['ttf']
			})
		)
		.pipe(dest(source_file + "/fonts/"))
})

function watchfiles() {
	gulp.watch([path.watch.html], html)
	gulp.watch([path.watch.css], css)
	gulp.watch([path.watch.js], js)
	gulp.watch([path.watch.img], img)
}

function clean() {
	return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts));
let watch = gulp.parallel(build, watchfiles, browsersync);

exports.html = html;
exports.css = css;
exports.js = js;
exports.img = img;
exports.fonts = fonts;
exports.build = build;
exports.watch = watch;
exports.default = watch;