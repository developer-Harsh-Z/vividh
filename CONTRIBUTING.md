# Contributing

## Workflow

1. Branch from `master`: `feat/short-name` or `fix/short-name`.
2. Run `npm run check` before pushing.
3. Open a pull request. CI must pass, and one other dev reviews it.
4. Squash-merge. `master` deploys automatically.

Every area of the code should have at least two people who know it, because devs graduate.

## How we write code

- **Write less.** Before adding code, check whether the platform, the standard library or an existing helper already does it. No new dependency for something a few lines can do.
- **Server first.** Pages are server components; writes are server actions. Add `"use client"` only for real interactivity (uploader, lightbox, theme toggle, motion).
- **Check permissions on the server**, at the top of every action and route, with `requireRole()` or an ownership check.
- **Validate form input on the server** with the helpers in `src/lib/form.ts`.
- **Log admin changes** with `audit()`. Every admin write needs an entry.
- **Style with the tokens** in `globals.css`. No literal colors in components.
- **Mark deliberate shortcuts** with a `ponytail:` comment that names the limit and what to do when it's reached.
- **Database changes** go through `npx prisma migrate dev --name what-changed`. Keep them additive so rollbacks work.

## Checks

`npm run check` runs `tsc --noEmit` and the unit checks in `src/lib/rules.test.ts` (Node's built-in test runner, no extra tools). Add a test there for any new rule involving permissions, limits or parsing.
