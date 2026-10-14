#!/usr/bin/env bash
set -euo pipefail

# VARIABLES
root="$(cd "$(dirname "$0")/.." && pwd)"

# INITIALIZATION
cd "$root"
echo "==> art"
python3 tools/build_art.py
echo "==> launcher icons"
python3 tools/build_icons.py
echo "==> audio"
node tools/build_audio.mjs
echo "==> web bundle"
node tools/build_web.mjs
echo "==> apk"
bash tools/build-apk.sh
