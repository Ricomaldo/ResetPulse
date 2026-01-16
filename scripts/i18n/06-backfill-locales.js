#!/usr/bin/env node
/**
 * 06-backfill-locales.js
 * Backfill incomplete locales with EN values
 *
 * Output: scripts/i18n/backfill-report.md
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');
const PARSED_FILE = path.join(__dirname, 'parsed-locales.json');
const OUTPUT_FILE = path.join(__dirname, 'backfill-report.md');

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
 * Backfill a single locale with missing keys from EN
 */
function backfillLocale(locale, localeFlatMap, frFlatMap, enFlatMap) {
  const frKeys = Object.keys(frFlatMap);
  const missingKeys = frKeys.filter(key => !(key in localeFlatMap));

  if (missingKeys.length === 0) {
    return { added: 0, missingKeys: [] };
  }

  // Add missing keys with EN values
  missingKeys.forEach(key => {
    const enValue = enFlatMap[key];
    if (enValue !== undefined) {
      localeFlatMap[key] = enValue;
    } else {
      // Fallback to FR if EN doesn't have it either
      localeFlatMap[key] = frFlatMap[key];
    }
  });

  return { added: missingKeys.length, missingKeys };
}

/**
 * Generate markdown report
 */
function generateReport(backfillResults, date) {
  let md = '';

  // Frontmatter
  md += '---\n';
  md += `created: '${date}'\n`;
  md += `updated: '${date}'\n`;
  md += 'status: active\n';
  md += 'type: backfill-report\n';
  md += '---\n\n';

  // Title
  md += `# i18n Backfill Report — ${date}\n\n`;

  // Summary
  const totalAdded = backfillResults.reduce((sum, r) => sum + r.added, 0);
  const localesBackfilled = backfillResults.filter(r => r.added > 0).length;

  md += '## Summary\n\n';
  md += `- **Locales backfilled**: ${localesBackfilled}\n`;
  md += `- **Total keys added**: ${totalAdded}\n`;
  md += `- **All locales now complete**: ${backfillResults[0]?.targetKeyCount || 0} keys each\n\n`;

  // Details by locale
  md += '## Details by Locale\n\n';
  md += '| Locale | Before | Added | After | Completion |\n';
  md += '|--------|--------|-------|-------|------------|\n';

  backfillResults
    .sort((a, b) => b.added - a.added)
    .forEach(result => {
      const before = result.targetKeyCount - result.added;
      const after = result.targetKeyCount;
      const completion = '100%';
      md += `| ${result.locale.padEnd(6)} | ${String(before).padStart(3)} | ${String(result.added).padStart(3)} | ${String(after).padStart(3)} | ${completion} |\n`;
    });

  md += '\n';

  // Next steps
  md += '## Next Steps\n\n';
  md += '1. Review EN placeholders (marked with comment in code)\n';
  md += '2. Plan professional translation for target markets\n';
  md += '3. Community contributions via GitHub\n';
  md += '4. Consider using DeepL for machine translation + review\n\n';

  // Note
  md += '## Note\n\n';
  md += 'All backfilled values are in **English** (placeholders). These should be replaced with proper translations in future releases.\n\n';
  md += 'Priority locales for professional translation:\n';
  md += '- ES (Spanish) - 2nd largest user base\n';
  md += '- DE (German) - European market\n';
  md += '- PT (Portuguese) - Brazilian market\n\n';

  return md;
}

/**
 * Main backfill function
 */
function backfillLocales() {
  console.log('='.repeat(60));
  console.log('06-backfill-locales.js — Backfill incomplete locales');
  console.log('='.repeat(60));

  console.log('\n1. Loading parsed locales...');
  const parsedData = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf8'));
  const { locales, metadata } = parsedData;

  const frFlatMap = locales.fr.flatMap;
  const enFlatMap = locales.en.flatMap;
  const targetKeyCount = metadata.referenceKeyCount;

  console.log(`  ✓ Reference: FR with ${targetKeyCount} keys`);
  console.log(`  ✓ Fallback: EN with ${Object.keys(enFlatMap).length} keys`);

  // Identify incomplete locales
  const incompleteLocales = Object.entries(locales)
    .filter(([locale, data]) => locale !== 'fr' && data.keyCount < targetKeyCount)
    .map(([locale]) => locale);

  if (incompleteLocales.length === 0) {
    console.log('\n✅ All locales are already complete. No backfill needed.\n');
    return;
  }

  console.log(`\n2. Found ${incompleteLocales.length} incomplete locales:`);
  incompleteLocales.forEach(locale => {
    const count = locales[locale].keyCount;
    const missing = targetKeyCount - count;
    const percentage = Math.round((count / targetKeyCount) * 100);
    console.log(`  - ${locale}: ${count}/${targetKeyCount} keys (${percentage}%, missing ${missing})`);
  });

  // Backup locales
  console.log('\n3. Creating backups...');
  const backupDir = path.join(LOCALES_DIR, '.backup-backfill-' + Date.now());
  fs.mkdirSync(backupDir, { recursive: true });
  incompleteLocales.forEach(locale => {
    const src = path.join(LOCALES_DIR, `${locale}.json`);
    const dest = path.join(backupDir, `${locale}.json`);
    fs.copyFileSync(src, dest);
  });
  console.log(`  ✓ Backed up to: ${path.relative(ROOT_DIR, backupDir)}`);

  // Backfill each locale
  console.log('\n4. Backfilling locales...');
  const backfillResults = [];

  incompleteLocales.forEach(locale => {
    const localeFlatMap = { ...locales[locale].flatMap };

    const result = backfillLocale(locale, localeFlatMap, frFlatMap, enFlatMap);

    // Unflatten and write
    const updated = unflattenObject(localeFlatMap);
    const filePath = path.join(LOCALES_DIR, `${locale}.json`);
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2) + '\n', 'utf8');

    console.log(`  ✓ ${locale}: added ${result.added} keys`);

    backfillResults.push({
      locale,
      added: result.added,
      targetKeyCount,
      missingKeys: result.missingKeys
    });
  });

  // Generate report
  console.log('\n5. Generating report...');
  const date = new Date().toISOString().split('T')[0];
  const report = generateReport(backfillResults, date);
  fs.writeFileSync(OUTPUT_FILE, report, 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('BACKFILL COMPLETE');
  console.log('='.repeat(60));

  const totalAdded = backfillResults.reduce((sum, r) => sum + r.added, 0);
  console.log(`\nLocales updated:   ${incompleteLocales.length}`);
  console.log(`Total keys added:  ${totalAdded}`);
  console.log(`All locales now:   ${targetKeyCount} keys (100%)`);
  console.log(`\nReport: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`Backups: ${path.relative(ROOT_DIR, backupDir)}`);

  console.log('\n⚠️  Note: Backfilled values are EN placeholders.');
  console.log('Plan professional translation for production quality.\n');
  console.log('\n✓ Run npm run i18n:audit to verify backfill\n');
}

// Run backfill
backfillLocales();
