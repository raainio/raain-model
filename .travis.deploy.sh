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
    git remote add upstream "https://${GH_TOKEN}@github.com/raain/raain-model.git"

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
    npm version patch -m "[skip ci] travis is OK: v${PACKAGE_VERSION} - ${REVISION}"
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
}

push_git() {
    echo "Commit, tag and push on master."
    #git add -A .
    echo "$PACKAGE_VERSION : " >> RELEASE.md
    git add .
    git commit -m "[ci skip] travis is OK: v${PACKAGE_VERSION} - ${REVISION}"
    git tag -a "v${PACKAGE_VERSION}" -m "v${PACKAGE_VERSION}"
    git push -q upstream HEAD:master --tags
    #git push origin HEAD:master --force
    #git push origin HEAD:master --force --tags

}

###########
## Main
###########

setup_git
build_version
push_git
