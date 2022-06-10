#!/bin/bash

BOOTSTRAP_TARGET=./node_modules/bootstrap
if [ -d $BOOTSTRAP_TARGET ]; then
  echo $BOOTSTRAP_TARGET
  cp -i "./node_modules/bootstrap/scss/_variables.scss" "./src/scss/_base/_bs-variables.scss"
  cp -i "./node_modules/bootstrap/scss/bootstrap.scss" "./src/scss"
  cp -i "./node_modules/bootstrap/dist/js/bootstrap.bundle.js" "./src/js/"
  cp -i "./node_modules/bootstrap/dist/js/bootstrap.bundle.js.map" "./src/js/"
  cp -i "./node_modules/jquery/dist/jquery.js" "./src/js/"
fi
