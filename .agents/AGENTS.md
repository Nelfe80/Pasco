# AGENTS.md

Instructions for Antigravity when working on this repository.

This repository should be modified carefully. Prefer small, reviewable, verified changes.

## Repository Context

- Main language/framework: HTML, CSS, JavaScript (Static Web App for GitHub Pages)
- Important directories:
  - `.agents/`: Customizations (Skills and Rules)
  - `regles/`: Rules and documentation in French
- Entry points: `index.html` (to be created)
- Test command: N/A
- Lint command: N/A
- Build command: N/A
- Local setup notes: Open `index.html` in a web browser or run a local web server (e.g. `npx http-server` or `python -m http.server`)
- Sensitive areas: N/A

## Working Principles

### Understand Before Editing

Before implementing, briefly identify:
- the goal,
- the files or areas involved,
- assumptions,
- verification method.

Ask before proceeding when ambiguity could change the implementation or affect behavior, data, permissions, routing, APIs, security, legacy compatibility, or architecture.

For minor details, choose the simplest reasonable option, state the assumption, and keep the diff minimal.

### Keep Changes Minimal

Do only what was requested.
Do not add:
- speculative features,
- unnecessary abstractions,
- broad refactors,
- unrelated cleanup,
- new dependencies,
- style-only rewrites.

If a simpler approach exists, mention it and prefer it.

### Make Surgical Diffs

Touch only the files required by the task.
When editing existing code:
- match the local style,
- preserve naming and conventions,
- avoid reformatting unrelated lines,
- avoid moving code unless necessary,
- clean up only unused code introduced by your own changes.

Unrelated issues should be reported, not fixed.

### Verify Work

Use existing checks whenever possible.
Preferred verification order:
- targeted automated tests,
- relevant lint/type/build checks,
- focused manual verification,
- reasoned explanation if checks cannot be run.

Do not claim success without verification or clearly stated reasoning.

---

# CLAUDE.md Behavioral Guidelines

Behavioral guidelines to reduce common LLM coding mistakes.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]

## Final Response

End with:
- Summary
- Files changed
- Verification
- Assumptions / risks
- Unrelated notes, if any
