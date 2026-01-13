#!/usr/bin/env node
/**
 * Version Bump Script for ResetPulse
 *
 * Automatically increments version across all project files:
 * - package.json
 * - app.json
 * - android/app/build.gradle (versionCode + versionName)
 *
 * Usage:
 *   npm run version:patch  // 1.0.5 -> 1.0.6
 *   npm run version:minor  // 1.0.5 -> 1.1.0
 *   npm run version:major  // 1.0.5 -> 2.0.0
 *   npm run version:set 1.2.3  // Set specific version
 */

const fs = require('fs');
const path = require('path');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.warn(`${color}${message}${colors.reset}`);
}

function readJSON(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function writeJSON(filePath, data) {
  const content = JSON.stringify(data, null, 2) + '\n';
  fs.writeFileSync(filePath, content, 'utf8');
}

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

function parseVersion(versionString) {
  const match = versionString.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${versionString}`);
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

function bumpVersion(version, type) {
  const parsed = parseVersion(version);

  switch (type) {
  case 'major':
    return `${parsed.major + 1}.0.0`;
  case 'minor':
    return `${parsed.major}.${parsed.minor + 1}.0`;
  case 'patch':
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  default:
    throw new Error(`Invalid bump type: ${type}`);
  }
}

function getCurrentVersionCode() {
  const gradlePath = path.join(__dirname, '../android/app/build.gradle');
  const gradleContent = readFile(gradlePath);
  const match = gradleContent.match(/versionCode\s+(\d+)/);
  return match ? parseInt(match[1], 10) : 1;
}

function updatePackageJson(newVersion) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageData = readJSON(packagePath);
  const oldVersion = packageData.version;

  packageData.version = newVersion;
  writeJSON(packagePath, packageData);

  log(`✓ package.json: ${oldVersion} → ${newVersion}`, colors.green);
}

function updateAppJson(newVersion) {
  const appJsonPath = path.join(__dirname, '../app.json');
  const appData = readJSON(appJsonPath);
  const oldVersion = appData.expo.version;

  appData.expo.version = newVersion;
  writeJSON(appJsonPath, appData);

  log(`✓ app.json: ${oldVersion} → ${newVersion}`, colors.green);
}

function updateBuildGradle(newVersion, newVersionCode) {
  const gradlePath = path.join(__dirname, '../android/app/build.gradle');
  let gradleContent = readFile(gradlePath);

  // Extract current values
  const versionCodeMatch = gradleContent.match(/versionCode\s+(\d+)/);
  const versionNameMatch = gradleContent.match(/versionName\s+"([^"]+)"/);

  const oldVersionCode = versionCodeMatch ? versionCodeMatch[1] : '?';
  const oldVersionName = versionNameMatch ? versionNameMatch[1] : '?';

  // Replace versionCode
  gradleContent = gradleContent.replace(
    /versionCode\s+\d+/,
    `versionCode ${newVersionCode}`
  );

  // Replace versionName
  gradleContent = gradleContent.replace(
    /versionName\s+"[^"]+"/,
    `versionName "${newVersion}"`
  );

  writeFile(gradlePath, gradleContent);

  log(`✓ build.gradle versionCode: ${oldVersionCode} → ${newVersionCode}`, colors.green);
  log(`✓ build.gradle versionName: ${oldVersionName} → ${newVersion}`, colors.green);
}

function updateDocumentation(newVersion) {
  const readmePath = path.join(__dirname, '../docs/README.md');

  // Only update if file exists
  if (!fs.existsSync(readmePath)) {
    log('⊘ docs/README.md: skipped (file not found)', colors.yellow);
    return;
  }

  let readmeContent = readFile(readmePath);

  // Replace "Version actuelle : X.X.X"
  readmeContent = readmeContent.replace(
    /\*\*Version actuelle\s*:\*\*\s+\d+\.\d+\.\d+/,
    `**Version actuelle :** ${newVersion}`
  );

  writeFile(readmePath, readmeContent);

  log(`✓ docs/README.md: Version actuelle → ${newVersion}`, colors.green);
}

function main() {
  const args = process.argv.slice(2);

  // Get current version from package.json
  const packagePath = path.join(__dirname, '../package.json');
  const packageData = readJSON(packagePath);
  const currentVersion = packageData.version;

  if (args.length === 0) {
    log(`\n📦 Current version: ${currentVersion}\n`, colors.blue);
    log('Usage:', colors.yellow);
    log(`  npm run version:patch    # ${currentVersion} -> ${bumpVersion(currentVersion, 'patch')}`);
    log(`  npm run version:minor    # ${currentVersion} -> ${bumpVersion(currentVersion, 'minor')}`);
    log(`  npm run version:major    # ${currentVersion} -> ${bumpVersion(currentVersion, 'major')}`);
    log('  npm run version:set 1.2.3\n');
    process.exit(1);
  }

  try {
    log(`\n📦 Current version: ${currentVersion}`, colors.blue);

    // Determine new version
    let newVersion;
    const bumpType = args[0];

    if (bumpType === 'set') {
      if (!args[1]) {
        log('Error: Please provide version number (e.g., npm run version:set 1.2.3)', colors.red);
        process.exit(1);
      }
      newVersion = args[1];
      // Validate format
      parseVersion(newVersion);
    } else if (['major', 'minor', 'patch'].includes(bumpType)) {
      newVersion = bumpVersion(currentVersion, bumpType);
    } else {
      log(`Error: Invalid bump type "${bumpType}"`, colors.red);
      log('Use: major, minor, patch, or set', colors.yellow);
      process.exit(1);
    }

    log(`🚀 New version: ${newVersion}`, colors.bright + colors.green);

    // Get current versionCode and increment
    const currentVersionCode = getCurrentVersionCode();
    const newVersionCode = currentVersionCode + 1;

    log(`📱 Android versionCode: ${currentVersionCode} → ${newVersionCode}\n`, colors.blue);

    // Show what will be updated
    log('Files to update:', colors.yellow);
    log('  • package.json');
    log('  • app.json');
    log('  • android/app/build.gradle (versionCode + versionName)');
    log('  • docs/README.md (if exists)\n');

    // Confirmation prompt (but auto-proceed in CI or non-interactive mode)
    if (process.env.CI || !process.stdin.isTTY) {
      log('Running in non-interactive mode, proceeding...', colors.yellow);
    } else {
      log('Press CTRL+C to cancel, or wait 3 seconds to continue...', colors.yellow);
      // Simple delay instead of readline for compatibility
      const start = Date.now();
      while (Date.now() - start < 3000) {
        // 3 second delay
      }
      log('');
    }

    // Update all files
    log('Updating files...', colors.yellow);
    updatePackageJson(newVersion);
    updateAppJson(newVersion);
    updateBuildGradle(newVersion, newVersionCode);
    updateDocumentation(newVersion);

    log(`\n✨ Success! Version bumped to ${newVersion}`, colors.bright + colors.green);
    log('\nNext steps:', colors.yellow);
    log('  1. Review changes: git diff');
    log('  2. Update CHANGELOG.md manually');
    log(`  3. Commit: git add . && git commit -m "chore: bump version to ${newVersion}"`);
    log('  4. Build: cd android && ./gradlew bundleRelease\n');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();
