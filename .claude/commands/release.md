---
description: Create a new release of the GitHub Branch Generator extension
---

Create a new release for version $ARGUMENTS following these steps:

1. **Update Version**: Update the version in `package.json` to `$ARGUMENTS`

2. **Build Extension**: Run `npm run build` to create the production files in the `dist/` directory

3. **Commit Version Change**: If package.json was modified, commit it with message:
   ```
   Bump version to $ARGUMENTS
   
   🤖 Generated with Claude Code
   ```

4. **Create Git Tag**: 
   - Delete any existing tag `v$ARGUMENTS` if it exists
   - Create a new annotated tag `v$ARGUMENTS` with message:
   ```
   v$ARGUMENTS - GitHub Branch Generator Release
   
   🤖 Generated with Claude Code
   
   See release notes: https://github.com/jtsternberg/github-branch-generator/releases/tag/v$ARGUMENTS
   ```

5. **Push Tag**: Push the tag `v$ARGUMENTS` to GitHub origin

6. **Create Release Zip**: Create `github-branch-generator-v$ARGUMENTS.zip` containing:
   - `manifest.json`
   - `popup.html` 
   - `images/` directory
   - `dist/` directory
   - Exclude any `.DS_Store` files

7. **Create GitHub Release**: Use `gh release create` with:
   - Tag: `v$ARGUMENTS`
   - Title: `v$ARGUMENTS - GitHub Branch Generator`
   - Attach the zip file
   - Include release notes with installation instructions and feature highlights
   - Mention the Gemini API setup at https://aistudio.google.com/app/apikey

Validate that `$ARGUMENTS` follows semver format (e.g., 2.1.0, 3.0.0-beta) before proceeding.