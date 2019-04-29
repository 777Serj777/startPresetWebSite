//npm install -g bower // create file .bowerrc..write into file {"directory": "app/libs"}
//connect plugin 
//npm i -D gulp-sass gulp-concat gulp-uglifyjs gulp-cssnano gulp-rename del gulp-imagemin imagemin-pngquant gulp-cache imagemin-mozjpeg gulp-autoprefixer browser-sync
const {src, dest, watch, series, parallel} = gulp = require('gulp'),
	sass = require('gulp-sass'), //compiles scss/css
	concat = require('gulp-concat'), //concatenates files
	uglify = require('gulp-uglifyjs'), //minify JavaScript
	cssnano = require('gulp-cssnano'), //compress CSS
	rename = require('gulp-rename'), //rename files
	del = require('del'), //delete files and folders using globs
	imagemin = require('gulp-imagemin'), //optimizes the image
	pngquant = require('imagemin-pngquant'), //PNG compressor
	cache = require('gulp-cache'),// Target plugin, the output of which will be cached.
	mozjpg = require('imagemin-mozjpeg'),//reduces file sizes of JPEG images
	autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create();	
	
// tasks
function style(){
return	src('app/scss/**/*.scss')
	.pipe(sass().on('error', sass.logError))
	.pipe(cssnano()) 
	.pipe(rename({suffix: '.min'})) 
	.pipe(dest('app/css'))
	.pipe(browserSync.stream());
}

function autopreFixer(){
	return	src(['app/css/*.css','!app/css/libs.min.css'])
	.pipe(autoprefixer({
		 browsers: ['last 2 versions'],
		 cascade: false
		}))
	.pipe(dest('app/css'))
	.pipe(browserSync.stream());
}

function scripts(){
	return src([
		'app/libs/jquery/dist/jquery.min.js'
	])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(dest('app/js'))
}

function img(){
	return	src('app/img/**/*')
	.pipe(cache(imagemin([
		pngquant({
			speed: 1,
			quality: [0.95, 1]
		}),
		imagemin.svgo({
			plugins: [{
				removeViewBox: false
			}]
		}),
		mozjpg({
			quality: 90
		})			
	])))
	.pipe(dest('dist/img'))		
}

function clear(){
	return cache.clearAll();
}

function clean(cb){
	del.sync('dist');
	cb();
}

function build(cb){
	src('app/*html').pipe( dest('dist') );
	src('app/css/*css').pipe(dest('dist/css'));
	src('app/js/*js').pipe(dest('dist/js'));
	src('app/fonts/**/*').pipe(dest('dist/fonts'));
	cb();
}

const watcher = series(scripts, () => {
	
	browserSync.init({
		server:{
			baseDir: 'app'
		},
		notify: false
	});
	
	watch('app/scss/**/*.scss',{ ignoreInitial: false }, series(style, autopreFixer)); 
	watch('app/js/**/*js').on('change', browserSync.reload);
	watch('app/*html').on('change', browserSync.reload);
	  	  
});

// exports
exports.style =  series(style , autopreFixer);
exports.watch = watcher;
exports.scripts = scripts;
exports.clean = clean;
exports.clear = clear;
exports.build = series(clean, parallel(style, img, scripts), build);







