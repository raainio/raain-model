#!/usr/bin/env node

/**
 * check-before-release.js
 * Script to run build and test commands before release
 *
 * Usage: node check-before-release.js
 *
 * This script first checks if there are any uncommitted changes in the working directory.
 * If uncommitted changes are found, it exits with code 1.
 *
 * Then it checks if all commits in the current branch compared to main/master
 * only concern *.md and *.json files. If so, it exits with code 1 (not interesting to merge).
 *
 * Finally, it runs 'npm run build' and 'npm run test' commands.
 * If both commands succeed, it exits with code 0.
 * If either command fails, it exits with code 1.
 */

const {execSync} = require('child_process');

// Function to execute shell commands and return the output
function execCommand(command, silent = false) {
    try {
        if (!silent) {
            console.log(`Executing: ${command}`);
        }
        const output = execSync(command, {encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit'});
        return {success: true, output};
    } catch (error) {
        if (!silent) {
            console.error(`Error executing command: ${command}`);
            console.error(error.message);
        }
        return {success: false, error};
    }
}

// Function to check if there are uncommitted changes
function checkForUncommittedChanges() {
    try {
        console.log('Checking for uncommitted changes...');

        // Check for unstaged changes
        const unstagedResult = execCommand('git diff --quiet', true);

        // Check for staged but uncommitted changes
        const stagedResult = execCommand('git diff --quiet --cached', true);

        if (!unstagedResult.success || !stagedResult.success) {
            console.log('\n⚠️ There are uncommitted changes in your working directory.');
            console.log('Please commit or stash your changes before running pre-release checks.');
            return true;
        }

        console.log('No uncommitted changes found. Proceeding with checks...');
        return false;
    } catch (error) {
        console.error('Error checking for uncommitted changes:', error.message);
        return true; // Fail safe - if we can't check, assume there are uncommitted changes
    }
}

// Function to check if we are on main or master branch
function checkIfOnMainOrMaster() {
    try {
        // Get the current branch name
        const currentBranchResult = execCommand('git rev-parse --abbrev-ref HEAD', true);
        if (!currentBranchResult.success) {
            console.error('Failed to get current branch name.');
            return false; // Fail safe - if we can't check, assume we're not on main/master
        }
        const currentBranch = currentBranchResult.output.trim();

        // Check if we're on main or master branch
        if (currentBranch === 'main' || currentBranch === 'master') {
            console.log(`\n⚠️ You are on the ${currentBranch} branch.`);
            console.log('Pre-release checks should not be run on the main or master branch.');
            return true;
        }

        console.log(`Current branch: ${currentBranch}`);
        return false;
    } catch (error) {
        console.error('Error checking current branch:', error.message);
        return false; // Fail safe - if we can't check, assume we're not on main/master
    }
}

// Function to check if all changes are only in interesting files
function checkIfOnlyInterestingFilesChanged() {
    try {
        // Get the current branch name
        const currentBranchResult = execCommand('git rev-parse --abbrev-ref HEAD', true);
        if (!currentBranchResult.success) {
            console.error('Failed to get current branch name.');
            return false;
        }
        const currentBranch = currentBranchResult.output.trim();

        // Check if we're on a branch (not in a detached HEAD state)
        if (currentBranch === 'HEAD') {
            console.error(
                'Error: You are in a detached HEAD state. Please checkout a branch first.'
            );
            return false;
        }

        // Determine if the main branch is called "main" or "master"
        const baseBranchResult = execCommand(
            'git show-ref --verify --quiet refs/heads/main && echo "main" || echo "master"',
            true
        );
        if (!baseBranchResult.success) {
            console.error('Failed to determine main branch name.');
            return false;
        }
        const baseBranch = baseBranchResult.output.trim();

        // Find the merge base between the current branch and main/master
        const mergeBaseResult = execCommand(`git merge-base ${currentBranch} ${baseBranch}`, true);
        if (!mergeBaseResult.success) {
            console.error(`Failed to find merge base between ${currentBranch} and ${baseBranch}.`);
            return false;
        }
        const mergeBase = mergeBaseResult.output.trim();

        // Get a list of all files changed between the merge base and the current branch
        const changedFilesResult = execCommand(`git diff --name-only ${mergeBase}..HEAD`, true);
        if (!changedFilesResult.success) {
            console.error('Failed to get list of changed files.');
            return false;
        }

        const changedFiles = changedFilesResult.output
            .trim()
            .split('\n')
            .filter((file) => file.trim() !== '');

        if (changedFiles.length === 0) {
            console.log('No files changed in this branch.');
            return false;
        }

        // Check if all changed files are *.md, *.json files, bpInfo or in scripts/bp directory
        const onlyInterestingFiles = changedFiles.every((file) => {
            return (
                file.endsWith('.md') ||
                file.endsWith('.json') ||
                file.endsWith('bpInfo.ts') ||
                file.startsWith('scripts/bp/')
            );
        });

        if (onlyInterestingFiles) {
            console.log(
                `\n⚠️ All changes in branch ${currentBranch} compared to ${baseBranch} only concern interesting files.`
            );
            console.log('This branch is not interesting to merge.');
            return true;
        } else {
            console.log(`\nBranch ${currentBranch} contains changes to interesting files.`);
            console.log('Proceeding with pre-release checks...');
            return false;
        }
    } catch (error) {
        console.error('Error checking changed files:', error.message);
        return false;
    }
}

// Main function
async function checkBeforeRelease() {
    console.log('Running pre-release checks...');

    // Check if we are on main or master branch
    if (checkIfOnMainOrMaster()) {
        console.log(
            'Exiting with code 1 (pre-release checks should not be run on main or master branch).'
        );
        process.exit(1);
    }

    // Check for uncommitted changes
    if (checkForUncommittedChanges()) {
        console.log('Exiting with code 1 (uncommitted changes found).');
        process.exit(1);
    }

    // Check if all changes are only in interesting files
    if (checkIfOnlyInterestingFilesChanged()) {
        console.log('Exiting with code 1 (not interesting to merge).');
        process.exit(1);
    }

    // Run build command
    console.log('\n=== Running build ===');
    const buildResult = execCommand('npm run build');

    if (!buildResult.success) {
        console.error('Build failed! Aborting pre-release checks.');
        process.exit(1);
    }

    console.log('Build completed successfully.');

    // Run test command
    console.log('\n=== Running tests ===');
    const testResult = execCommand('npm run test');

    if (!testResult.success) {
        console.error('Tests failed! Aborting pre-release checks.');
        process.exit(1);
    }

    console.log('Tests completed successfully.');

    // If we got here, both build and test were successful
    console.log('\n✅ All pre-release checks passed successfully!');
}

// Run the main function
checkBeforeRelease();
