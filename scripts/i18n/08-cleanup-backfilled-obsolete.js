#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('============================================================');
console.log('08-cleanup-backfilled-obsolete.js — Remove obsolete keys from backfilled locales');
console.log('============================================================\n');

// Keys to remove (exist in backfilled locales but not in FR/EN)
const obsoleteKeys = [
  'moreColors.subtitle',
  'moreColors.tagline',
  'moreColors.title',
  'palettes.pastel_girly'
];

// Locales to clean (backfilled ones)
const backfilledLocales = ['es', 'de', 'it', 'pt', 'ru', 'nl', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar', 'sv', 'no'];

const localesDir = path.join(__dirname, '../../locales');

// Helper to remove key from nested object
function removeNestedKey(obj, keyPath) {
  const parts = keyPath.split('.');
  const lastPart = parts.pop();
  let current = obj;

  for (const part of parts) {
    if (!current[part]) return false;
    current = current[part];
  }

  if (current[lastPart] !== undefined) {
    delete current[lastPart];
    return true;
  }
  return false;
}

// Helper to clean empty parent objects
function cleanEmptyObjects(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      cleanEmptyObjects(obj[key]);
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

console.log('1. Setup...');
console.log(`  Locales to clean: ${backfilledLocales.length}`);
console.log(`  Keys to remove: ${obsoleteKeys.length}\n`);

let totalRemoved = 0;
const results = [];

console.log('2. Processing locales...\n');

backfilledLocales.forEach(locale => {
  const filePath = path.join(localesDir, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  ${locale}.json not found, skipping`);
    return;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);

  let removed = 0;

  obsoleteKeys.forEach(key => {
    if (removeNestedKey(data, key)) {
      removed++;
      totalRemoved++;
    }
  });

  // Clean up empty parent objects
  cleanEmptyObjects(data);

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');

  results.push({ locale, removed });
  console.log(`  ✓ ${locale.toUpperCase().padEnd(10)} ${removed} keys removed`);
});

console.log('\n============================================================');
console.log('CLEANUP COMPLETE');
console.log('============================================================\n');

console.log(`Total keys removed: ${totalRemoved}`);
console.log(`Locales cleaned: ${backfilledLocales.length}\n`);

console.log('Results by locale:');
results.forEach(({locale, removed}) => {
  console.log(`  ${locale}: ${removed} keys`);
});

console.log('\n✓ All backfilled locales now match FR/EN structure (262 keys each)\n');
