#!/usr/bin/env node

const fs = require('fs');
const {execSync} = require('child_process');
const path = require('path');

// Path to CHANGELOG.md
const changelogPath = path.join(__dirname, '../..', 'CHANGELOG.md');

// Read the CHANGELOG.md file
let changelog = fs.readFileSync(changelogPath, 'utf8');

// Regular expression to match version headers in the changelog
// Example: ## [1.0.9] - 2025-05-01
const versionRegex = /## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/g;

// Regular expression to match the Unreleased section
const unreleasedRegex = /## \[Unreleased\]/;

// Function to get the latest git tag matching the pattern 'v*.*.*'
function getLatestGitTag() {
    try {
        // Fetch tags from remote
        execSync('git fetch --tags', {stdio: 'pipe'});

        // Get the latest tag matching the pattern 'v*.*.*'
        const tag = execSync('git tag -l "v*.*.*" --sort=-v:refname | head -n 1', {stdio: 'pipe'})
            .toString()
            .trim();

        if (!tag) {
            console.log('No git tag matching the pattern v*.*.* found.');
            return null;
        }

        // Remove the 'v' prefix
        return tag.substring(1);
    } catch (error) {
        console.log(`Error getting latest git tag: ${error.message}`);
        return null;
    }
}

// Function to get the date of a git tag from remote
function getGitTagDate(tag) {
    try {
        // Fetch tags from remote
        execSync('git fetch --tags', {stdio: 'pipe'});

        // Get the date of the tag in YYYY-MM-DD format
        const dateStr = execSync(`git log -1 --format=%ad --date=short v${tag}`, {stdio: 'pipe'})
            .toString()
            .trim();

        if (!dateStr) {
            console.log(`No date found for tag v${tag}, skipping update.`);
            return null;
        }

        return dateStr;
    } catch (error) {
        console.log(`Error getting date for tag v${tag}, skipping update: ${error.message}`);
        return null;
    }
}

// Update the changelog with dates from git tags
let match;
let updated = false;

while ((match = versionRegex.exec(changelog)) !== null) {
    const version = match[1];
    const currentDate = match[2];

    // Get the date from git tag
    const gitTagDate = getGitTagDate(version);

    // If we got a date from git tag and it's different from the current date, update it
    if (gitTagDate && gitTagDate !== currentDate) {
        console.log(`Updating date for version ${version} from ${currentDate} to ${gitTagDate}`);

        // Replace the date in the changelog
        changelog = changelog.replace(
            `## [${version}] - ${currentDate}`,
            `## [${version}] - ${gitTagDate}`
        );

        updated = true;
    } else if (!gitTagDate) {
        console.log(`Skipping update for version ${version} as no git tag date was found.`);
    } else {
        console.log(`Date for version ${version} is already up to date (${currentDate}).`);
    }
}

// Check if the latest git tag is already in the changelog
const latestTag = getLatestGitTag();
if (latestTag) {
    console.log(`Latest git tag: v${latestTag}`);

    // Check if this version is already in the changelog
    const versionInChangelog = changelog.includes(`## [${latestTag}]`);

    if (!versionInChangelog) {
        console.log(`Version ${latestTag} not found in changelog. Updating 'Unreleased' section.`);

        // Get the date for the latest tag
        const latestTagDate = getGitTagDate(latestTag);

        if (latestTagDate) {
            // Replace the 'Unreleased' section with the new version
            changelog = changelog.replace(unreleasedRegex, `## [${latestTag}] - ${latestTagDate}`);

            // Add a new 'Unreleased' section at the top
            // Find the position after the description text
            const descriptionEndPos = changelog.indexOf('## [');
            if (descriptionEndPos !== -1) {
                // Insert the 'Unreleased' section before the first version header
                changelog =
                    changelog.substring(0, descriptionEndPos) +
                    '## [Unreleased]\n\n' +
                    changelog.substring(descriptionEndPos);
            } else {
                // Fallback: add after the title
                changelog = changelog.replace('# Changelog', '# Changelog\n\n## [Unreleased]\n');
            }

            updated = true;
        } else {
            console.log(`Could not get date for tag v${latestTag}, skipping update.`);
        }
    } else {
        console.log(`Version ${latestTag} already exists in changelog.`);
    }
} else {
    console.log('Could not determine latest git tag, skipping update.');
}

// Write the updated changelog back to the file if changes were made
if (updated) {
    fs.writeFileSync(changelogPath, changelog, 'utf8');
    console.log('CHANGELOG.md has been updated.');
} else {
    console.log('No updates needed for CHANGELOG.md.');
}
