#!/bin/bash

set -o errexit -o nounset

if [ "$TRAVIS_BRANCH" != "master" ]
then
  echo "This commit was made against the $TRAVIS_BRANCH and not the master! No deploy."
  exit 0
fi

setup_git() {
    echo "Setup Git."
    git init
    git config --global user.email "travis@travis-ci.org"
    git config --global user.name "Travis CI"
    git remote -v
    git remote add upstream "https://${GH_TOKEN}@github.com/raainio/raain-model.git"

    REVISION=$(git rev-parse --short HEAD)
    PACKAGE_VERSION=$(cat package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[", ]//g')
}

build_version() {
    echo "Build + Docs + Bump."
    npm run build
    #npm version patch -m "[skip ci] travis is OK: v${PACKAGE_VERSION} - ${REVISION}"
    echo "{
        \"name\": \"raain-model\",
        \"version\": \"$PACKAGE_VERSION\",
        \"author\": \"contact@raain.io\",
        \"homepage\": \"https://raain.io\",
        \"description\": \"raain api model\",
        \"private\": false,
        \"main\": \"index.js\",
        \"types\": \"index.d.ts\",
        \"dependencies\": {}
  }" > ./dist/package.json

   cp *.md .dist/
}

push_git() {
    echo "Commit, tag and push on master."
    NEXT_VERSION=$(npm version patch -m "[skip ci] travis is OK: v${PACKAGE_VERSION} - ${REVISION}")
    git add -A .
    echo " - ${NEXT_VERSION} : In progress... " >> RELEASE.md
    git commit -m "[skip ci] ${NEXT_VERSION} : In progress..."
    # git tag -a "v${PACKAGE_VERSION}" -m "v${PACKAGE_VERSION}"
    git push -q upstream HEAD:master --tags
}

###########
## Main
###########

setup_git
build_version
push_git
