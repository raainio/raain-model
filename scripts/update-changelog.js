#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates the CHANGELOG.md file with the current system date for the latest version.
 * This script should be run as part of the release process to ensure the date is accurate.
 */
function updateChangelog() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const packageJsonPath = path.join(process.cwd(), 'package.json');

    // Read the current version from package.json
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    // Get the current date in ISO format (YYYY-MM-DD)
    const today = new Date();
    const isoDate = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Read the CHANGELOG.md file
    let content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');

    // Regular expression to match version headers in the changelog
    const versionPattern = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/;

    // Find the line with the current version and update its date
    let updated = false;
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(versionPattern);
        if (match && match[1] === currentVersion) {
            lines[i] = `## [${currentVersion}] - ${isoDate}`;
            updated = true;
            break;
        }
    }

    if (!updated) {
        console.error(`❌ Could not find version ${currentVersion} in CHANGELOG.md`);
        process.exit(1);
    }

    // Write the updated content back to the file
    fs.writeFileSync(changelogPath, lines.join('\n'), 'utf8');
    console.log(`✓ Updated CHANGELOG.md with current date (${isoDate}) for version ${currentVersion}`);
}

/**
 * Updates all 2.6.x version dates in the CHANGELOG.md file from 2023 to 2025.
 * This is a one-time fix for incorrect dates in the changelog.
 */
function fix26xDates() {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');

    // Read the CHANGELOG.md file
    let content = fs.readFileSync(changelogPath, 'utf8');
    const lines = content.split('\n');

    // Regular expression to match 2.6.x version headers with 2023 dates
    const versionPattern = /^## \[(2\.6\.\d+)\] - (2023-\d{2}-\d{2})/;

    // Count of updated entries
    let updatedCount = 0;

    // Find all 2.6.x versions with 2023 dates and update them to 2025
    for (let i = 0; i < lines.length; i++) {
        const match = lines[i].match(versionPattern);
        if (match) {
            const version = match[1];
            const oldDate = match[2];
            const newDate = oldDate.replace('2023', '2025');
            lines[i] = `## [${version}] - ${newDate}`;
            updatedCount++;
        }
    }

    if (updatedCount > 0) {
        // Write the updated content back to the file
        fs.writeFileSync(changelogPath, lines.join('\n'), 'utf8');
        console.log(`✓ Updated ${updatedCount} entries of 2.6.x versions from 2023 to 2025 dates`);
    } else {
        console.log('✓ No 2.6.x versions with 2023 dates found in CHANGELOG.md');
    }
}

// Run both functions
updateChangelog();
fix26xDates();
