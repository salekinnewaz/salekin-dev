#!/usr/bin/env tsx
/**
 * generate-allure-report.ts
 *
 * Builds the Salekin E2E Allure report with the custom dark theme.
 *
 * Why a script (not just `allure generate`):
 *   - `--configDirectory tests/allure-config` enables the
 *     `plugins/salekin-theme/` plugin (dark theme + accent palette).
 *   - `--report-name "Salekin E2E — <date>"` gives the report a
 *     branded title instead of the default "Allure Report".
 *   - `environment.properties` and `categories.json` must live in
 *     `./allure-results/` (not in the config dir) for Allure 2 to
 *     pick them up. We copy them in before generation.
 *   - We run from a clean `./allure-report/` to avoid stale assets.
 *
 * Usage:
 *   pnpm tsx scripts/generate-allure-report.ts
 *   # or, after `pnpm test:e2e`:
 *   pnpm tsx scripts/generate-allure-report.ts
 *
 * The script does NOT re-run tests. Run `pnpm test:e2e` first if
 * you want fresh results.
 */
import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const RESULTS_DIR = path.join(ROOT, 'allure-results');
const REPORT_DIR = path.join(ROOT, 'allure-report');
const CONFIG_DIR = path.join(ROOT, 'tests', 'allure-config');
const ENV_FILE = path.join(CONFIG_DIR, 'environment.properties');
const CATEGORIES_FILE = path.join(CONFIG_DIR, 'categories.json');

const REPORT_NAME = `Salekin E2E — ${new Date().toISOString().slice(0, 10)}`;

function log(msg: string): void {
  console.log(`[allure] ${msg}`);
}

if (!existsSync(RESULTS_DIR)) {
  console.error(
    `[allure] No ./allure-results/ directory found. Run \`pnpm test:e2e\` first.`,
  );
  process.exit(1);
}

// Ensure results dir exists for the copies below (it does, we just checked).
log(`Copying environment.properties → ${RESULTS_DIR}`);
copyFileSync(ENV_FILE, path.join(RESULTS_DIR, 'environment.properties'));

if (existsSync(CATEGORIES_FILE)) {
  log(`Copying categories.json → ${RESULTS_DIR}`);
  copyFileSync(CATEGORIES_FILE, path.join(RESULTS_DIR, 'categories.json'));
}

if (existsSync(REPORT_DIR)) {
  log(`Removing stale ${REPORT_DIR}`);
  rmSync(REPORT_DIR, { recursive: true, force: true });
}
mkdirSync(REPORT_DIR, { recursive: true });

log(`Generating report: "${REPORT_NAME}"`);
log(`  config: ${CONFIG_DIR}`);
log(`  output: ${REPORT_DIR}`);

const cmd = [
  'pnpm',
  'exec',
  'allure',
  'generate',
  RESULTS_DIR,
  '-o',
  REPORT_DIR,
  '--clean',
  // camelCase per `allure generate --help` (this is what the
  // 2.46.1 CLI accepts; the kebab-case form is silently ignored
  // and Allure falls back to the default config).
  '--configDirectory',
  CONFIG_DIR,
  '--report-name',
  `"${REPORT_NAME}"`,
].join(' ');

try {
  execSync(cmd, { stdio: 'inherit' });
} catch (err) {
  console.error('[allure] Report generation failed:', err);
  process.exit(1);
}

log('Done. Open with: pnpm test:e2e:allure:open');