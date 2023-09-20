#! /bin/sh

###########################################################
# Description:
#   This script write for mdbook project to generate pdf
###########################################################

cargo install mdbook mdbook-pdf
hasPdfSec=$(grep "output.pdf" ./book.toml)

if [ "$hasPdfSec" = "" ]; then
    echo "===>>> Backup book.toml file..."
    cp book.toml book.toml.bak
    cat >> book.toml << EOF

[output.pdf]
scale = 1
paper-width = 10
paper-height = 12
margin-top = 1
margin-bottom = 1
margin-left = 1
[output.pdf-outline]
EOF
fi
echo "===>>> Start build pdf..."
mdbook build
today=$(date +%Y%m%d)
echo "===>>> PDF rename to rust-curse-$today.pdf"
mv book/pdf/output.pdf rust-course.pdf
if [ -f book.toml.bak ]; then
    echo "===>>> Reverse book.toml file..."
    mv book.toml.bak book.toml
fi
exit 0
