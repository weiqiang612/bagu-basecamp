# Always Do

✅ These behaviours are mandatory in every session, for every task.
Not optional even for "quick" or "small" changes.

## Session start

- ✅ Run the Session Start diagnostics checklist to verify that the dev server is running, git state is healthy, and the active task is loaded
- ✅ If the dev server is not running, run `.\init.ps1` (Windows) or `bash init.sh` (UNIX) before coding
- ✅ Read the active feature's `spec.md` in `docs/3-tasks/features/` before implementing
- ✅ Check `docs/2-constraints/never-do.md` before any non-trivial change

## Before committing

- ✅ Run `npm run lint` — no violations before committing
- ✅ Run `npm run lint` — all tests must pass
- ✅ Confirm no secrets or credentials are staged: `git diff --cached`
- ✅ Update `docs/3-tasks/features/<active-task>/tasks.md` — check off completed tasks
- ✅ Update `docs/3-tasks/CURRENT_PLAN.md` — mark feature complete when all tasks done

## General

- ✅ Use explicit types — never use implicit or `any` typing
- ✅ Define constants for any value used more than once
- ✅ Write tests before marking a task done
- ✅ Write tests in `given / when / then` (or `arrange / act / assert`) structure
- ✅ Run `npm run lint` after every logical change — fix failures before continuing

## React / Next.js

- ✅ Default to Server Components — add `'use client'` only when browser APIs or interactivity require it
- ✅ Parallelise independent data fetches with `Promise.all`
- ✅ Type all component props with an explicit interface or type alias
- ✅ Keep components focused — extract a new component when JSX exceeds ~100 lines
- ✅ Run `npm run lint` (ESLint + Prettier) before every commit
