#!/usr/bin/env node
/**
 * 04-generate-report.js
 * Generate human-readable markdown audit report
 *
 * Output: _internal/docs/audits/audit-YYYY-MM-DD/reports/YYYY-MM-DD_i18n-{baseline|validation}.md
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const AUDIT_FILE = path.join(__dirname, 'audit-results.json');

/**
 * Determine audit type (baseline or validation)
 */
function determineAuditType(auditDir) {
  const reportsDir = path.join(auditDir, 'reports');
  if (!fs.existsSync(reportsDir)) {
    return 'baseline';
  }

  const files = fs.readdirSync(reportsDir);
  const hasBaseline = files.some(f => f.includes('baseline'));
  return hasBaseline ? 'validation' : 'baseline';
}

/**
 * Generate markdown table for findings
 */
function generateFindingsTable(findings, type) {
  if (findings.length === 0) {
    return '_No issues found._\n';
  }

  let table = '';

  switch (type) {
    case 'missingKeys':
      table += '| Key | Impact | Used In |\n';
      table += '|-----|--------|----------|\n';
      findings.forEach(f => {
        const files = f.usedIn.join(', ');
        table += `| \`${f.key}\` | ${f.impact} | ${files} |\n`;
      });
      break;

    case 'localePollution':
      table += '| Key | Locale | FR Value | Current Value |\n';
      table += '|-----|--------|----------|---------------|\n';
      findings.forEach(f => {
        table += `| \`${f.key}\` | ${f.locale} | ${f.frValue} | ${f.localeValue} |\n`;
      });
      break;

    case 'obsoleteKeys':
      table += '| Key | Value | Impact |\n';
      table += '|-----|-------|--------|\n';
      findings.slice(0, 20).forEach(f => { // Limit to first 20
        table += `| \`${f.key}\` | ${f.value} | ${f.impact} |\n`;
      });
      if (findings.length > 20) {
        table += `| ... | _${findings.length - 20} more keys_ | ... |\n`;
      }
      break;

    case 'duplicateValues':
      table += '| Value | Keys | Recommendation |\n';
      table += '|-------|------|----------------|\n';
      findings.slice(0, 15).forEach(f => { // Limit to first 15
        const keys = f.keys.map(k => `\`${k}\``).join(', ');
        table += `| ${f.value} | ${keys} | ${f.recommendation} |\n`;
      });
      if (findings.length > 15) {
        table += `| ... | _${findings.length - 15} more groups_ | ... |\n`;
      }
      break;
  }

  return table;
}

/**
 * Generate markdown report
 */
