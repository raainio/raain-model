#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function verifyChangelog() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');
    
    const versionPattern = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/;
    const versions = [];
    const today = new Date();
    let hasErrors = false;

    // Extract versions and dates
    lines.forEach((line, index) => {
        const match = line.match(versionPattern);
        if (match) {
            const [_, version, date] = match;
            versions.push({ version, date, lineNumber: index + 1 });
        }
    });

    // Verify chronological order and dates
    for (let i = 0; i < versions.length; i++) {
        const current = versions[i];
        const releaseDate = new Date(current.date);

        // Check for future dates
        if (releaseDate > today) {
            console.log(`✓ Date ${current.date} for version ${current.version} is in the future (this is expected for pre-releases)`);
        }

        // Check version ordering
        if (i < versions.length - 1) {
            const next = versions[i + 1];
            if (compareVersions(current.version, next.version) < 0) {
                console.error(`❌ Version ordering error at line ${current.lineNumber}:`);
                console.error(`   ${current.version} should be greater than ${next.version}`);
                hasErrors = true;
            }
        }

        // Check date ordering
        if (i < versions.length - 1) {
            const next = versions[i + 1];
            const nextDate = new Date(next.date);
            if (releaseDate < nextDate) {
                console.error(`❌ Date ordering error at line ${current.lineNumber}:`);
                console.error(`   ${current.date} should be after ${next.date}`);
                hasErrors = true;
            }
        }
    }

    // Verify version links
    const linkPattern = /^\[([\d.]+)\]:/;
    const links = new Set();
    lines.forEach((line, index) => {
        const match = line.match(linkPattern);
        if (match) {
            links.add(match[1]);
        }
    });

    // Check if all versions have links
    versions.forEach(({ version }) => {
        if (!links.has(version)) {
            console.error(`❌ Missing link for version ${version}`);
            hasErrors = true;
        }
    });

    if (hasErrors) {
        process.exit(1);
    } else {
        console.log('✓ Changelog verification passed');
    }
}

function compareVersions(a, b) {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
        if (partsA[i] > partsB[i]) return 1;
        if (partsA[i] < partsB[i]) return -1;
    }
    return 0;
}

verifyChangelog(); 