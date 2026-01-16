#!/usr/bin/env node
/**
 * 07-cleanup-obsolete-keys.js
 * Remove obsolete keys (P2) from all locale files
 *
 * Output: scripts/i18n/cleanup-report.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '../..');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');
const AUDIT_FILE = path.join(__dirname, 'audit-results.json');
const OUTPUT_FILE = path.join(__dirname, 'cleanup-report.json');

/**
 * Flatten object to dot notation
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Unflatten object from dot notation back to nested structure
 */
function unflattenObject(flatMap) {
  const nested = {};

  Object.entries(flatMap).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = nested;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        // Leaf node
        current[part] = value;
      } else {
        // Intermediate node
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    });
  });

  return nested;
}

/**
 * Remove obsolete keys from a locale file
 */
function cleanupLocaleFile(filePath, obsoleteKeys) {
  const locale = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const flatMap = flattenObject(locale);

  let removedCount = 0;
  const removedKeys = [];

  obsoleteKeys.forEach(key => {
    if (flatMap[key] !== undefined) {
      delete flatMap[key];
      removedCount++;
      removedKeys.push(key);
    }
  });

  // Unflatten and write back
  if (removedCount > 0) {
    const updated = unflattenObject(flatMap);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');
  }

  return { removedCount, removedKeys };
}

/**
 * Main cleanup function
 */
function cleanupObsoleteKeys() {
  console.log('='.repeat(60));
  console.log('07-cleanup-obsolete-keys.js — Remove P2 obsolete keys');
  console.log('='.repeat(60));

  console.log('\n1. Loading audit results...');
  const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  const obsoleteKeys = audit.findings.obsoleteKeys.map(item => item.key);

  console.log(`  ✓ Found ${obsoleteKeys.length} obsolete keys to remove`);

  // Sample of keys to remove
  console.log('\n  Sample keys to remove:');
  obsoleteKeys.slice(0, 10).forEach(key => {
    console.log(`    - ${key}`);
  });
  if (obsoleteKeys.length > 10) {
    console.log(`    ... and ${obsoleteKeys.length - 10} more`);
  }

  // Backup locales
  console.log('\n2. Creating backups...');
  const backupDir = path.join(LOCALES_DIR, '.backup-cleanup-' + Date.now());
  fs.mkdirSync(backupDir, { recursive: true });

  const localeFiles = glob.sync(path.join(LOCALES_DIR, '*.json'));
  localeFiles.forEach(file => {
    const dest = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, dest);
  });

  console.log(`  ✓ Backed up ${localeFiles.length} locale files`);
  console.log(`  ✓ Backup location: ${path.relative(ROOT_DIR, backupDir)}`);

  // Clean up each locale file
  console.log('\n3. Removing obsolete keys from locale files...');
  const results = {};
  let totalRemoved = 0;

  localeFiles.forEach(file => {
    const localeName = path.basename(file, '.json');
    console.log(`  Processing: ${localeName}.json`);

    const result = cleanupLocaleFile(file, obsoleteKeys);
    results[localeName] = result;
    totalRemoved += result.removedCount;

    console.log(`    Removed ${result.removedCount} keys`);
  });

  // Build report
  const report = {
    cleanedAt: new Date().toISOString(),
    obsoleteKeysTargeted: obsoleteKeys.length,
    totalKeysRemoved: totalRemoved,
    localesUpdated: Object.keys(results).length,
    byLocale: results,
    backupDirectory: path.relative(ROOT_DIR, backupDir),
    sampleRemovedKeys: obsoleteKeys.slice(0, 20)
  };

  // Write report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('CLEANUP COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nObsolete keys:     ${obsoleteKeys.length}`);
  console.log(`Total removed:     ${totalRemoved} (across ${localeFiles.length} locales)`);
  console.log(`Locales updated:   ${localeFiles.length}`);
  console.log(`Backup created:    ${path.relative(ROOT_DIR, backupDir)}`);
  console.log(`\nReport: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log('\n✓ Run npm run i18n:audit to verify cleanup\n');
}

// Run cleanup
cleanupObsoleteKeys();
