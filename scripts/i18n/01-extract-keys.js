#!/usr/bin/env node
/**
 * 01-extract-keys.js
 * Extract all i18n keys used in code (static + dynamic patterns)
 *
 * Output: scripts/i18n/extracted-keys.json
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

const ROOT_DIR = path.join(__dirname, '../..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const OUTPUT_FILE = path.join(__dirname, 'extracted-keys.json');

// Regex patterns for extracting t() calls
const STATIC_KEY_REGEX = /\bt\((['"`])([^'"`]+)\1\)/g;
const DYNAMIC_KEY_REGEX = /\bt\(`([^`]*\$\{[^}]+\}[^`]*)`\)/g;

/**
 * Extract all activity IDs from activities.js
 */
function extractActivityIds() {
  const activitiesFile = path.join(SRC_DIR, 'config/activities.js');
  const content = fs.readFileSync(activitiesFile, 'utf8');

  // Extract IDs from activity objects
  const idMatches = content.matchAll(/id:\s*['"]([^'"]+)['"]/g);
  const activityIds = Array.from(idMatches).map(match => match[1]);

  console.log(`  ✓ Found ${activityIds.length} activity IDs`);
  return activityIds;
}

/**
 * Extract all sound IDs from sounds-mapping.js
 */
function extractSoundIds() {
  const soundsFile = path.join(SRC_DIR, 'config/sounds-mapping.js');
  const content = fs.readFileSync(soundsFile, 'utf8');

  // Extract keys from SOUND_FILES object
  const keyMatches = content.matchAll(/['"]([^'"]+)['"]\s*:\s*require\(/g);
  const soundIds = Array.from(keyMatches).map(match => match[1]);

  console.log(`  ✓ Found ${soundIds.length} sound IDs`);
  return soundIds;
}

/**
 * Resolve dynamic patterns into concrete keys
 */
function resolveDynamicPatterns() {
  console.log('\n2. Resolving dynamic patterns...');

  const activityIds = extractActivityIds();
  const soundIds = extractSoundIds();

  const dynamicKeys = {
    timerMessages: [],
    sounds: []
  };

  // Generate timerMessages keys (startMessage + endMessage for each activity)
  activityIds.forEach(activityId => {
    dynamicKeys.timerMessages.push(`timerMessages.${activityId}.startMessage`);
    dynamicKeys.timerMessages.push(`timerMessages.${activityId}.endMessage`);
  });

  // Generate sounds keys
  soundIds.forEach(soundId => {
    dynamicKeys.sounds.push(`sounds.${soundId}`);
  });

  console.log(`  ✓ Generated ${dynamicKeys.timerMessages.length} timerMessages keys`);
  console.log(`  ✓ Generated ${dynamicKeys.sounds.length} sounds keys`);

  return dynamicKeys;
}

/**
 * Extract static keys from all source files
 */
function extractStaticKeys() {
  console.log('\n3. Extracting static keys from source files...');

  // Find all .js/.jsx files in src/
  const pattern = path.join(SRC_DIR, '**/*.{js,jsx}').replace(/\\/g, '/');
  const files = glob.sync(pattern, {
    ignore: [
      '**/node_modules/**',
      '**/__tests__/**',
      '**/*.test.{js,jsx}',
      '**/*.spec.{js,jsx}'
    ]
  });

  console.log(`  ✓ Scanning ${files.length} files...`);

  const staticKeys = new Set();
  const dynamicPatterns = [];
  const fileUsage = {}; // Track which files use which keys

  files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(ROOT_DIR, file);

    // Extract static keys: t('key') or t("key")
    // Exclude template literals with ${} patterns (those are handled as dynamic)
    let match;
    const staticRegex = new RegExp(STATIC_KEY_REGEX.source, 'g');
    while ((match = staticRegex.exec(content)) !== null) {
      const key = match[2];

      // Skip if key contains ${} template literal syntax
      if (key.includes('${')) {
        continue;
      }

      staticKeys.add(key);

      if (!fileUsage[key]) fileUsage[key] = [];
      fileUsage[key].push(relativePath);
    }

    // Extract dynamic patterns: t(`pattern.${var}`)
    const dynamicRegex = new RegExp(DYNAMIC_KEY_REGEX.source, 'g');
    while ((match = dynamicRegex.exec(content)) !== null) {
      const pattern = match[1];
      dynamicPatterns.push({
        pattern,
        file: relativePath
      });
    }
  });

  console.log(`  ✓ Found ${staticKeys.size} unique static keys`);
  console.log(`  ✓ Found ${dynamicPatterns.length} dynamic pattern usages`);

  return {
    staticKeys: Array.from(staticKeys).sort(),
    dynamicPatterns,
    fileUsage
  };
}

/**
 * Main extraction function
 */
function extractKeys() {
  console.log('='.repeat(60));
  console.log('01-extract-keys.js — Extract i18n keys from code');
  console.log('='.repeat(60));

  console.log('\n1. Setup...');
  console.log(`  Source directory: ${SRC_DIR}`);
  console.log(`  Output file: ${OUTPUT_FILE}`);

  // Extract static keys
  const { staticKeys, dynamicPatterns, fileUsage } = extractStaticKeys();

  // Resolve dynamic patterns
  const dynamicKeys = resolveDynamicPatterns();

  // Flatten all dynamic keys
  const allDynamicKeys = [
    ...dynamicKeys.timerMessages,
    ...dynamicKeys.sounds
  ];

  // Merge static + dynamic
  const allKeys = [...staticKeys, ...allDynamicKeys].sort();

  // Build output
  const output = {
    metadata: {
      extractedAt: new Date().toISOString(),
      sourceDirectory: 'src/',
      filesScanned: Object.keys(fileUsage).length
    },
    staticKeys,
    dynamicKeys,
    allKeys,
    statistics: {
      staticCount: staticKeys.length,
      dynamicCount: allDynamicKeys.length,
      totalCount: allKeys.length,
      dynamicPatternUsages: dynamicPatterns.length
    },
    patterns: dynamicPatterns,
    fileUsage
  };

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`\nStatic keys:       ${output.statistics.staticCount}`);
  console.log(`Dynamic keys:      ${output.statistics.dynamicCount}`);
  console.log(`  - timerMessages: ${dynamicKeys.timerMessages.length}`);
  console.log(`  - sounds:        ${dynamicKeys.sounds.length}`);
  console.log(`Total keys:        ${output.statistics.totalCount}`);
  console.log(`\nOutput written to: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log('\n✓ Ready for next step: 02-parse-locales.js\n');
}

// Run extraction
extractKeys();
