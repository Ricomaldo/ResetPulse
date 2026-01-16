#!/usr/bin/env node
/**
 * 03-audit-sync.js
 * Compare code vs locales, detect P0/P1/P2/P3 issues
 *
 * Output: scripts/i18n/audit-results.json
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const EXTRACTED_FILE = path.join(__dirname, 'extracted-keys.json');
const PARSED_FILE = path.join(__dirname, 'parsed-locales.json');
const OUTPUT_FILE = path.join(__dirname, 'audit-results.json');

/**
 * Detect P0: Missing keys (used in code, not in FR)
 */
function detectMissingKeys(extractedKeys, frFlatMap) {
  const missing = [];
  const frKeys = new Set(Object.keys(frFlatMap));

  extractedKeys.allKeys.forEach(key => {
    if (!frKeys.has(key)) {
      missing.push({
        key,
        severity: 'P0',
        issue: 'Missing key',
        impact: 'Runtime error: [missing translation]',
        usedIn: extractedKeys.fileUsage[key] || ['(dynamic pattern)']
      });
    }
  });

  return missing;
}

/**
 * Detect P2: Obsolete keys (in FR, never used in code)
 */
function detectObsoleteKeys(extractedKeys, frFlatMap) {
  const obsolete = [];
  const usedKeys = new Set(extractedKeys.allKeys);

  Object.entries(frFlatMap).forEach(([key, value]) => {
    if (!usedKeys.has(key)) {
      obsolete.push({
        key,
        value,
        severity: 'P2',
        issue: 'Obsolete key',
        impact: 'Dead code, bloat (~2KB)'
      });
    }
  });

  return obsolete;
}

/**
 * Detect P3: Duplicate values (same FR value under multiple keys)
 */
function detectDuplicateValues(frFlatMap) {
  const duplicates = [];
  const valueToKeys = {};

  // Group keys by value
  Object.entries(frFlatMap).forEach(([key, value]) => {
    if (typeof value === 'string' && value.trim()) {
      if (!valueToKeys[value]) {
        valueToKeys[value] = [];
      }
      valueToKeys[value].push(key);
    }
  });

  // Find duplicates (value appears in > 1 key)
  Object.entries(valueToKeys).forEach(([value, keys]) => {
    if (keys.length > 1) {
      // Determine canonical key (prefer common.* > shortest key)
      const canonical = keys.find(k => k.startsWith('common.'))
        || keys.sort((a, b) => a.length - b.length)[0];

      duplicates.push({
        value,
        keys: keys.sort(),
        canonicalKey: canonical,
        duplicateCount: keys.length,
        severity: 'P3',
        issue: 'Duplicate value',
        impact: 'Redundancy, confusion',
        recommendation: `Consolidate to ${canonical}`
      });
    }
  });

  return duplicates;
}

/**
 * Detect P1: Locale pollution (FR string in EN/ES)
 * Heuristic: EN value === FR value (likely not translated)
 */
function detectLocalePollution(frFlatMap, allLocales) {
  const pollution = [];
  const targetLocales = ['en', 'es', 'de', 'it', 'pt']; // Check major locales

  targetLocales.forEach(locale => {
    if (!allLocales[locale]) return;

    const localeFlatMap = allLocales[locale].flatMap;

    Object.entries(frFlatMap).forEach(([key, frValue]) => {
      const localeValue = localeFlatMap[key];

      // Skip if key doesn't exist in target locale
      if (!localeValue) return;

      // Heuristic: Same value = likely not translated
      // Exceptions: numbers, symbols, proper nouns
      if (frValue === localeValue && typeof frValue === 'string') {
        // Skip if it's a number, emoji, or very short (< 3 chars)
        if (frValue.length < 3 || /^[\d\s]+$/.test(frValue) || /[\u{1F300}-\u{1F9FF}]/u.test(frValue)) {
          return;
        }

        pollution.push({
          key,
          locale,
          frValue,
          localeValue,
          severity: 'P1',
          issue: 'Locale pollution',
          impact: 'Wrong language displayed',
          recommendation: `Translate ${locale} value`
        });
      }
    });
  });

  return pollution;
}

/**
 * Validate dynamic keys exist in FR
 */
function validateDynamicKeys(extractedKeys, frFlatMap) {
  const validation = {
    timerMessages: { valid: [], invalid: [] },
    sounds: { valid: [], invalid: [] }
  };

  const frKeys = new Set(Object.keys(frFlatMap));

  // Check timerMessages keys
  extractedKeys.dynamicKeys.timerMessages.forEach(key => {
    if (frKeys.has(key)) {
      validation.timerMessages.valid.push(key);
    } else {
      validation.timerMessages.invalid.push(key);
    }
  });

  // Check sounds keys
  extractedKeys.dynamicKeys.sounds.forEach(key => {
    if (frKeys.has(key)) {
      validation.sounds.valid.push(key);
    } else {
      validation.sounds.invalid.push(key);
    }
  });

  return validation;
}

