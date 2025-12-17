#!/usr/bin/env node

/**
 * Script to detect which node_modules need Jest transformation
 * Helps maintain an optimal transformIgnorePatterns configuration
 */

const fs = require('fs');
const path = require('path');

function checkForESModules(dir) {

  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf8')
    );

    // Check if package uses ES modules
    if (packageJson.type === 'module' || packageJson.module) {
      return true;
    }

    // Check main entry point
    if (packageJson.main) {
      const mainPath = path.join(dir, packageJson.main);
      if (fs.existsSync(mainPath)) {
        const content = fs.readFileSync(mainPath, 'utf8').slice(0, 1000);
        if (
          content.includes('export ') ||
          content.includes('import ') ||
          content.includes('export{') ||
          content.includes('import{')
        ) {
          return true;
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }

  return false;
}

function scanNodeModules() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const packagesNeedingTransform = [];

  // Read all packages in node_modules
  const packages = fs.readdirSync(nodeModulesPath);

  packages.forEach(pkg => {
    // Skip hidden files and .bin
    if (pkg.startsWith('.')) {
      return;
    }

    const pkgPath = path.join(nodeModulesPath, pkg);

    // Handle scoped packages
    if (pkg.startsWith('@')) {
      const scopedPackages = fs.readdirSync(pkgPath);
      scopedPackages.forEach(scopedPkg => {
        const fullPath = path.join(pkgPath, scopedPkg);
        if (checkForESModules(fullPath)) {
          packagesNeedingTransform.push(`${pkg}/${scopedPkg}`);
        }
      });
    } else if (checkForESModules(pkgPath)) {
      packagesNeedingTransform.push(pkg);
    }
  });

  return packagesNeedingTransform;
}

console.warn('🔍 Scanning node_modules for packages needing Jest transformation...\n');

const detectedPackages = scanNodeModules();

if (detectedPackages.length > 0) {
  console.warn('📦 Detected packages with ES modules:');
  detectedPackages.forEach(pkg => console.warn(`  - ${pkg}`));
}

console.warn('\n💡 Suggested patterns for transformIgnorePatterns:');
const patterns = new Set();

// Add common patterns
detectedPackages.forEach(pkg => {
  // Extract pattern
  if (pkg.startsWith('@')) {
    const scope = pkg.split('/')[0];
    patterns.add(scope);
    patterns.add(`${scope}/.*`);
  } else if (pkg.startsWith('react-native-')) {
    patterns.add('react-native-.*');
  } else if (pkg.startsWith('expo-')) {
    patterns.add('expo-.*');
  } else {
    patterns.add(pkg);
  }
});

if (patterns.size > 0) {
  console.warn('\nconst packagesToTransform = [');
  Array.from(patterns).sort().forEach(pattern => {
    console.warn(`  '${pattern}',`);
  });
  console.warn('];');
}

console.warn('\n✅ Add these to your jest.config.js transformIgnorePatterns');