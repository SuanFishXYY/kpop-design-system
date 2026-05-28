# scripts/ README

## run-all-tests.mjs
Production - invoked by `npm test`. It runs the repository Node test files and prints pass/fail totals. Run before and after any behavior change.

## backfill-voice-tags.mjs
v3.3.1 one-shot migration, already executed and kept for audit.

## gen-lineup-expansion.mjs
Historical generator for lineup expansion data. Treat as one-shot lineage tooling.

## gen-master-roster.mjs
Historical master roster generator. Use only when rebuilding roster data from the original source model.

## gen-v28-expansion.mjs
Historical v2.8 expansion generator. One-shot; retained to show how the large roster expansion was produced.

## gen-v30-eras.mjs
Historical v3.0 era generator. One-shot; retained for audit of era universe backfill.
