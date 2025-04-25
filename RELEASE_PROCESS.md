# Release Process Documentation

⚠️ IMPORTANT: Released are done by GitHub CI

- No npm publish
- No manual releases

## Patch Version Release Steps

### Prerequisites

- Make sure you have all dependencies installed
- Ensure you're starting from an up-to-date master branch

### Step-by-Step Process

⚠️ If any task fails, you must:

- NOT proceed with any further steps
- NOT try to fix or set the environment manually
- Alert the team and request guidance

1. **Initial Verification**
   ```bash
   npm test
   ```
   This command runs the test suite. Do not proceed if any tests fail.

2. **Documentation Sync**
   Ensure all documentation is up-to-date with recent changes:
    - README.md
    - specs/*.md files
    - CHANGELOG.md

3. **Update Version Number**
   ```bash
   npm run bump
   ```
   This command automatically increments the patch version in package.json.

4. **Update CHANGELOG.md**
    - Move items from [Unreleased] section to a new version section
    - Run the update-changelog script to automatically add the current system date in ISO format (YYYY-MM-DD):
      ```bash
      npm run update-changelog
      ```
    - Update the version comparison links at the bottom of the file

5. **Version Control**
   ```bash
   git add .
   git commit -m "release: patch version X.Y.Z with [explanation of changes]"
   git tag -a vX.Y.Z -m "Version X.Y.Z"
   git push
   git push --tags
   ```
   Replace X.Y.Z with the actual version number from package.json and provide a clear explanation of changes.

## Minor and Major Version Release Steps

For minor (feature) and major (breaking change) version releases, follow the same steps as for patch releases, with
these differences:

### Minor Version (Features)

1. Use the following command instead of `npm run bump`:
   ```bash
   npm version minor --no-git-tag-version
   ```

2. In the commit message, use:
   ```bash
   git commit -m "release: minor version X.Y.0 with [explanation of new features]"
   ```

3. Ensure all new features are properly documented in the CHANGELOG.md

### Major Version (Breaking Changes)

1. Use the following command instead of `npm run bump`:
   ```bash
   npm version major --no-git-tag-version
   ```

2. In the commit message, use:
   ```bash
   git commit -m "release: major version X.0.0 with [explanation of breaking changes]"
   ```

3. Ensure all breaking changes are clearly documented in the CHANGELOG.md
4. Update the README.md to reflect any changes in usage patterns
5. Consider creating a migration guide for users upgrading from the previous major version

## For all Version Release Steps (Patch, Minor, or Major)

### Important Notes

- Always run and verify tests before pushing
- Document all significant changes in the commit message
- Monitor the merge process for any conflicts

### Post-Release Verification

- Verify the release is properly tagged
- Test the build process:
  ```bash
  npm run build
  ```
- Verify the built package can be installed:
  ```bash
  cd dist
  npm pack
  # This creates a .tgz file that can be installed locally
  # Install in a test project to verify it works:
  # npm install /path/to/raain-model-X.Y.Z.tgz
  ```

### Version Management Best Practices

- Always check the current version in package.json before starting the release process
- Use `npm run bump` to increment the version number only if needed
- Ensure version numbers are consistent across:
    - package.json
    - git tags
    - CHANGELOG.md entries
- Never manually edit version numbers

### CHANGELOG Management

- Keep the [Unreleased] section at the top of CHANGELOG.md
- Move unreleased changes to a new version section during release
- Include the current date in ISO format (YYYY-MM-DD)
- Organize changes under appropriate categories:
    - Added
    - Changed
    - Fixed
    - Dependencies
    - Technical Details

### Common Pitfalls to Avoid

- Don't push any changes before receiving explicit "release" command
- Don't create tags with placeholder version numbers (X.Y.Z)
- Don't forget to push both commits and tags (only after "release" command)
- Don't manually publish to npm
- Don't bypass CI process

### Recovery Procedures

If incorrect version numbers are used:

1. Delete the incorrect tag locally and remotely:
   ```bash
   git tag -d <incorrect_tag>
   git push origin :<incorrect_tag>
   ```
2. Update version numbers in all relevant files
3. Create new tag with correct version
4. Push changes and new tag

If merge conflicts occur:

1. Document the conflicting files
2. Resolve conflicts locally
3. Commit the resolution with a clear message
4. Push the changes
5. Verify the merge was successful

### Directory Navigation

- Return to the root directory for git operations
- Use absolute paths when necessary to avoid confusion

### CI/CD Integration

This project uses GitHub Actions for continuous integration and deployment. The CI workflow is defined in
`.github/workflows/ci.yml` and is triggered on pushes to the master branch. The workflow includes:

- Running tests
- Building the project
- Generating documentation and deploying to GitHub Pages
- Publishing the package to npm

To ensure successful CI/CD:

- Always verify that tests pass locally before pushing to master
- Check the GitHub Actions tab after pushing to monitor the workflow
- Address any CI failures immediately
- Ensure you have the necessary secrets configured (NPM_TOKEN) for npm publishing

### Future Improvements

- Consider automating version consistency checks
- Add pre-commit hooks for version validation
- Implement automated changelog updates
- Add automated testing of the release process
- Consider implementing a release automation script
- Enhance the CI/CD pipeline with additional checks and deployments
