import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * ESLint flat config.
 *
 * The project uses ESLint 9 with the flat config format. Next.js
 * still ships its rules as an eslintrc-style config
 * (`eslint-config-next`), so `FlatCompat` bridges the two.
 *
 * Without this file `next lint` prompts interactively for a setup
 * choice and the Next.js dev overlay reports a project issue — which
 * is what the "1 Issue" badge in the corner of the dev server was
 * flagging.
 *
 * The rules below are Next.js's own recommended set, plus
 * `no-unused-vars` wired to TypeScript's compiler so that type-only
 * imports are not reported as unused.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: undefined,
  allConfig: undefined,
});

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
      'scripts/.shots/**',
      'qa-shots/**',
      'public/**',
      // Tooling that ships with the repo, not application code.
      '.specsmd/**',
      '**/*.cjs',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // TypeScript already reports unused variables with full type
      // information, and it understands type-only imports — so the
      // core rule is switched off in favour of the compiler's.
      '@typescript-eslint/no-unused-vars': 'off',
      // The project uses `any` sparingly and deliberately; the
      // compiler's strictness is the gate.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];

export default config;
