#!/usr/bin/env bash
set -euo pipefail

# VARIABLES
root="$(cd "$(dirname "$0")/.." && pwd)"
sdk="$root/.sdk"
www="${WWW_DIR:-$root/build/www}"
work="$root/build/apk"
dist="$root/dist"
versionCode="${VERSION_CODE:-1}"
versionName="${VERSION_NAME:-1.0.0}"
keystore="$root/android/debug.keystore"
storePass="android"
keyAlias="purrvivors"
apkName="${APK_NAME:-Purrvivors.apk}"
exports="--add-exports java.base/sun.security.x509=ALL-UNNAMED --add-exports java.base/sun.security.pkcs=ALL-UNNAMED --add-exports java.base/sun.security.util=ALL-UNNAMED"

# FUNCTIONS
step() { echo "==> $*"; }
jrun() { env -u JAVA_TOOL_OPTIONS "$@"; }

# INITIALIZATION
"$root/tools/setup-sdk.sh" >/dev/null
if [ ! -f "$www/index.html" ]; then
  echo "missing $www/index.html (run the web build first)" >&2
  exit 1
fi

rm -rf "$work"
mkdir -p "$work/compiled" "$work/gen" "$work/classes" "$work/assets" "$work/signer" "$dist"

step "compiling resources"
"$sdk/aapt2" compile --dir "$root/android/res" -o "$work/compiled/res.zip"

step "linking manifest, resources and assets"
cp -r "$www" "$work/assets/www"
"$sdk/aapt2" link \
  -o "$work/unsigned.apk" \
  -I "$sdk/android-34.jar" \
  --manifest "$root/android/AndroidManifest.xml" \
  -R "$work/compiled/res.zip" \
  -A "$work/assets" \
  --java "$work/gen" \
  --min-sdk-version 24 \
  --target-sdk-version 34 \
  --version-code "$versionCode" \
  --version-name "$versionName" \
  --auto-add-overlay \
  -0 ogg -0 png

step "compiling java"
jrun javac -nowarn -Xlint:-options --release 8 \
  -classpath "$sdk/android-34.jar" \
  -d "$work/classes" \
  $(find "$root/android/java" -name '*.java') $(find "$work/gen" -name '*.java')

step "dexing"
jrun java -cp "$sdk/dx.jar" com.android.dx.command.Main --dex --min-sdk-version=24 --output="$work/classes.dex" "$work/classes"
(cd "$work" && zip -q -j unsigned.apk classes.dex)
python3 "$root/tools/zipalign.py" "$work/unsigned.apk" "$work/aligned.apk"

step "signing"
if [ ! -f "$keystore" ]; then
  jrun keytool -genkeypair -keystore "$keystore" -storetype PKCS12 -storepass "$storePass" -keypass "$storePass" \
    -alias "$keyAlias" -keyalg RSA -keysize 2048 -validity 20000 \
    -dname "CN=Purrvivors Debug, O=Purrvivors, C=BR" >/dev/null 2>&1
fi
jrun javac -nowarn -classpath "$sdk/apksig.jar" -d "$work/signer" "$root/tools/ApkSign.java"
jrun java $exports -cp "$work/signer:$sdk/apksig.jar" ApkSign "$keystore" "$storePass" "$keyAlias" "$work/aligned.apk" "$dist/$apkName"
jrun java $exports -cp "$work/signer:$sdk/apksig.jar" ApkSign verify "$dist/$apkName"
python3 "$root/tools/check_apk.py" "$dist/$apkName"
ls -la "$dist/$apkName"
