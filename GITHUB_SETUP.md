# GitHub Repository Setup Guide

This guide walks you through making the repository public and setting up branch protection rules.

## Step 1: Make Repository Public

1. **Go to Repository Settings**:
   - Navigate to your repository on GitHub
   - Click **Settings** (gear icon in the top navigation)

2. **Change Visibility**:
   - Scroll down to the **Danger Zone** section (bottom of the page)
   - Click **Change repository visibility**
   - Select **Make public**
   - Type the repository name to confirm: `website-author-career-data`
   - Click **I understand, make this repository public**

⚠️ **Before making public, ensure:**
- No secrets or credentials are committed in the code
- `.env` is in `.gitignore` (already done ✅)
- All sensitive data is in environment variables only

## Step 2: Create Develop Branch

The GitHub Actions workflow validates PRs to the `develop` branch.

```bash
# Create and push develop branch
git checkout -b develop
git push -u origin develop
```

## Step 3: Set Up Branch Protection for Main

Protect the `main` branch to require pull requests.

1. **Go to Branch Settings**:
   - Repository → **Settings** → **Branches** (left sidebar)

2. **Add Branch Protection Rule**:
   - Click **Add branch protection rule**
   - Branch name pattern: `main`

3. **Configure Protection Rules**:

   ✅ **Require a pull request before merging**
   - Check this box
   - **Required approvals**: Set to `1` (or `0` if you're the only contributor)
   - ✅ **Dismiss stale pull request approvals when new commits are pushed**
   - ✅ **Require review from Code Owners** (optional)

   ✅ **Require status checks to pass before merging**
   - Check this box
   - After your first PR runs, add status check: `build`

   ✅ **Require branches to be up to date before merging**
   - Recommended for team projects

   ✅ **Require linear history** (optional but recommended)
   - Prevents merge commits, enforces rebase/squash

   ❌ **Do not allow bypassing the above settings**
   - Leave unchecked so admins can force-push if needed in emergencies

   ✅ **Restrict who can push to matching branches**
   - Optional: Add specific users/teams who can push directly

4. **Save Changes**:
   - Click **Create** at the bottom

## Step 4: Set Up Branch Protection for Develop (Optional)

If you want to protect the develop branch too:

1. **Add another branch protection rule**:
   - Branch name pattern: `develop`

2. **Configure (lighter protection)**:
   - ✅ **Require a pull request before merging** (0 approvals)
   - ✅ **Require status checks to pass**: `build`
   - ✅ **Require branches to be up to date**

## GitHub Actions Workflow

The repository includes `.github/workflows/pr-validation.yml` which:

- **Triggers on**: Pull requests to `develop` branch
- **Runs**: `npm run build` to validate the build succeeds
- **Uses**: Node.js 20.x (matching your `.nvmrc`)
- **Status**: Shows ✅ or ❌ on the PR

### Workflow Features

- **Automated validation**: No manual build testing needed
- **Fast feedback**: Catch build errors before merging
- **Dummy environment variables**: Uses fake values for CI (real values in Netlify)
- **Cache dependencies**: Uses npm cache for faster builds

## Typical Git Workflow

With branch protection enabled, your workflow becomes:

### For New Features/Fixes:

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# 2. Make your changes
# ... edit files ...

# 3. Commit and push
git add .
git commit -m "feat: add your feature"
git push -u origin feature/your-feature-name

# 4. Open PR on GitHub
# - Go to your repository on GitHub
# - Click "Compare & pull request"
# - Set base branch to "develop"
# - Wait for build validation to pass
# - Merge when ready
```

### Promoting to Production (Main):

```bash
# 1. After features are tested in develop, create PR to main
# - On GitHub, create new PR from develop to main
# - Get required approvals
# - Merge to trigger Netlify production deployment
```

## Branch Strategy

```
main (production)
 ↑
 PR with approval required
 ↑
develop (staging)
 ↑
 PR with build validation
 ↑
feature/*, fix/* (feature branches)
```

- **main**: Production branch, deployed to Netlify automatically
- **develop**: Staging/development branch, PRs validated by GitHub Actions
- **feature/***: Individual features or fixes

## Testing the Setup

### Test GitHub Actions:

```bash
# 1. Create a test branch from develop
git checkout develop
git checkout -b test/github-actions

# 2. Make a small change
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify GitHub Actions"
git push -u origin test/github-actions

# 3. Open PR to develop on GitHub
# 4. Watch the Actions tab - you should see the build running
# 5. Once it passes, you can close/delete the test PR
```

### Test Branch Protection:

```bash
# Try to push directly to main (should fail)
git checkout main
echo "test" >> test.txt
git add test.txt
git commit -m "test: direct push"
git push origin main
# Expected: Remote will reject the push
```

## Status Badges (Optional)

Add a build status badge to your README:

```markdown
[![PR Validation](https://github.com/roadlittledawn/website-author-career-data/actions/workflows/pr-validation.yml/badge.svg)](https://github.com/roadlittledawn/website-author-career-data/actions/workflows/pr-validation.yml)
```

## Troubleshooting

### Build fails in GitHub Actions but passes locally

**Check environment variables**: GitHub Actions uses dummy values. Make sure your build doesn't actually require real database connections.

**Solution**: Ensure build process is isolated and doesn't need external dependencies.

### Can't push to main after enabling protection

**Expected behavior**: This is correct! You must now use PRs.

**Solution**: Create a branch, push it, and open a PR.

### Status checks don't appear on PR

**First-time setup**: The status check `build` won't appear in branch protection settings until the workflow runs at least once.

**Solution**:
1. Open your first PR to develop
2. Wait for the action to run
3. Go back to branch protection settings
4. The `build` check will now be available to select

## Security Notes

### Public Repository Considerations

✅ **Safe to be public:**
- All authentication uses environment variables
- No hardcoded secrets or passwords
- `.env` is gitignored
- GitHub Actions uses dummy credentials for validation only

⚠️ **Keep these private:**
- Netlify environment variables (already configured)
- MongoDB connection strings
- JWT secrets
- Admin password hashes

### Secrets in GitHub Actions

For more advanced workflows (like automated deployments), use GitHub Secrets:
- Repository → **Settings** → **Secrets and variables** → **Actions**
- Never commit secrets to workflow files

## Support

- **GitHub Actions Documentation**: [docs.github.com/actions](https://docs.github.com/en/actions)
- **Branch Protection**: [docs.github.com/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

**Quick Start Checklist**:

1. ✅ Make repository public
2. ✅ Create `develop` branch
3. ✅ Protect `main` branch (require PRs)
4. ✅ GitHub Actions workflow is already committed
5. ✅ Test by opening a PR to develop

You're all set! 🚀
