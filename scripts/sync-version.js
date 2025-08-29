#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function syncVersion() {
  try {
    // package.json 읽기
    const packagePath = join(process.cwd(), 'package.json');
    const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8'));

    // manifest.json 읽기
    const manifestPath = join(process.cwd(), 'extension', 'manifest.json');
    const manifestContent = JSON.parse(readFileSync(manifestPath, 'utf-8'));

    const packageVersion = packageContent.version;
    const manifestVersion = manifestContent.version;

    console.log(`Package version: ${packageVersion}`);
    console.log(`Manifest version: ${manifestVersion}`);

    if (packageVersion !== manifestVersion) {
      // manifest.json 버전을 package.json과 동기화
      manifestContent.version = packageVersion;
      writeFileSync(manifestPath, JSON.stringify(manifestContent, null, 2) + '\n');
      console.log(`✅ Manifest version updated to ${packageVersion}`);
    } else {
      console.log('✅ Versions are already in sync');
    }
  } catch (error) {
    console.error('❌ Error syncing versions:', error.message);
    process.exit(1);
  }
}

syncVersion();