/**
 * Calculate statistics
 */
function calculateStatistics(extractedKeys, frFlatMap, findings) {
  const totalKeysInCode = extractedKeys.allKeys.length;
  const totalKeysInFR = Object.keys(frFlatMap).length;
  const usedKeys = totalKeysInFR - findings.obsoleteKeys.length;
  const codeCoverage = totalKeysInFR > 0
    ? Math.round((usedKeys / totalKeysInFR) * 100)
    : 0;

  return {
    totalKeysInCode,
    totalKeysInFR,
    usedKeys,
    deadKeys: findings.obsoleteKeys.length,
    codeCoverage: `${codeCoverage}%`,
    missingKeys: findings.missingKeys.length,
    pollutionIssues: findings.localePollution.length,
    duplicateGroups: findings.duplicateValues.length
  };
}

/**
 * Determine production readiness
 */
function determineReadiness(findings) {
  const blockers = findings.missingKeys.length;

  if (blockers > 0) {
    return {
      status: 'BLOCKING',
      emoji: '⚠️',
      message: `${blockers} P0 missing keys must be fixed`
    };
  }

  const highIssues = findings.localePollution.length;
  if (highIssues > 0) {
    return {
      status: 'WARNING',
      emoji: '⚠️',
      message: `${highIssues} P1 locale pollution issues should be fixed`
    };
  }

  return {
    status: 'READY',
    emoji: '✅',
    message: 'No blocking issues'
  };
}

/**
 * Main audit function
 */
function runAudit() {
  console.log('='.repeat(60));
  console.log('03-audit-sync.js — Audit code vs locales');
  console.log('='.repeat(60));

  console.log('\n1. Loading data...');

  // Load extracted keys
  const extractedKeys = JSON.parse(fs.readFileSync(EXTRACTED_FILE, 'utf8'));
  console.log(`  ✓ Loaded ${extractedKeys.statistics.totalCount} extracted keys`);

  // Load parsed locales
  const parsedLocales = JSON.parse(fs.readFileSync(PARSED_FILE, 'utf8'));
  const frLocale = parsedLocales.locales.fr;
  console.log(`  ✓ Loaded ${Object.keys(parsedLocales.locales).length} locales`);
  console.log(`  ✓ FR locale: ${frLocale.keyCount} keys`);

  console.log('\n2. Running detections...');

  // P0: Missing keys
  console.log('  [P0] Detecting missing keys...');
  const missingKeys = detectMissingKeys(extractedKeys, frLocale.flatMap);
  console.log(`       Found ${missingKeys.length} missing keys`);

  // P1: Locale pollution
  console.log('  [P1] Detecting locale pollution...');
  const localePollution = detectLocalePollution(frLocale.flatMap, parsedLocales.locales);
  console.log(`       Found ${localePollution.length} pollution issues`);

  // P2: Obsolete keys
  console.log('  [P2] Detecting obsolete keys...');
  const obsoleteKeys = detectObsoleteKeys(extractedKeys, frLocale.flatMap);
  console.log(`       Found ${obsoleteKeys.length} obsolete keys`);

  // P3: Duplicate values
  console.log('  [P3] Detecting duplicate values...');
  const duplicateValues = detectDuplicateValues(frLocale.flatMap);
  console.log(`       Found ${duplicateValues.length} duplicate groups`);

  // Validate dynamic keys
  console.log('  [DYN] Validating dynamic keys...');
  const dynamicValidation = validateDynamicKeys(extractedKeys, frLocale.flatMap);
  console.log(`       timerMessages: ${dynamicValidation.timerMessages.valid.length}/${extractedKeys.dynamicKeys.timerMessages.length} valid`);
  console.log(`       sounds: ${dynamicValidation.sounds.valid.length}/${extractedKeys.dynamicKeys.sounds.length} valid`);

  // Build findings
  const findings = {
    missingKeys,
    localePollution,
    obsoleteKeys,
    duplicateValues
  };

  // Calculate statistics
  const statistics = calculateStatistics(extractedKeys, frLocale.flatMap, findings);

  // Determine readiness
  const readiness = determineReadiness(findings);

  // Build output
  const output = {
    metadata: {
      auditedAt: new Date().toISOString(),
      auditType: 'baseline',
      referenceLocale: 'fr'
    },
    findings,
    dynamicValidation,
    statistics,
    readiness
  };

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nSeverity Summary:`);
  console.log(`  P0 (Critical):  ${missingKeys.length} missing keys`);
  console.log(`  P1 (High):      ${localePollution.length} locale pollution issues`);
  console.log(`  P2 (Medium):    ${obsoleteKeys.length} obsolete keys`);
  console.log(`  P3 (Low):       ${duplicateValues.length} duplicate groups`);

  console.log(`\nProduction Readiness: ${readiness.emoji} ${readiness.status}`);
  console.log(`  ${readiness.message}`);

  console.log(`\nOutput written to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log('\n✓ Ready for next step: 04-generate-report.js\n');
}

// Run audit
runAudit();
