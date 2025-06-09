#!/bin/bash

# Remove temporary files created during installation
# Without touching essential configuration or data

set -e

# Clean apt cache
if command -v apt-get >/dev/null 2>&1; then
  sudo apt-get clean
  sudo rm -rf /var/lib/apt/lists/*
fi

# Prune pnpm store if pnpm is available
if command -v pnpm >/dev/null 2>&1; then
  pnpm store prune || true
fi

# Remove typical debug logs
rm -f .pnpm-debug.log* npm-debug.log* yarn-debug.log* yarn-error.log*

# Delete leftover *.tmp files and 'tmp' directories within project
find . -path ./node_modules -prune -o -type f -name '*.tmp' -delete
find . -path ./node_modules -prune -o -type d -name 'tmp' -exec rm -rf {} +

echo "Temporary files cleaned up."
