#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false, ...options });
  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }
}

function runQuiet(command, args, options = {}) {
  return spawnSync(command, args, { stdio: 'pipe', shell: false, ...options });
}

function getVersion() {
  const pkgPath = join(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function getReleaseNotes(version) {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  const changelog = readFileSync(changelogPath, 'utf-8');
  
  // Find the section for this version
  const versionSection = changelog.split(`## ${version}`)[1];
  if (!versionSection) {
    return `# What's New in v${version}\n\nAutomated release.`;
  }
  
  // Extract content until the next version section
  const nextVersionMatch = versionSection.match(/\n## \d+\.\d+\.\d+/);
  const content = nextVersionMatch 
    ? versionSection.substring(0, nextVersionMatch.index)
    : versionSection;
  
  // Clean up the content
  const cleanedContent = content
    .replace(/^### Minor Changes\n/, '')
    .replace(/^### Major Changes\n/, '')
    .replace(/^### Patch Changes\n/, '')
    .replace(/^- ## New Features\n/, '## New Features')
    .replace(/^- ## Bug Fixes\n/, '## Bug Fixes')
    .replace(/^- ## Improvements\n/, '## Improvements')
    .replace(/^- /gm, '- ')
    .replace(/^## New Features\n/, '## New Features')
    .replace(/^## Bug Fixes\n/, '## Bug Fixes')
    .replace(/^## Improvements\n/, '## Improvements')
    .trim();
  
  return `# What's New in v${version}\n\n${cleanedContent}`;
}

function ensureZipBuilt() {
  // Build and create zip via existing script
  run('pnpm', ['run', 'package:extension']);
  const zipPath = join(process.cwd(), 'message-channel-tracker.zip');
  if (!existsSync(zipPath)) {
    throw new Error('Zip artifact not found: message-channel-tracker.zip');
  }
}

function createGithubRelease(version) {
  const tag = `v${version}`;
  const title = `message-channel-tracker ${tag}`;
  const body = getReleaseNotes(version);
  const notesFile = join(process.cwd(), '.release-notes.md');
  // If release already exists, skip to make idempotent
  const viewRes = runQuiet('gh', ['release', 'view', tag]);
  if (viewRes.status === 0) {
    console.log(`ℹ️ GitHub Release already exists for ${tag}. Skipping.`);
    return;
  }
  writeFileSync(notesFile, body);
  try {
    // Create release; this also creates the tag if missing
    run('gh', [
      'release', 'create', tag, 'message-channel-tracker.zip',
      '--title', title,
      '--notes-file', notesFile,
      '--latest'
    ]);
  } finally {
    try { unlinkSync(notesFile); } catch {}
  }
}

function main() {
  const version = getVersion();
  console.log(`Preparing GitHub Release for v${version}`);
  ensureZipBuilt();
  createGithubRelease(version);
  console.log('✅ GitHub Release created');
}

main();
