---
name: create-pr
description: Write the requested code (optional), then cut a fresh branch from the latest origin/main, verify the build, commit all changes, rebase, push, and open a GitHub pull request — with locking and re-sync steps that prevent merge conflicts and working-tree races between parallel sessions.
argument-hint: "[task description | ticket file] [--update]"
disable-model-invocation: true
allowed-tools: Bash(git:*), Bash(gh:*), Bash(npm run build), Bash(npm ci), Bash(mkdir:*), Bash(date:*), Bash(cat:*), Bash(rm -rf .git/claude-create-pr.lock), Read, Edit, Write, Glob, Grep
---

# /create-pr

Ship work as a pull request against `main`. Arguments: `$ARGUMENTS`

- **With a task** (`/create-pr add a pricing section`, or a ticket path such as `tickets/LATER-001-contact-socials-reviews.md`): cut the branch first, then write the code, then ship it.
- **Without a task** (`/create-pr`): ship the uncommitted changes that already exist.
- **`--update`**: add commits to the current feature branch and its open PR instead of cutting a new branch.

Follow the phases in order. Do not skip a phase. If any **STOP** condition hits, release the lock (Phase 10), leave the working tree as it is, and report what happened and what the user needs to do.

---

## Hard rules (never break these)

1. Never commit to `main` and never push to `main`. All work goes on a feature branch.
2. Never run `git push --force`. The only force push allowed is `--force-with-lease=<branch>:<expected-sha>` on a branch this session created, after a rebase.
3. Never run destructive commands on the user's work: `git reset --hard`, `git clean`, `git checkout -- .`, `git restore .`, `git stash drop`, `git branch -D`, or deleting worktrees you did not create.
4. Never skip hooks (`--no-verify`) or signing (`--no-gpg-sign`).
5. Never amend or rewrite a commit that is already on the remote, except by a rebase covered by rule 2.
6. Never merge the PR, approve it, or delete remote branches.
7. Never commit secrets or generated files (see the deny-list in Phase 6).
8. Base every branch on **`origin/main` right after a fetch**. Never base a branch on the local `main`, because it may be stale.

---

## Phase 1: Preflight (read-only)

Run these checks and STOP on any failure:

```bash
git rev-parse --show-toplevel                    # must be inside a repo
git remote get-url origin                        # must have an origin
git symbolic-ref --short -q HEAD || echo DETACHED
GITDIR=$(git rev-parse --git-common-dir)
ls "$GITDIR"/MERGE_HEAD "$GITDIR"/CHERRY_PICK_HEAD "$GITDIR"/REVERT_HEAD \
   "$GITDIR"/rebase-merge "$GITDIR"/rebase-apply "$GITDIR"/index.lock 2>/dev/null
git status --porcelain=v1 -uall
command -v gh && gh auth status
```

- **In-progress merge, rebase, cherry-pick, or revert** → STOP. Do not finish or abort it for the user.
- **`index.lock` exists** → another git process is running. Wait 5 seconds and check again, up to 3 times. If it is still there, STOP. Do not delete it.
- **Detached HEAD** → STOP unless `--update` was not passed and the tree is clean (then just continue; Phase 3 branches from `origin/main` anyway).
- **`gh` missing or not logged in** → continue, but use the fallback in Phase 9. Tell the user at the end: `brew install gh && gh auth login`.
- Record the **starting branch** and the **dirty file list**. You need them later.

## Phase 2: Acquire the repo lock

The lock stops two Claude sessions (or a session and a script) from switching branches or staging files in the same working tree at the same time. `mkdir` is atomic, so only one session can create the directory.

```bash
LOCK="$(git rev-parse --git-common-dir)/claude-create-pr.lock"
if mkdir "$LOCK" 2>/dev/null; then
  printf 'started=%s\nbranch=%s\n' "$(date +%s)" "<planned-branch>" > "$LOCK/owner"
  echo ACQUIRED
else
  cat "$LOCK/owner"; echo HELD
fi
```

If the lock is **HELD**:
- If `started` is more than 60 minutes ago and Phase 1 found no git operation in progress, treat the lock as stale. Remove it, take it again, and mention this in the final report.
- Otherwise, **do not wait on the shared tree**. Switch to **worktree mode** (below).

