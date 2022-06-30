pugPATH:=./src/pug/pages

default:
	vim gulpfile.js
build:
	gulp build

watch:
	gulp watch&

diff:
	diff -rq  ./src/pug/pages ./dest |sort|rg -v '\.html' |rg -v '\.pug'

check:
	echo ${pugPATH}

reset:
	rm -rf ./dest/assets/js ||exit 1
	rm -rf ./dest/assets/css ||exit 1
	ls ./dest |grep -v -E "^assets"| xargs -I '{}' rm -rf ./dest/'{}'

createDir:
	mkdir ./dest/cat ./dest/dog ./dest/bird

destroy:
	rm -rf ./dest || exit 1
