#!/usr/bin/env bash
set -euo pipefail

# Simple helper: opens Chrome's extensions page for loading the unpacked extension.
# macOS default Chrome path; adjust if you use Chromium/Canary.

open -a "Google Chrome" "chrome://extensions/"

echo ""
echo "1) Enable Developer mode (top-right)."
echo "2) Click 'Load unpacked' and select: $(cd "$(dirname "$0")"/.. && pwd)/extension"
echo "3) Pin the extension, then click the icon to toggle On/Off."
echo ""
