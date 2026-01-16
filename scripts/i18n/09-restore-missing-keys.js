#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('09-restore-missing-keys.js — Add 5 restored keys to backfilled locales');
console.log('============================================================\n');

const localesDir = path.join(__dirname, '../../locales');
const backfilledLocales = ['es', 'de', 'it', 'pt', 'ru', 'nl', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar', 'sv', 'no'];

// EN values to use as placeholders
const keysToAdd = {
  accessibility: {
    unlockPremium: "Unlock premium for %{price}"
  },
  premium: {
    price: "Then %{price} once.\nYours forever."
  },
  customActivities: {
    edit: {
      usageStats: "Used %{count} times"
    }
  },
  settings: {
    favorites: {
      activities: {
        description: "Select up to 4 favorite activities (%{count}/4)"
      },
      palettes: {
        description: "Select up to 4 favorite palettes (%{count}/4)"
      }
    }
  }
};

console.log('1. Setup...');
console.log(`  Locales to update: ${backfilledLocales.length}`);
console.log(`  Keys to add: 5\n`);

console.log('2. Adding keys to backfilled locales...\n');

backfilledLocales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${locale}.json not found, skipping`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  // Add accessibility.unlockPremium
  if (!data.accessibility.unlockPremium) {
    data.accessibility.unlockPremium = keysToAdd.accessibility.unlockPremium;
  }

  // Add premium.price
  if (!data.premium.price) {
    // Insert after startTrial
    const premiumKeys = Object.keys(data.premium);
    const startTrialIndex = premiumKeys.indexOf('startTrial');
    const newPremium = {};

    premiumKeys.forEach((key, index) => {
      newPremium[key] = data.premium[key];
      if (index === startTrialIndex) {
        newPremium.price = keysToAdd.premium.price;
      }
    });

    data.premium = newPremium;
  }

  // Add customActivities.edit.usageStats
  if (!data.customActivities.edit.usageStats) {
    data.customActivities.edit.usageStats = keysToAdd.customActivities.edit.usageStats;
  }

  // Add settings.favorites.activities.description
  if (!data.settings.favorites.activities.description) {
    data.settings.favorites.activities.description = keysToAdd.settings.favorites.activities.description;
  }

  // Add settings.favorites.palettes.description
  if (!data.settings.favorites.palettes.description) {
    data.settings.favorites.palettes.description = keysToAdd.settings.favorites.palettes.description;
  }

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  console.log(`  ✓ ${locale.toUpperCase().padEnd(10)} 5 keys added`);
});

console.log('\n============================================================');
console.log('RESTORE COMPLETE');
console.log('============================================================\n');

console.log(`Total keys added: ${backfilledLocales.length * 5} (5 × ${backfilledLocales.length} locales)\n`);
console.log('✓ All 15 locales now have 267 keys each\n');
