---
inclusion: auto
description: Git branching strategy, commit conventions, and workflow rules for this project.
---

# Git Workflow & Version Control

## Critical Rule: Always Commit Your Work

**NEVER** work for extended periods without committing and pushing changes. This prevents data loss and enables collaboration.

## Commit Frequency Guidelines

- Commit after completing each logical unit of work
- Commit before switching tasks or taking breaks
- Commit at the end of each work session
- Commit before running potentially destructive operations (migrations, refactors)
- Commit after each spec task completion

## Recommended Workflow

### 1. Start of Work Session

```bash
# Pull latest changes
git pull origin main

# Create feature branch (REQUIRED - not optional!)
git checkout -b feature/your-feature-name
```

**CRITICAL**: Always work on feature branches, never directly on main. Main branch auto-deploys to production on Vercel.

### 2. During Development

```bash
# Check status frequently
git status

# Stage changes incrementally
git add path/to/changed/file

# Commit with descriptive message
git commit -m "feat: add launch creation interface"

# Push to remote regularly (every 30-60 minutes of work)
git push origin feature/your-feature-name
```

### 3. End of Work Session

```bash
# Stage all changes
git add .

# Commit remaining work
git commit -m "wip: progress on modifier validation"

# Push to remote
git push origin feature/your-feature-name
```

## Commit Message Format

Use conventional commit format for clarity:

```
<type>: <description>

[optional body]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `wip`: Work in progress (use sparingly)

### Examples

```bash
git commit -m "feat: implement format eligibility logic"
git commit -m "fix: correct twist format validation"
git commit -m "test: add property tests for referential integrity"
git commit -m "docs: update API endpoint specifications"
git commit -m "refactor: extract validation logic to separate module"
```

## Branch Strategy

### Main Branch

- `main` - **Production-ready code ONLY**
- **Auto-deploys to Vercel production**
- **NEVER push directly to main**
- Protected (requires pull request)
- Only merge via approved PRs

### Feature Branches (REQUIRED)

- `feature/taxonomy-management` - Taxonomy system
- `feature/launch-first-cms-model` - Major features
- `feature/modifier-management` - Specific features
- `fix/twist-validation-bug` - Bug fixes

**ALWAYS work on feature branches!**

### Naming Convention

```
feature/<feature-name>
fix/<bug-description>
refactor/<refactor-description>
docs/<documentation-update>
```

## Pull Request Workflow

**REQUIRED for all changes to main:**

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Make changes and commit regularly to feature branch
3. Push feature branch: `git push origin feature/your-feature-name`
4. **Run tests locally**: `npm test` (must pass!)
5. **Build locally**: `npm run build` (must succeed!)
6. Create pull request on GitHub from feature branch → main
7. Review changes in PR preview
8. Wait for CI/CD checks to pass
9. Request review if working with team
10. Merge to main only after approval and passing tests
11. Delete feature branch after merge

**NEVER push directly to main - it auto-deploys to production!**

## Protecting Against Data Loss

### Before Migrations

```bash
# Commit all current work
git add .
git commit -m "chore: checkpoint before migration"
git push origin main

# Create backup branch
git checkout -b backup/pre-migration
git push origin backup/pre-migration
git checkout main
```

### Before Major Refactors

```bash
# Commit current state
git add .
git commit -m "chore: checkpoint before refactor"
git push origin main

# Create checkpoint tag
git tag checkpoint-$(date +%Y%m%d-%H%M%S)
git push --tags
```

### Recovery from Mistakes

```bash
# View commit history
git log --oneline

# Revert to previous commit (creates new commit)
git revert <commit-hash>

# Reset to previous commit (destructive - use with caution)
git reset --hard <commit-hash>

# Restore specific file from previous commit
git checkout <commit-hash> -- path/to/file
```

## .gitignore Best Practices

Ensure these are in `.gitignore`:

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Next.js
.next/
out/
build/
dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Temporary files
*.tmp
*.temp
.cache/
```

## Collaboration Guidelines

### When Working with Others

1. Pull before starting work: `git pull origin main`
2. Communicate about which files you're working on
3. Commit and push frequently to avoid conflicts
4. Use feature branches to isolate work
5. Review others' pull requests promptly

### Resolving Conflicts

```bash
# Pull latest changes
git pull origin main

# If conflicts occur, resolve them in your editor
# Look for conflict markers: <<<<<<<, =======, >>>>>>>

# After resolving, stage the files
git add path/to/resolved/file

# Complete the merge
git commit -m "merge: resolve conflicts with main"

# Push resolved changes
git push origin feature/your-branch
```

## Emergency Recovery

### If You Accidentally Pushed to Main

**DON'T PANIC** - but act quickly:

```bash
# 1. Check what was pushed
git log origin/main --oneline -5

# 2. If the code is broken, revert immediately
git revert <commit-hash>
git push origin main

# 3. If the code works but wasn't reviewed:
# - Create a feature branch from the commit before your changes
# - Create a PR to document the changes
# - Get it reviewed retroactively
# - Add tests if missing

# 4. For future work, create a feature branch
git checkout -b feature/continue-work
```

**Prevention**: Always check your current branch before pushing:
```bash
git branch  # Shows current branch with *
git status  # Shows current branch and changes
```

### Lost Uncommitted Work

```bash
# Check reflog for lost commits
git reflog

# Recover lost commit
git checkout <commit-hash>
git checkout -b recovery-branch
```

### Accidentally Deleted Branch

```bash
# Find the branch in reflog
git reflog

# Recreate branch
git checkout -b recovered-branch <commit-hash>
```

## Daily Checklist

- [ ] Pull latest changes at start of day
- [ ] Commit after each completed task
- [ ] Push to remote at least every hour of active work
- [ ] Push all changes at end of day
- [ ] Review git status before closing IDE

## Remember

**Your work only exists if it's committed and pushed to the remote repository.**

Local commits are not safe until they're pushed to the remote. Make pushing a habit, not an afterthought.
