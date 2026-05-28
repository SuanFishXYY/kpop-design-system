#!/usr/bin/env node
// scripts/run-all-tests.mjs
// v3.3.0+ unified test runner. Iterates engine/*.test.mjs, runs each as child process,
// parses "pass N" / "fail N" lines, prints per-file table + aggregate summary.
// Exits 0 if all pass, 1 if any fail.

import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const ENGINE = join(ROOT, "engine");

function findTestFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...findTestFiles(full));
    else if (name.endsWith(".test.mjs")) out.push(full);
  }
  return out;
}

function runOne(file) {
  const start = Date.now();
  const res = spawnSync(process.execPath, [file], { encoding: "utf8" });
  const elapsed = Date.now() - start;
  const stdout = (res.stdout || "") + (res.stderr || "");
  let pass = 0, fail = 0;
  const passMatch = stdout.match(/pass\s+(\d+)/i);
  const failMatch = stdout.match(/fail\s+(\d+)/i);
  if (passMatch) pass = parseInt(passMatch[1], 10);
  if (failMatch) fail = parseInt(failMatch[1], 10);
  // Fallback: if no pass/fail markers but exit code 0 and stdout has content -> count 1 pass
  if (pass === 0 && fail === 0) {
    if (res.status === 0 && stdout.trim().length > 0) pass = 1;
    else if (res.status !== 0) fail = 1;
  }
  return { file, pass, fail, exit: res.status, elapsed, raw: stdout };
}

const files = findTestFiles(ENGINE).sort();
if (files.length === 0) {
  console.error("No test files found under engine/");
  process.exit(1);
}

console.log(`\n  v3.3.0+ test runner · ${files.length} files\n`);
console.log("  " + "─".repeat(64));
console.log("  " + "FILE".padEnd(42) + "PASS".padStart(6) + "FAIL".padStart(6) + "TIME".padStart(10));
console.log("  " + "─".repeat(64));

let totalPass = 0, totalFail = 0;
const failures = [];
for (const f of files) {
  const r = runOne(f);
  totalPass += r.pass;
  totalFail += r.fail;
  if (r.fail > 0 || r.exit !== 0) failures.push(r);
  const name = relative(ROOT, f).replace(/\\/g, "/");
  const mark = r.fail > 0 ? "✗" : "✓";
  console.log("  " + (mark + " " + name).padEnd(42) + String(r.pass).padStart(6) + String(r.fail).padStart(6) + (r.elapsed + "ms").padStart(10));
}

console.log("  " + "─".repeat(64));
console.log("  " + "TOTAL".padEnd(42) + String(totalPass).padStart(6) + String(totalFail).padStart(6));
console.log("  " + "─".repeat(64));

if (failures.length > 0) {
  console.log("\n  FAILURES:");
  for (const f of failures) {
    console.log("\n  --- " + relative(ROOT, f.file) + " (exit " + f.exit + ") ---");
    console.log(f.raw.split("\n").slice(-12).map(l => "  " + l).join("\n"));
  }
  console.log(`\n  ✗ ${totalFail} failure(s) across ${failures.length} file(s)\n`);
  process.exit(1);
}

console.log(`\n  ✓ all ${totalPass} tests pass · ${files.length} files\n`);
process.exit(0);
