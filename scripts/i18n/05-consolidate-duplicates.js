#!/usr/bin/env node
/**
 * 05-consolidate-duplicates.js
 * Consolidate duplicate i18n keys automatically
 *
 * Output: scripts/i18n/consolidation-report.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');
const AUDIT_FILE = path.join(__dirname, 'audit-results.json');
const OUTPUT_FILE = path.join(__dirname, 'consolidation-report.json');

/**
 * Choose canonical key from duplicate group
 * Priority: common.* > shortest key > alphabetical
 */
function chooseCanonicalKey(keys) {
  // Prefer common.* namespace
  const commonKey = keys.find(k => k.startsWith('common.'));
  if (commonKey) return commonKey;

  // Otherwise, choose shortest key
  const sortedByLength = keys.sort((a, b) => {
    if (a.length !== b.length) return a.length - b.length;
    return a.localeCompare(b); // Alphabetical if same length
  });

  return sortedByLength[0];
}

/**
 * Update source code files to replace duplicate keys with canonical key
 */
function updateSourceFiles(duplicateGroups) {
  console.log('\n2. Updating source code files...');

  const pattern = path.join(SRC_DIR, '**/*.{js,jsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/*.test.{js,jsx}'
    ]
  });

  const changes = [];
  let totalFilesModified = 0;

  duplicateGroups.forEach(group => {
    const { canonicalKey, removedKeys } = group;

    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      let modified = false;

      removedKeys.forEach(oldKey => {
        // Match t('oldKey') or t("oldKey")
        const regex1 = new RegExp(`\\bt\\(['"]${oldKey.replace(/\./g, '\\.')}['"]\\)`, 'g');
        const regex2 = new RegExp(`\\bt\\(["']${oldKey.replace(/\./g, '\\.')}["']\\)`, 'g');

        if (regex1.test(content) || regex2.test(content)) {
          // Replace with canonical key
          content = content.replace(regex1, `t('${canonicalKey}')`);
          content = content.replace(regex2, `t('${canonicalKey}')`);
          modified = true;

          changes.push({
            file: path.relative(ROOT_DIR, file),
            oldKey,
            newKey: canonicalKey
          });
        }
      });

      if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        totalFilesModified++;
      }
    });
  });

  console.log(`  ✓ Modified ${totalFilesModified} files`);
  console.log(`  ✓ Replaced ${changes.length} key references`);

  return { changes, totalFilesModified };
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
 * Remove duplicate keys from all locale files
 */
function updateLocaleFiles(duplicateGroups) {
  console.log('\n3. Updating locale files...');

  const localeFiles = glob.sync(path.join(LOCALES_DIR, '*.json'));
  let totalKeysRemoved = 0;

  localeFiles.forEach(file => {
    const locale = JSON.parse(fs.readFileSync(file, 'utf8'));
    let modified = false;

    // Flatten locale
    const flatMap = flattenObject(locale);

    // Remove duplicate keys (keep only canonical)
    duplicateGroups.forEach(group => {
      group.removedKeys.forEach(key => {
        if (flatMap[key] !== undefined) {
          delete flatMap[key];
          modified = true;
          totalKeysRemoved++;
        }
      });
    });

    if (modified) {
      // Unflatten and write back
      const updated = unflattenObject(flatMap);
      fs.writeFileSync(file, JSON.stringify(updated, null, 2) + '\n', 'utf8');
    }
  });

  console.log(`  ✓ Updated ${localeFiles.length} locale files`);
  console.log(`  ✓ Removed ${totalKeysRemoved} duplicate keys`);

  return { localeFilesUpdated: localeFiles.length, totalKeysRemoved };
}

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
 * Main consolidation function
 */
function consolidateDuplicates() {
  console.log('='.repeat(60));
  console.log('05-consolidate-duplicates.js — Consolidate duplicate keys');
  console.log('='.repeat(60));

  console.log('\n1. Loading audit results...');
  const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));
  const duplicateGroups = audit.findings.duplicateValues;

  if (duplicateGroups.length === 0) {
    console.log('  ✓ No duplicate values found. Nothing to consolidate.');
    console.log('\n✓ Consolidation complete (no changes needed)\n');
    return;
  }

  console.log(`  ✓ Found ${duplicateGroups.length} duplicate groups`);

  // Prepare consolidation groups
  const consolidationGroups = duplicateGroups.map(group => {
    const canonicalKey = chooseCanonicalKey(group.keys);
    const removedKeys = group.keys.filter(k => k !== canonicalKey);

    return {
      canonicalKey,
      removedKeys,
      value: group.value,
      originalKeys: group.keys
    };
  });

  console.log('\nCanonical keys chosen:');
  consolidationGroups.forEach(g => {
    console.log(`  ${g.canonicalKey} (removes ${g.removedKeys.length} duplicates)`);
  });

  // Backup locales
  console.log('\nCreating backups...');
  const backupDir = path.join(LOCALES_DIR, '.backup-' + Date.now());
  fs.mkdirSync(backupDir, { recursive: true });
  glob.sync(path.join(LOCALES_DIR, '*.json')).forEach(file => {
    const dest = path.join(backupDir, path.basename(file));
    fs.copyFileSync(file, dest);
  });
  console.log(`  ✓ Backed up locales to: ${path.relative(ROOT_DIR, backupDir)}`);

  // Update source files
  const sourceUpdates = updateSourceFiles(consolidationGroups);

  // Update locale files
  const localeUpdates = updateLocaleFiles(consolidationGroups);

  // Build report
  const report = {
    consolidatedAt: new Date().toISOString(),
    totalDuplicateGroups: duplicateGroups.length,
    consolidated: consolidationGroups,
    sourceFiles: {
      totalFilesModified: sourceUpdates.totalFilesModified,
      changes: sourceUpdates.changes
    },
    localeFiles: {
      totalFilesUpdated: localeUpdates.localeFilesUpdated,
      totalKeysRemoved: localeUpdates.totalKeysRemoved
    },
    backupDirectory: path.relative(ROOT_DIR, backupDir)
  };

  // Write report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('CONSOLIDATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nDuplicate groups:  ${duplicateGroups.length}`);
  console.log(`Keys removed:      ${localeUpdates.totalKeysRemoved}`);
  console.log(`Files modified:    ${sourceUpdates.totalFilesModified}`);
  console.log(`Backups created:   ${backupDir}`);
  console.log(`\nReport written to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log('\n✓ Run npm run i18n:audit to verify consolidation\n');
}

// Run consolidation
consolidateDuplicates();
