git config user.name "tanykazy"
git fetch origin
git checkout gh-pages
mv //home/runner/work/_temp ./
git add . -f
git commit -m "Deploy to github pages - 805f249d4107195c076963aa8ed4bbd7a8dd6ca6"
git push origin
