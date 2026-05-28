# scripts/ README

## run-all-tests.mjs
Production · invoked by `npm test`. It runs the repository's Node test files and prints pass/fail totals. Run before and after any behavior change; it touches no source files.

## backfill-voice-tags.mjs
v3.3.1 one-shot migration, already executed and kept for audit. It backfilled group voice metadata in `groups/*.md`; do not rerun unless intentionally replaying that migration on a fresh data copy.

## gen-lineup-expansion.mjs
Historical generator for lineup expansion data. Treat as one-shot lineage tooling; it can touch roster/frontmatter files and should not be run during normal development.

## gen-master-roster.mjs
Historical master roster generator. Use only when rebuilding roster data from the original source model; it may rewrite generated roster docs/data.

## gen-v28-expansion.mjs
Historical v2.8 expansion generator. One-shot; retained to show how the large roster expansion was produced. It may touch agents and group-adjacent generated data.

## gen-v30-eras.mjs
Historical v3.0 era generator. One-shot; retained for audit of era universe backfill. It may touch `groups/*.md` era blocks and related docs.

## llm-smoke-test.mjs
Manual verification script for live LLM providers. Run with `npm run llm:smoke` only when provider API keys are configured; it should not be required in CI and should not write secrets.
