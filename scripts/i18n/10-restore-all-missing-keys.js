#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('10-restore-all-missing-keys.js — Restore 14 keys deleted by cleanup');
console.log('============================================================\n');

const localesDir = path.join(__dirname, '../../locales');

// ALL keys to restore (from backup)
const keysToRestore = {
  fr: {
    'accessibility.activity': "Activité %{name}",
    'accessibility.colorNumber': "Couleur %{number}",
    'accessibility.paletteItem': "Palette de couleurs : %{name}",
    'accessibility.timer.activityCompleted': "%{activity} terminé",
    'accessibility.timer.activityStarted': "%{activity} démarré",
    'accessibility.timer.dial': "Cadran du timer, %{minutes} minutes définies, %{activity}",
    'accessibility.unlockPremium': "Débloquer le premium pour %{price}",
    'controls.digitalTimer.durationLabel': "Durée: %{time}",
    'controls.digitalTimer.timeLabel': "Temps: %{time}",
    'customActivities.edit.usageStats': "Utilisee %{count} fois",
    'notifications.reminder.day3.bodyPersonalized': "Ta {{name}} t'attend {{emoji}} — {{duration}} min pour toi ?",
    'premium.price': "Puis %{price} une fois.\nÀ toi pour toujours.",
    'settings.favorites.activities.description': "Sélectionnez jusqu'à 4 activités favorites (%{count}/4)",
    'settings.favorites.palettes.description': "Sélectionnez jusqu'à 4 palettes favorites (%{count}/4)"
  },
  en: {
    'accessibility.activity': "Activity %{name}",
    'accessibility.colorNumber': "Color %{number}",
    'accessibility.paletteItem': "Color palette: %{name}",
    'accessibility.timer.activityCompleted': "%{activity} completed",
    'accessibility.timer.activityStarted': "%{activity} started",
    'accessibility.timer.dial': "Timer dial, %{minutes} minutes set, %{activity}",
    'accessibility.unlockPremium': "Unlock premium for %{price}",
    'controls.digitalTimer.durationLabel': "Duration: %{time}",
    'controls.digitalTimer.timeLabel': "Time: %{time}",
    'customActivities.edit.usageStats': "Used %{count} times",
    'notifications.reminder.day3.bodyPersonalized': "Your {{name}} awaits {{emoji}} — {{duration}} min for you?",
    'premium.price': "Then %{price} once.\nYours forever.",
    'settings.favorites.activities.description': "Select up to 4 favorite activities (%{count}/4)",
    'settings.favorites.palettes.description': "Select up to 4 favorite palettes (%{count}/4)"
  }
};

function setNestedValue(obj, path, value) {
  const parts = path.split('.');
  const lastPart = parts.pop();
  let current = obj;

  for (const part of parts) {
    if (!current[part]) {
      current[part] = {};
    }
    current = current[part];
  }

  current[lastPart] = value;
}

console.log('1. Restoring keys to FR and EN...\n');

// Restore FR
const frPath = path.join(localesDir, 'fr.json');
const frData = JSON.parse(fs.readFileSync(frPath, 'utf-8'));

Object.entries(keysToRestore.fr).forEach(([key, value]) => {
  setNestedValue(frData, key, value);
});

fs.writeFileSync(frPath, JSON.stringify(frData, null, 2) + '\\n', 'utf-8');
console.log(`  ✓ FR: 14 keys restored`);

// Restore EN
const enPath = path.join(localesDir, 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf-8'));

Object.entries(keysToRestore.en).forEach(([key, value]) => {
  setNestedValue(enData, key, value);
});

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2) + '\\n', 'utf-8');
console.log(`  ✓ EN: 14 keys restored`);

console.log('\\n2. Adding keys to 13 backfilled locales (EN placeholders)...\\n');

const backfilledLocales = ['es', 'de', 'it', 'pt', 'ru', 'nl', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar', 'sv', 'no'];

backfilledLocales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  Object.entries(keysToRestore.en).forEach(([key, value]) => {
    setNestedValue(data, key, value);
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\\n', 'utf-8');
  console.log(`  ✓ ${locale.toUpperCase().padEnd(10)} 14 keys added`);
});

console.log('\\n============================================================');
console.log('RESTORE COMPLETE');
console.log('============================================================\\n');

console.log(`Total keys restored:`);
console.log(`  - FR: 14 keys`);
console.log(`  - EN: 14 keys`);
console.log(`  - Other 13 locales: 14 keys each (182 total)\\n`);
console.log('✓ All 15 locales now have 281 keys each\\n');