function generateReport(audit, auditType, date) {
  const { findings, statistics, readiness, dynamicValidation } = audit;

  let md = '';

  // Frontmatter
  md += '---\n';
  md += `created: '${date}'\n`;
  md += `updated: '${date}'\n`;
  md += 'status: active\n';
  md += `audit_type: ${auditType}\n`;
  md += 'domain: i18n\n';
  md += '---\n\n';

  // Title
  md += `# i18n Audit ${auditType === 'baseline' ? 'Baseline' : 'Validation'} — ResetPulse (${date})\n\n`;

  // Executive Summary
  md += '## Executive Summary\n\n';
  md += `- **Total keys in FR**: ${statistics.totalKeysInFR}\n`;
  md += `- **Total keys used in code**: ${statistics.totalKeysInCode}\n`;
  md += `- **Missing keys (P0)**: ${findings.missingKeys.length}\n`;
  md += `- **Obsolete keys (P2)**: ${findings.obsoleteKeys.length}\n`;
  md += `- **Duplicate values (P3)**: ${findings.duplicateValues.length}\n`;
  md += `- **Locale pollution (P1)**: ${findings.localePollution.length}\n`;
  md += `- **Production readiness**: ${readiness.emoji} **${readiness.status}** (${readiness.message})\n\n`;

  // Findings by Severity
  md += '## Findings by Severity\n\n';

  // P0 Critical
  md += `### P0 Critical Blockers (${findings.missingKeys.length} found)\n\n`;
  if (findings.missingKeys.length > 0) {
    md += '**Impact**: Runtime errors, app will show `[missing translation]` to users.\n\n';
    md += generateFindingsTable(findings.missingKeys, 'missingKeys');
  } else {
    md += '✅ No missing keys detected.\n';
  }
  md += '\n';

  // P1 High
  md += `### P1 High — Locale Pollution (${findings.localePollution.length} found)\n\n`;
  if (findings.localePollution.length > 0) {
    md += '**Impact**: Wrong language displayed to users (French text in English/Spanish locales).\n\n';
    md += generateFindingsTable(findings.localePollution, 'localePollution');
  } else {
    md += '✅ No locale pollution detected.\n';
  }
  md += '\n';

  // P2 Medium
  md += `### P2 Medium — Obsolete Keys (${findings.obsoleteKeys.length} found)\n\n`;
  if (findings.obsoleteKeys.length > 0) {
    md += '**Impact**: Dead code, bloat (~2KB). Safe to remove.\n\n';
    md += generateFindingsTable(findings.obsoleteKeys, 'obsoleteKeys');
  } else {
    md += '✅ No obsolete keys detected.\n';
  }
  md += '\n';

  // P3 Low
  md += `### P3 Low — Duplicate Values (${findings.duplicateValues.length} found)\n\n`;
  if (findings.duplicateValues.length > 0) {
    md += '**Impact**: Redundancy, confusion. Consider consolidating to canonical keys.\n\n';
    md += generateFindingsTable(findings.duplicateValues, 'duplicateValues');
  } else {
    md += '✅ No duplicate values detected.\n';
  }
  md += '\n';

  // Dynamic Key Validation
  md += '## Dynamic Key Validation\n\n';
  md += '**timerMessages**:\n';
  if (dynamicValidation.timerMessages.invalid.length === 0) {
    md += `- ✅ All ${dynamicValidation.timerMessages.valid.length} timerMessages keys exist\n`;
  } else {
    md += `- ⚠️ ${dynamicValidation.timerMessages.invalid.length} missing: ${dynamicValidation.timerMessages.invalid.join(', ')}\n`;
  }

  md += '\n**sounds**:\n';
  if (dynamicValidation.sounds.invalid.length === 0) {
    md += `- ✅ All ${dynamicValidation.sounds.valid.length} sounds keys exist\n`;
  } else {
    md += `- ⚠️ ${dynamicValidation.sounds.invalid.length} missing: ${dynamicValidation.sounds.invalid.join(', ')}\n`;
  }
  md += '\n';

  // Statistics
  md += '## Statistics\n\n';
  md += `- **Code coverage**: ${statistics.codeCoverage} (${statistics.usedKeys}/${statistics.totalKeysInFR} keys used)\n`;
  md += `- **Dead keys**: ${statistics.deadKeys} (${Math.round((statistics.deadKeys / statistics.totalKeysInFR) * 100)}%)\n`;
  md += `- **Locale completion**: FR/EN 100%, Others vary (see locales summary)\n\n`;

  // Recommendations
  md += '## Recommendations\n\n';
  const recommendations = [];

  if (findings.missingKeys.length > 0) {
    recommendations.push(`1. **Fix ${findings.missingKeys.length} P0 missing keys** before production (BLOCKING)`);
  }
  if (findings.localePollution.length > 0) {
    recommendations.push(`2. **Fix ${findings.localePollution.length} P1 locale pollution issues** (HIGH priority)`);
  }
  if (findings.obsoleteKeys.length > 0) {
    recommendations.push(`3. **Remove ${findings.obsoleteKeys.length} P2 obsolete keys** (optional, cleanup)`);
  }
  if (findings.duplicateValues.length > 0) {
    recommendations.push(`4. **Consider consolidating ${findings.duplicateValues.length} P3 duplicate groups** (future optimization)`);
  }

  if (recommendations.length > 0) {
    recommendations.forEach(rec => md += rec + '\n');
  } else {
    md += '✅ No critical issues. Codebase is production-ready for i18n.\n';
  }

  md += '\n';

  // Next Steps (only for baseline)
  if (auditType === 'baseline') {
    md += '## Next Steps\n\n';
    md += '1. Review findings with project lead\n';
    md += '2. Fix P0 and P1 issues (Session 2)\n';
    md += '3. Optional: Fix P2 and P3 issues\n';
    md += '4. Run validation audit: `npm run i18n:validate`\n';
    md += '5. Archive audit cycle\n\n';
  }

  return md;
}

/**
 * Main report generation function
 */
function generateReportMain() {
  console.log('='.repeat(60));
  console.log('04-generate-report.js — Generate audit report');
  console.log('='.repeat(60));

  console.log('\n1. Loading audit results...');
  const audit = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'));

  // Determine date and audit type
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const auditDir = path.join(ROOT_DIR, '_internal/docs/audits', `audit-${date}`);
  const reportsDir = path.join(auditDir, 'reports');

  const auditType = determineAuditType(auditDir);
  console.log(`  ✓ Audit type: ${auditType}`);

  // Create directories
  fs.mkdirSync(reportsDir, { recursive: true });

  // Generate report
  console.log('\n2. Generating markdown report...');
  const report = generateReport(audit, auditType, date);

  // Write report
  const reportFile = path.join(reportsDir, `${date}_i18n-${auditType}.md`);
  fs.writeFileSync(reportFile, report, 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('REPORT GENERATED');
  console.log('='.repeat(60));
  console.log(`\nReport type:  ${auditType}`);
  console.log(`Output file:  ${path.relative(ROOT_DIR, reportFile)}`);

  console.log('\n📊 Summary:');
  console.log(`  P0: ${audit.findings.missingKeys.length} critical`);
  console.log(`  P1: ${audit.findings.localePollution.length} high`);
  console.log(`  P2: ${audit.findings.obsoleteKeys.length} medium`);
  console.log(`  P3: ${audit.findings.duplicateValues.length} low`);
  console.log(`\n  Status: ${audit.readiness.emoji} ${audit.readiness.status}`);

  console.log(`\n✓ Report ready for review: ${reportFile}\n`);
}

// Run report generation
generateReportMain();
