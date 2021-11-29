mdbook build
cd book
git init
git config user.name "sunface"
git config user.email "cto@188.com"
git add .
git commit -m 'release book'
git branch -M gh-pages
git remote add origin https://github.com/rustcm/the-way-to-rust
git push -u -f origin gh-pages