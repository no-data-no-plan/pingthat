#!/bin/bash
# Updates all <lastmod> dates in sitemap.xml to today's date
TODAY=$(date +%Y-%m-%d)
sed -i "s|<lastmod>[0-9-]*</lastmod>|<lastmod>${TODAY}</lastmod>|g" public/sitemap.xml
echo "Sitemap lastmod dates updated to ${TODAY}"
