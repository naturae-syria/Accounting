#!/bin/bash
set -e

FONT_DIR="public/fonts/Tajawal"
mkdir -p "$FONT_DIR"

# Base URL can be overridden via FONT_BASE_URL environment variable
base_url="${FONT_BASE_URL:-https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal}"
fonts=(
  Tajawal-Light.ttf
  Tajawal-Regular.ttf
  Tajawal-Medium.ttf
  Tajawal-Bold.ttf
  Tajawal-ExtraBold.ttf
)

for font in "${fonts[@]}"; do
  if [ -f "$FONT_DIR/$font" ]; then
    echo "$font already exists, skipping download."
    continue
  fi
  echo "Downloading $font..."
  curl -L -o "$FONT_DIR/$font" "$base_url/$font"
  echo "Saved $FONT_DIR/$font"
done

echo "Tajawal fonts downloaded to $FONT_DIR"
