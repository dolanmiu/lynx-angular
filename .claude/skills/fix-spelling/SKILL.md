---
name: fix-spelling
description: "Fix cspell spelling errors by finding the best resolution for each unknown word. Use when cspell reports unknown words, when you want to clean up spelling lint errors, or when adding new words/patterns to cspell config. Handles dictionaries, synonyms, regex patterns, and per-file suppressions."
---

# Fix Spelling (cspell)

Resolve cspell unknown-word errors using the least-invasive fix that is also correct. Work through the decision tree for every flagged word.

## Decision Tree

For each unknown word, evaluate in this order:

### 1. Is there a cspell dictionary that covers it?

Run to find what dictionaries are installed:
```sh
npx cspell --help | grep -A5 "dictionaries"
# or list bundled dictionaries:
ls node_modules/@cspell/dict-*/
```

Check the [cspell dictionaries catalog](https://github.com/streetsidesoftware/cspell-dicts) for a matching package (e.g. `@cspell/dict-software-terms`, `@cspell/dict-css`, `@cspell/dict-typescript`). If one exists, install it and add it to the relevant `cspell.json`:

```json
{
  "dictionaries": ["software-terms"],
  "dictionaryDefinitions": [
    { "name": "software-terms", "path": "./node_modules/@cspell/dict-software-terms/dict/softwareTerms.txt" }
  ]
}
```

**Only add a dictionary if it covers the word AND the dictionary is broadly relevant** — don't install a CSS dictionary just for one word.

### 2. Is there a semantically equivalent word already in the dictionary?

If the word is a variant, informal plural, or non-standard compound, prefer the standard spelling that cspell already accepts:

| Non-standard | Prefer |
|---|---|
| `lifecycles` | `life cycles` or `lifecycle` (singular) |
| `datastore` | `data store` |
| `autoformat` | `auto-format` |

Edit the source file to use the standard word. **This is the cleanest fix** — no config change needed.

### 3. Is the word genuinely real and worth keeping?

A word passes this bar if it appears in mainstream technical documentation (MDN, Angular docs, Node.js docs, etc.) or is a widely-accepted compound in software engineering. When in doubt, search for it.

If yes, add it to `cspell.json` at the appropriate scope (see **Scope Rules** below).

### 4. Can the pattern be matched with a regex?

Use a `patterns` entry when the "word" is a structured token — not a dictionary word — that will appear in many places:

- Framework-generated identifiers: `ngcontent-abc-c0`, `_nghost-ng-c12`
- CSS variable values with embedded names: `--font-display: "My Custom Font"`
- API tokens, hash values, encoded strings: `phc_abc123`, `LA9j8kH8nO`
- Date/format strings: `yyyy-MM-dd`, `HH:mm:ss`
- Vendor-specific event names that follow a pattern: `bindtap`, `catchtap`

Add to the relevant `cspell.json`:
```json
{
  "patterns": [
    {
      "name": "my-pattern-name",
      "pattern": "your-regex-here"
    }
  ],
  "ignoreRegExpList": ["my-pattern-name"]
}
```

### 5. Inline suppression (one-off cases)

Use inline comments only for truly isolated occurrences — a proper name, a generated identifier, a legacy string you cannot change.

**Suppress one line:**
```ts
// cspell:disable-next-line
const x = someWeirdIdentifier;
```

**Declare words used throughout a file:**
```ts
// cspell:words myWord anotherWord
```

Place the `cspell:words` comment near the top of the file. Use this when a word appears several times in one file but is not used project-wide.

---

## Scope Rules

When a word must be added to a `words` array, add it at the **narrowest correct scope**:

| Scope | When to use | Where |
|---|---|---|
| **File inline** | Word appears only in this one file | `// cspell:words x` in the file |
| **Package-local** | Word is specific to one package in the monorepo | `packages/<name>/cspell.json` |
| **Monorepo root** | Word is used across multiple packages | Root `cspell.json` |

Do not add a word to the root config if it is only used in one package. Do not add a word to a package config if it appears across the monorepo.

Keep the `words` array alphabetically sorted.

---

## How to Investigate an Unknown Word

1. **Find where it appears:**
   ```sh
   grep -rn "theWord" --include="*.ts" --include="*.md" --include="*.mdx" .
   ```

2. **Check if it's in any installed cspell dict:**
   ```sh
   npx cspell check --no-progress /path/to/file.ts 2>&1 | grep "theWord"
   # or test a word directly:
   echo "theWord" | npx cspell stdin
   ```

3. **Count occurrences to judge scope:**
   - 1-3 occurrences in one file → inline suppression
   - Many occurrences in one package → package `cspell.json`
   - Spread across packages → root `cspell.json`

4. **Verify the fix eliminates the error:**
   ```sh
   npx cspell "**/*.{ts,md,mdx}" --no-progress
   ```

---

## Output Format

For each flagged word, report:

```
Word: "lifecycles"  
File: docs/examples/session-storage.mdx:3:44

Decision:
  ✗ Dictionary: no cspell dict covers this
  ✗ Synonym: "lifecycle" (singular) is accepted — but semantics require plural
  ✓ Real word: widely used in Angular/React docs
  Scope: 1 occurrence, specific to this package

Fix: Add "lifecycles" to packages/website/cspell.json → words[]
```

Then apply the fix.