### Worktree mode (isolation fallback)

Use this when the lock is held, or when the tree has unrelated uncommitted changes that the user did not ask to ship:

```bash
git fetch origin --prune
WT="$(dirname "$(git rev-parse --show-toplevel)")/$(basename "$(git rev-parse --show-toplevel)")-worktrees/<branch-slug>"
git worktree add -b <branch> "$WT" origin/main
```

- Do all later phases inside `$WT`.
- Dependencies: if `package-lock.json` in `$WT` matches the main checkout, symlink `node_modules`: `ln -s <main-checkout>/node_modules "$WT/node_modules"`. Otherwise run `npm ci` in `$WT`.
- Worktree mode doesn't touch the shared working tree, so it does not need the lock.
- Leave the worktree in place when you finish, and tell the user its path. Do not remove it.

## Phase 3: Sync and cut the branch

```bash
git fetch origin --prune
git rev-parse --verify -q origin/main || echo NO_REMOTE_MAIN
```

**`NO_REMOTE_MAIN`** (empty remote, or a repo with no commits) → STOP and explain. The repo has to be bootstrapped first, with an initial commit on `main` pushed to origin, and that is the user's decision. Offer to do it (make sure `.gitignore` exists first). Do it only if the user confirms.

**`--update` mode**: the current branch must not be `main`, and `gh pr list --head <current-branch> --state open` must show a PR. Skip ahead to Phase 5. In Phase 8, rebase onto `origin/main` as usual.

**Normal mode**, pick a branch name:
- Format: `<type>/<ticket-id-if-any>-<short-kebab-slug>`, lowercase, 50 characters or fewer. Example: `feat/later-001-contact-socials`, `fix/booking-form-validation`.
- `type` is one of `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`.
- Check for collisions both locally and on the remote. If the name is taken, add `-2`, `-3`, and so on:
  ```bash
  git show-ref --verify -q refs/heads/<branch> && echo LOCAL_EXISTS
  git ls-remote --exit-code --heads origin <branch> && echo REMOTE_EXISTS
  ```

Cut the branch from the latest remote main. Uncommitted changes come along with it:

```bash
git switch -c <branch> --no-track origin/main
```

- If `git switch` refuses because the dirty files would be overwritten (they conflict with changes on main), fall back to a named stash:
  ```bash
  git stash push -u -m "create-pr:<branch>"
  git switch -c <branch> --no-track origin/main
  git stash pop
  ```
  If `stash pop` reports conflicts → STOP. The stash is kept (git does not drop it on conflict). Tell the user the stash name and which files conflict. Never drop the stash.
- If a task was given **and** the tree already had unrelated dirty files, ask the user whether to include them. If they say no, use worktree mode instead.

Update the lock `owner` file with the final branch name.

## Phase 4: Write the code (only when a task was given)

- If the argument is a ticket file, read it fully and treat its acceptance criteria as the spec.
- Read the surrounding code first. Match the existing structure (`src/components/<Name>/<Name>.tsx` + `<Name>.css`, data in `src/data/`, tokens in `src/styles/tokens.css`).
- Stay within the task's scope. Do not reformat or refactor unrelated files. Small diffs make merge conflicts less likely.
- Do not edit `package-lock.json` by hand. If you add a dependency, use `npm install <pkg>` and commit the lockfile change.

## Phase 5: Verify

```bash
npm run build          # tsc -b && vite build — must exit 0
```

- If it fails because of your change, fix it and run it again.
- If it fails for a reason that is already on `origin/main` and unrelated to this change, do not fix it here. Note it in the PR body under "Known issues".
- Never commit with a failing build unless the user explicitly says to. If they do, add `[WIP]` to the PR title and open it as a draft.

## Phase 6: Stage and commit

Stage everything, then review what you are about to commit:

```bash
git add -A
git diff --cached --name-status
git diff --cached --stat
```

