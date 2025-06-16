#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Dynamically determine the specificId based on the project's location
const projectPath = path.resolve(__dirname, '../../');
const parentDir = path.dirname(projectPath);
const specificId = path.basename(parentDir);

console.log(`Detected specificId: ${specificId}`);

// Paths to the package files
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageSpecificJsonPath = path.resolve(__dirname, `../../package.${specificId}.json`);

// Read the package files
const packageJson = require(packageJsonPath);
const packageSpecificJson = require(packageSpecificJsonPath);

// Command line argument to determine mode
const mode = process.argv[2];

if (!mode || (mode !== 'local' && mode !== 'remote')) {
    console.error('Please specify a mode: "local" or "remote"');
    console.log('Usage: node switch-dependencies.js local|remote');
    process.exit(1);
}

// Get the dependencies for the specified mode
const dependencies =
    mode === 'local'
        ? packageSpecificJson['local.dependencies']
        : packageSpecificJson['remote.dependencies'];

// Update the dependencies in package.json
let updated = false;
for (const [name, version] of Object.entries(dependencies)) {
    // Check if the dependency exists in devDependencies
    if (packageJson.devDependencies && packageJson.devDependencies[name]) {
        if (packageJson.devDependencies[name] !== version) {
            packageJson.devDependencies[name] = version;
            updated = true;
            console.log(`Updated devDependency ${name} to ${version}`);
        }
    }
    // Check if the dependency exists in dependencies
    else if (packageJson.dependencies && packageJson.dependencies[name]) {
        if (packageJson.dependencies[name] !== version) {
            packageJson.dependencies[name] = version;
            updated = true;
            console.log(`Updated dependency ${name} to ${version}`);
        }
    }
    // If not found in either, add to dependencies
    else {
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        packageJson.dependencies[name] = version;
        updated = true;
        console.log(`Added new dependency ${name} with version ${version}`);
    }
}

if (!updated) {
    console.log(`Dependencies are already in ${mode} mode.`);
} else {
    // Write the updated package.json back to disk
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`Successfully switched to ${mode} dependencies mode.`);
    console.log('Run "npm install" to apply the changes.');
}
