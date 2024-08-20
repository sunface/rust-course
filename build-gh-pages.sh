
###
 # @Author: chenzhongsheng
 # @Date: 2024-08-20 11:23:08
 # @Description: Coding something
### 
## build static website for docs
mdbook build -d docs
## copy CNAME info to docs dir
cp ./assets/CNAME ./docs/
cp ./assets/*.html ./docs/
cp ./assets/sitemap.xml ./docs/