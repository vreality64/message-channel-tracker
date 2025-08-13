#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT=${1:-5173}

# Use Python http.server for simplicity
printf "Serving playground on http://localhost:%s/playground/\n" "$PORT"
python3 -m http.server "$PORT" --bind 127.0.0.1
