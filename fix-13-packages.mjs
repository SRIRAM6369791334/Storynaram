import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = 'E:\\Storynaram';

const FIXES = [
  // ── Domain packages ──
  {
    name: '@storynaram/domain-kernel',
    dir: 'packages/domain/kernel',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: false,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/narrative-domain',
    dir: 'packages/domain/narrative',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/character-domain',
    dir: 'packages/domain/character',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: false,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/composition-domain',
    dir: 'packages/domain/composition',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/canon-domain',
    dir: 'packages/domain/canon',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/timeline-domain',
    dir: 'packages/domain/timeline',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/world-domain',
    dir: 'packages/domain/world',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: false,
    scripts: { typecheck: 'tsc --noEmit' },
  },

  // ── Platform ──
  {
    name: '@storynaram/platform',
    dir: 'packages/platform',
    extends: '../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },

  // ── AI packages ──
  {
    name: '@storynaram/narrative-planner',
    dir: 'packages/ai/narrative-planner',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/narrative-execution',
    dir: 'packages/ai/narrative-execution',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/story-generator',
    dir: 'packages/ai/story-generator',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/revision-engine',
    dir: 'packages/ai/revision-engine',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
  {
    name: '@storynaram/publishing-engine',
    dir: 'packages/ai/publishing-engine',
    extends: '../../../tsconfig.base.json',
    hasDeclOverride: true,
    scripts: { typecheck: 'tsc --noEmit' },
  },
];

function editPackageJson(fix) {
  const pkgPath = join(ROOT, fix.dir, 'package.json');
  let pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  pkg.main = './dist/index.js';
  pkg.types = './dist/index.d.ts';
  pkg.exports = {
    '.': {
      import: './dist/index.js',
      types: './dist/index.d.ts',
    },
  };

  if (!pkg.scripts) pkg.scripts = {};
  pkg.scripts.build = 'tsc';
  for (const [k, v] of Object.entries(fix.scripts)) {
    if (!(k in pkg.scripts)) pkg.scripts[k] = v;
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log(`  package.json: main→dist/index.js, types→dist/index.d.ts, added build script`);
}

function editTsconfig(fix) {
  const tsPath = join(ROOT, fix.dir, 'tsconfig.json');
  let ts = JSON.parse(readFileSync(tsPath, 'utf-8'));

  ts.extends = fix.extends;

  // Remove test and bench from include
  ts.include = ['src/**/*'];

  // Change rootDir to "src" so dist/index.js outputs from src/index.ts
  if (!ts.compilerOptions) ts.compilerOptions = {};
  ts.compilerOptions.rootDir = 'src';

  // Set declaration/declarationMap to true
  if (fix.hasDeclOverride) {
    // Was explicitly set to false, now needs to be true
    ts.compilerOptions.declaration = true;
    ts.compilerOptions.declarationMap = true;
  }
  // For packages without override, they inherit true from base - fine as-is

  writeFileSync(tsPath, JSON.stringify(ts, null, 2) + '\n', 'utf-8');
  console.log(`  tsconfig.json: extends→base, rootDir→src, declaration→true`);
}

console.log('Fixing 13 packages...\n');
for (const fix of FIXES) {
  console.log(`\n${fix.name} (${fix.dir}):`);
  editPackageJson(fix);
  editTsconfig(fix);
}
console.log('\nAll 13 packages updated.');
