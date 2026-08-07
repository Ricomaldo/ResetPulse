#!/usr/bin/env bash
# Build APK release local (sideload) — évite un crédit EAS.
# Calqué sur fred/scripts/build-android-apk.sh, adapté ResetPulse.
# Prérequis (orion) : JDK 17, android-commandlinetools (brew),
# keystore ~/Library/Keystores/resetpulse-release.{jks,env} (à CRÉER, cf.
# _cockpit/projects/resetpulse/qa-results/2026-08-07-passe-3-checklists.md
# bloc 5 — mots de passe : gestionnaire d'Eric UNIQUEMENT, jamais git).
#
# ⚠️ DEUX GESTES D'ERIC AVANT LE PREMIER BUILD :
#   1. Créer le keystore + le .env (voir le bloc 5 de la checklist).
#   2. Poser android.versionCode dans app.json à une valeur > au dernier
#      versionCode utilisé sur la Play Console (v2.1.6). Le bump auto
#      ci-dessous refuse de partir tant que versionCode est absent.
#
# ResetPulse n'a PAS de variable EXPO_PUBLIC_* au bundling (contrairement à
# fred) — pas de garde token ici.
set -euo pipefail
cd "$(dirname "$0")/.."

export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
source ~/Library/Keystores/resetpulse-release.env

# Play refuse tout upload avec un versionCode déjà utilisé → bump automatique.
# Refuse de partir si versionCode absent (décision Eric, cf. en-tête).
python3 - <<'BUMP'
import json, sys
d = json.load(open('app.json'))
vc = d['expo'].get('android', {}).get('versionCode')
if vc is None:
    sys.exit("ERREUR: app.json expo.android.versionCode absent. Poser une "
             "valeur > dernier versionCode Play (v2.1.6) AVANT de builder.")
d['expo']['android']['versionCode'] = vc + 1
json.dump(d, open('app.json', 'w'), indent=2, ensure_ascii=False)
open('app.json', 'a').write('\n')
print(f"versionCode -> {d['expo']['android']['versionCode']} (committer app.json apres le build)")
BUMP

npx --no-install expo prebuild --platform android --no-install

# prebuild --clean regenere gradle.properties : le correctif metaspace du
# 05/08 (OutOfMemoryError KSP au targetSdk 36) DOIT etre re-applique ici,
# sinon le build echoue. Voir findings/2026-08-06_audit-fiabilite.md.
cat >> android/gradle.properties <<PROPS

org.gradle.jvmargs=-Xmx6144m -XX:MaxMetaspaceSize=2048m
RESETPULSE_STORE_FILE=$RESETPULSE_STORE_FILE
RESETPULSE_KEY_ALIAS=$RESETPULSE_KEY_ALIAS
RESETPULSE_STORE_PASSWORD=$RESETPULSE_STORE_PASSWORD
RESETPULSE_KEY_PASSWORD=$RESETPULSE_KEY_PASSWORD
PROPS

python3 - <<'PY'
p='android/app/build.gradle'
s=open(p,encoding='utf-8').read()
if 'signingConfigs.release' not in s:
    old="    signingConfigs {\n        debug {"
    new="""    signingConfigs {
        release {
            storeFile file(RESETPULSE_STORE_FILE)
            storePassword RESETPULSE_STORE_PASSWORD
            keyAlias RESETPULSE_KEY_ALIAS
            keyPassword RESETPULSE_KEY_PASSWORD
        }
        debug {"""
    assert s.count(old)==1; s=s.replace(old,new)
    i=s.rfind("signingConfig signingConfigs.debug")
    s=s[:i]+"signingConfig signingConfigs.release"+s[i+len("signingConfig signingConfigs.debug"):]
    open(p,'w',encoding='utf-8').write(s)
PY
echo "sdk.dir=$ANDROID_HOME" > android/local.properties

cd android && ./gradlew assembleRelease --no-daemon
echo "APK : android/app/build/outputs/apk/release/app-release.apk"
# AAB pour Play (meme keystore) : ./gradlew bundleRelease
#   -> android/app/build/outputs/bundle/release/app-release.aab
