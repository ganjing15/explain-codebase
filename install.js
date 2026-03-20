#!/usr/bin/env node
// Install the explain-codebase skill into NanoClaw.
// Run from your NanoClaw project root:
//   node groups/main/explain-codebase-skill/install.js

const fs = require('fs');
const path = require('path');

const SRC  = path.join(__dirname);
const DEST = path.join(__dirname, '../../../container/skills/explain-codebase');

if (fs.existsSync(DEST)) {
  fs.rmSync(DEST, { recursive: true });
  console.log('Removed old version.');
}

fs.mkdirSync(DEST, { recursive: true });

for (const entry of fs.readdirSync(SRC, { withFileTypes: true })) {
  if (entry.name === 'install.js' || entry.name === '.git' || entry.name === 'nanoclaw-architecture.html') continue;
  const srcPath = path.join(SRC, entry.name);
  const destPath = path.join(DEST, entry.name);
  if (entry.isDirectory()) {
    fs.mkdirSync(destPath, { recursive: true });
    for (const file of fs.readdirSync(srcPath)) {
      fs.copyFileSync(path.join(srcPath, file), path.join(destPath, file));
      console.log(`  ✅ Copied ${entry.name}/${file}`);
    }
  } else {
    fs.copyFileSync(srcPath, destPath);
    console.log(`  ✅ Copied ${entry.name}`);
  }
}

console.log(`\n✅ explain-codebase skill installed at: container/skills/explain-codebase/`);
console.log(`\nThe skill will be available to all groups on next container start.`);
console.log(`No rebuild needed — skills are copied fresh on each agent launch.\n`);
console.log(`Usage (in any Lark/Telegram chat):`);
console.log(`  /explain-codebase`);
console.log(`  /explain-codebase /workspace/project --audience simple`);
console.log(`  /explain-codebase /workspace/extra/myapp --audience technical`);
