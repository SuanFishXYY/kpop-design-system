// bin/council.test.mjs
// CLI integration tests for bin/council.mjs flags.

import { test } from "node:test";
import assert from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BIN = resolve(join(fileURLToPath(import.meta.url), "..", "council.mjs"));

function run(args, options = {}) {
  const res = spawnSync(process.execPath, [BIN, ...args], {
    encoding: "utf8",
    ...options,
  });
  return {
    status: res.status,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
    out: (res.stdout || "") + (res.stderr || ""),
  };
}

function makeTmpDir(prefix) {
  return mkdtempSync(join(tmpdir(), prefix));
}

test("--transcript writes markdown transcript file", () => {
  const outDir = makeTmpDir("kpop-transcript-");
  try {
    const r = run([
      "--brief", "IVE comeback landing page",
      "--auto",
      "--transcript",
      "--output-dir", outDir,
    ]);
    assert.equal(r.status, 0, r.out);
    const savedMatch = r.stdout.match(/Transcript saved:\s*(.+)/i);
    assert(savedMatch, `expected Transcript saved line in output: ${r.stdout}`);
    const path = savedMatch[1].trim();
    assert(existsSync(path), `expected transcript file ${path}`);
    const md = readFileSync(path, "utf8");
    assert(md.includes("# K-pop Council Transcript"));
    assert(md.includes("## R1 — Independent Statements"));
    assert(md.includes("## R2 — Cross-examination"));
    assert(md.includes("## R3 — Final Declarations"));
    assert(md.includes("## Clause Classification"));
    assert(md.includes("## Verdict"));
    assert(md.includes("## Appendix: Host-AI System Prompt"));
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("--transcript --json includes transcript_path in JSON", () => {
  const outDir = makeTmpDir("kpop-transcript-json-");
  try {
    const r = run([
      "--brief", "typography and motion landing page",
      "--auto",
      "--transcript",
      "--json",
      "--output-dir", outDir,
    ]);
    assert.equal(r.status, 0, r.out);
    const data = JSON.parse(r.stdout);
    assert(data.transcript_path, `expected transcript_path in JSON: ${r.stdout}`);
    assert(existsSync(data.transcript_path));
    const md = readFileSync(data.transcript_path, "utf8");
    assert(md.includes("# K-pop Council Transcript"));
    assert.equal(data.mode, "council");
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("--transcript --no-save does not write file", () => {
  const outDir = makeTmpDir("kpop-transcript-nosave-");
  try {
    const r = run([
      "--brief", "bold color palette hero banner",
      "--auto",
      "--transcript",
      "--no-save",
      "--output-dir", outDir,
    ]);
    assert.equal(r.status, 0, r.out);
    const entries = readdirSync(outDir);
    assert.equal(entries.length, 0, `expected no files, got ${entries.join(", ")}`);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});
