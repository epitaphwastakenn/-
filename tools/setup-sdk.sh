#!/usr/bin/env bash
set -euo pipefail

# VARIABLES
root="$(cd "$(dirname "$0")/.." && pwd)"
sdk="$root/.sdk"
mkdir -p "$sdk"

# FUNCTIONS
fetch() {
  local url="$1" out="$2"
  if [ -s "$out" ]; then return 0; fi
  for wait in 2 4 8 16; do
    if curl -fsSL --max-time 300 -o "$out.part" "$url"; then
      mv "$out.part" "$out"
      return 0
    fi
    sleep "$wait"
  done
  echo "failed to download $url" >&2
  return 1
}

# INITIALIZATION
fetch "https://raw.githubusercontent.com/Sable/android-platforms/master/android-34/android.jar" "$sdk/android-34.jar"
fetch "https://repo1.maven.org/maven2/com/jakewharton/android/repackaged/dalvik-dx/16.0.1/dalvik-dx-16.0.1.jar" "$sdk/dx.jar"
fetch "https://repo1.maven.org/maven2/com/android/tools/build/apksig/2.3.0/apksig-2.3.0.jar" "$sdk/apksig.jar"
if [ ! -x "$sdk/aapt2" ]; then
  fetch "https://github.com/iBotPeaches/Apktool/releases/download/v2.10.0/apktool_2.10.0.jar" "$sdk/apktool.jar"
  unzip -o -j -q "$sdk/apktool.jar" prebuilt/linux/aapt2_64 -d "$sdk"
  mv "$sdk/aapt2_64" "$sdk/aapt2"
  chmod +x "$sdk/aapt2"
  rm -f "$sdk/apktool.jar"
fi
echo "sdk ready at $sdk"
