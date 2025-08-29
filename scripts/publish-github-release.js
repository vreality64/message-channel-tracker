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

function getVersion() {
  const pkgPath = join(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  return pkg.version;
}

function getReleaseNotes(version) {
  const changelogPath = join(process.cwd(), 'CHANGELOG.md');
  const changelog = readFileSync(changelogPath, 'utf-8');
  const pattern = new RegExp(`(^|\n)##\\s+${version.replaceAll('.', '\\.')}(\n[\s\S]*?)(?=\n##\\s+|$)`, 'm');
  const match = changelog.match(pattern);
  if (match) {
    // Trim leading newlines
    return match[0].replace(/^\n+/, '').trim();
  }
  // Fallback minimal notes
  return `## ${version}\n\nAutomated release.`;
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
