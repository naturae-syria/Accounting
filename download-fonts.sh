#!/bin/bash
set -e

command -v woff2_compress >/dev/null 2>&1 || {
  echo "woff2_compress not found. Installing woff2 package..."
  sudo apt-get update -y >/dev/null
  sudo apt-get install -y woff2 >/dev/null
}
FONT_DIR="public/fonts/Tajawal"
mkdir -p "$FONT_DIR"
BASE_URL="https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal"
# Array of weights to download: Light(300) Regular(400) Medium(500) Bold(700) ExtraBold(800)
declare -A FILES=( [300]=Tajawal-Light.ttf [400]=Tajawal-Regular.ttf [500]=Tajawal-Medium.ttf [700]=Tajawal-Bold.ttf [800]=Tajawal-ExtraBold.ttf )
for weight in "${!FILES[@]}"; do
  file="${FILES[$weight]}"
  target="${file%.ttf}.woff2"
  if [ ! -f "$FONT_DIR/$target" ]; then
    curl -fsSL "$BASE_URL/$file" -o "$FONT_DIR/$file"
    woff2_compress "$FONT_DIR/$file" >/dev/null
    rm "$FONT_DIR/$file"
  fi
done
