#!/usr/bin/env node
/**
 * 02-parse-locales.js
 * Parse all locale JSON files and flatten to dot notation
 *
 * Output: scripts/i18n/parsed-locales.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '../..');
const LOCALES_DIR = path.join(ROOT_DIR, 'locales');
const OUTPUT_FILE = path.join(__dirname, 'parsed-locales.json');

/**
 * Flatten nested object to dot notation
 * Example: { settings: { title: "Paramètres" } } → { "settings.title": "Paramètres" }
 */
function flattenObject(obj, prefix = '') {
  const flattened = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recurse into nested objects
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        // Leaf node - store value
        flattened[newKey] = value;
      }
    }
  }

  return flattened;
}

/**
 * Parse a single locale file
 */
function parseLocale(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(content);
  const flatMap = flattenObject(data);

  return {
    filePath: path.relative(ROOT_DIR, filePath),
    flatMap,
    keyCount: Object.keys(flatMap).length,
    namespaces: extractNamespaces(flatMap)
  };
}

/**
 * Extract unique top-level namespaces from flat keys
 * Example: ["settings.title", "common.ok"] → ["settings", "common"]
 */
function extractNamespaces(flatMap) {
  const namespaces = new Set();
  Object.keys(flatMap).forEach(key => {
    const namespace = key.split('.')[0];
    namespaces.add(namespace);
  });
  return Array.from(namespaces).sort();
}

/**
 * Parse all locales
 */
function parseAllLocales() {
  console.log('='.repeat(60));
  console.log('02-parse-locales.js — Parse locale JSON files');
  console.log('='.repeat(60));

  console.log('\n1. Setup...');
  console.log(`  Locales directory: ${LOCALES_DIR}`);
  console.log(`  Output file: ${OUTPUT_FILE}`);

  // Find all locale JSON files
  const pattern = path.join(LOCALES_DIR, '*.json').replace(/\\/g, '/');
  const files = glob.sync(pattern);

  console.log(`\n2. Parsing ${files.length} locale files...`);

  const locales = {};
  const summary = {
    totalLocales: files.length,
    keyCounts: {},
    namespaces: new Set()
  };

  files.forEach(file => {
    const filename = path.basename(file, '.json');
    const locale = filename; // e.g., "fr", "en", "es"

    console.log(`  Processing: ${locale}.json`);

    const parsed = parseLocale(file);
    locales[locale] = parsed;

    summary.keyCounts[locale] = parsed.keyCount;
    parsed.namespaces.forEach(ns => summary.namespaces.add(ns));
  });

  // Convert namespaces Set to sorted array
  summary.namespaces = Array.from(summary.namespaces).sort();

  // Find reference locale (FR = 100%)
  const referenceLocale = 'fr';
  const referenceCount = summary.keyCounts[referenceLocale] || 0;

  // Calculate completion percentages
  const completion = {};
  Object.keys(summary.keyCounts).forEach(locale => {
    const count = summary.keyCounts[locale];
    const percentage = referenceCount > 0
      ? Math.round((count / referenceCount) * 100)
      : 0;
    completion[locale] = {
      count,
      percentage,
      missing: referenceCount - count
    };
  });

  // Build output
  const output = {
    metadata: {
      parsedAt: new Date().toISOString(),
      localesDirectory: 'locales/',
      totalLocales: summary.totalLocales,
      referenceLocale,
      referenceKeyCount: referenceCount
    },
    locales,
    summary: {
      keyCounts: summary.keyCounts,
      completion,
      namespaces: summary.namespaces,
      namespaceCount: summary.namespaces.length
    }
  };

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('PARSING COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nTotal locales:     ${summary.totalLocales}`);
  console.log(`Reference locale:  ${referenceLocale} (${referenceCount} keys)`);
  console.log(`Namespaces:        ${summary.namespaces.length} (${summary.namespaces.join(', ')})`);

  console.log('\nCompletion by locale:');
  Object.entries(completion)
    .sort((a, b) => b[1].percentage - a[1].percentage)
    .forEach(([locale, stats]) => {
      const bar = '█'.repeat(Math.floor(stats.percentage / 5));
      const status = stats.percentage === 100 ? '✓' : '○';
      console.log(`  ${status} ${locale.padEnd(10)} ${String(stats.percentage).padStart(3)}% ${bar} (${stats.count} keys, ${stats.missing} missing)`);
    });

  console.log(`\nOutput written to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log('\n✓ Ready for next step: 03-audit-sync.js\n');
}

// Run parsing
parseAllLocales();
