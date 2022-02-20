default:
	vim gulpfile.js
build:
	gulp build&

watch:
	gulp watch&

make diff:
	diff -rq  ./src/pug/pages ./dest |sort|rg -v '\.html' |rg -v '\.pug'