**Deny-list.** If any of these are staged, unstage them with `git restore --staged <path>` and make sure `.gitignore` covers them. Add a `.gitignore` entry as part of this commit if one is missing:
- `node_modules/`, `dist/`, `build/`, `.vite/`, `coverage/`
- `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, `id_rsa*`, `credentials*.json`
- `.DS_Store`, `*.log`, `.idea/`, `.vscode/` (unless the repo already tracks it)
- Any single file larger than 5 MB (check with `git diff --cached --numstat` and `ls -l`). Ask the user about it before committing.

Also scan the staged diff for secrets, such as strings that look like API keys, tokens, or passwords:
`git diff --cached | grep -nEi '(api[_-]?key|secret|token|passw(or)?d)\s*[:=]'`. If anything real turns up → STOP and ask.

Commit using Conventional Commits. Split the work into several logical commits if it covers clearly separate concerns. Otherwise, use one commit:

```bash
git commit -F - <<'EOF'
<type>(<scope>): <imperative summary, ≤ 72 chars>

<why the change was made, and anything the reviewer should know>

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
```

(Use the attribution line from the current session's system instructions if they provide one.)

## Phase 7: Nothing to ship?

If `git log origin/main..HEAD` is empty after Phase 6 → there are no changes. Switch back to the starting branch (only if the tree is clean), delete the empty local branch with `git branch -d <branch>` (lowercase `-d`, safe delete), release the lock, and report "nothing to ship".

## Phase 8: Re-sync right before pushing (conflict prevention)

`main` may have moved while you were coding. Rebase onto it now, so conflicts show up here and not in the PR:

```bash
git fetch origin --prune
git merge-base --is-ancestor origin/main HEAD && echo UP_TO_DATE || git rebase origin/main
```

- **Rebase conflict:**
  - If the conflict is mechanical (for example, both sides added entries to the same list, or there are import-order clashes, or one side only changed formatting), resolve it so **both** sides' intent is kept. Then `git add <file>` and `git rebase --continue`.
  - If it is a real semantic conflict (both sides changed the same logic differently), run `git rebase --abort` and STOP. Report the conflicting files and the upstream commits that touched them (`git log --oneline HEAD..origin/main -- <file>`).
- If the rebase changed anything, **run `npm run build` again**. The rebased result is new code that has not been verified yet.
- In `--update` mode, if the branch was already pushed before this rebase, note its remote SHA first: `git rev-parse origin/<branch>`. You need it for `--force-with-lease` in Phase 9.

## Phase 9: Push and open the PR

**Push:**

```bash
git push -u origin <branch>
```

- **Rejected (non-fast-forward)** on a branch that is new in this run → someone else pushed to the same name. Do not force. Rename the branch (`-2` suffix) and push again.
- **Rejected after a Phase 8 rebase in `--update` mode** → `git push --force-with-lease=<branch>:<sha-noted-in-phase-8> origin <branch>`. If the lease fails, someone else pushed to the branch in the meantime. STOP and report. Do not overwrite their commits.
- **Authentication or network error** → retry once. Then STOP and report the exact error.

**PR:** first check whether one already exists: `gh pr list --head <branch> --state open --json url`.
- If it exists (usual in `--update` mode), just report its URL.
- Otherwise:

```bash
gh pr create --base main --head <branch> --title "<type>(<scope>): <summary>" --body-file - <<'EOF'
## Summary
<1–3 bullets: what changed and why>

## Changes
<files/components touched, grouped logically>

## Verification
- `npm run build` ✅
<manual checks performed, or what the reviewer should click through>

## Known issues / follow-ups
<pre-existing failures, TODOs, or "None">

Closes: <ticket id if any>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
```

Add `--draft` if the build was allowed to fail.

**If `gh` is unavailable:** after pushing, build the compare URL from the remote. For example, `git@github.com:Owner/repo.git` becomes `https://github.com/Owner/repo/compare/main...<branch>?expand=1`. Print that URL together with the PR title and body you would have used, so the user can paste them in.

## Phase 10: Release and report

```bash
rm -rf "$(git rev-parse --git-common-dir)/claude-create-pr.lock"
```

Release the lock on **every** exit path, including STOPs. The only exception is worktree mode when you never took the lock.

Stay on the feature branch so the user can keep testing. Don't switch back automatically. The next `/create-pr` branches from `origin/main` whatever branch is checked out.

Final report (brief):
- Branch name and PR URL (or the compare URL plus the title and body)
- Commits created (`git log --oneline origin/main..HEAD`)
- Build result
- Anything skipped, unstaged by the deny-list, stashed, or left in a worktree, plus any stale lock that was cleared
