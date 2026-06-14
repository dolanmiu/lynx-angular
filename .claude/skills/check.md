---
name: check
description: Run all quality checks (format, lint, cspell, build, test) across the monorepo. Use when the user says "check", "run all checks", "CI checks", "verify everything", or wants a full quality gate before committing or pushing.
invocationControl: user
---

# Check

Run all quality checks sequentially from the project root. Stop and report on the first failure.

## Steps

Run these commands one at a time in order. If any step fails, stop, report the failure, and offer to fix before continuing.

1. **Format**
   ```sh
   npm run format:check
   ```

2. **Lint**
   ```sh
   npm run lint
   ```

3. **Spell check**
   ```sh
   npm run cspell
   ```

4. **Build**
   ```sh
   npm run build
   ```

5. **Test**
   ```sh
   npm run test
   ```

## After running

Summarize results as a checklist:

```
- [x] lint
- [x] format
- [x] build
- [ ] test — 2 failures in runtime
- [ ] cspell — 3 unknown words
```

If everything passes, confirm all checks passed. If any failed, summarize the failures and offer to fix them.
