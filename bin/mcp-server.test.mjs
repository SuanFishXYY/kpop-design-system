// bin/mcp-server.test.mjs
// MCP server integration tests over stdio JSON-RPC.

import { test } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, "mcp-server.mjs");

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER], { stdio: ["pipe", "pipe", "pipe"] });
    let buffer = "";
    const pending = new Map();
    let id = 0;

    child.stdout.on("data", data => {
      buffer += data;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id !== undefined && pending.has(msg.id)) {
            const { resolve: res, reject: rej } = pending.get(msg.id);
            pending.delete(msg.id);
            if (msg.error) rej(new Error(msg.error.message));
            else res(msg.result);
          }
        } catch {}
      }
    });

    child.on("error", reject);
    child.on("close", code => {
      if (code !== 0 && code !== null) reject(new Error(`server exited with code ${code}`));
    });

    function call(method, params = {}) {
      const reqId = ++id;
      const req = { jsonrpc: "2.0", id: reqId, method, params };
      return new Promise((res, rej) => {
        pending.set(reqId, { resolve: res, reject: rej });
        child.stdin.write(JSON.stringify(req) + "\n");
      });
    }

    function notify(method, params = {}) {
      child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
    }

    child.on("spawn", () => resolve({ call, notify, stop: () => child.kill() }));
  });
}

test("initialize and tools/list", async () => {
  const server = await startServer();
  try {
    const init = await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    assert.equal(init.serverInfo.name, "kpop-design-system");
    assert.ok(init.capabilities.tools);
    server.notify("notifications/initialized");

    const list = await server.call("tools/list");
    assert.ok(Array.isArray(list.tools));
    const names = list.tools.map(t => t.name);
    assert.ok(names.includes("kpop_assemble_council"));
    assert.ok(names.includes("kpop_run_deliberation"));
    assert.ok(names.includes("kpop_generate_design_brief"));
    assert.ok(names.includes("kpop_review_design"));
    assert.ok(names.includes("kpop_list_roster"));
  } finally {
    server.stop();
  }
});

test("kpop_assemble_council returns a council", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_assemble_council",
      arguments: { brief: "IVE comeback landing" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.council_id.startsWith("mixed-"));
    assert.ok(parsed.members.some(m => m.slug === "ive"));
  } finally {
    server.stop();
  }
});

test("kpop_generate_design_brief returns markdown", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_generate_design_brief",
      arguments: { brief: "aespa futuristic dashboard" },
    });
    const text = result.content[0].text;
    assert.match(text, /# Design Brief · aespa futuristic dashboard/);
    assert.match(text, /## Palette/);
  } finally {
    server.stop();
  }
});

test("kpop_review_design returns reviewer tally", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_review_design",
      arguments: { brief: "typography landing page" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.result);
    assert.equal(typeof parsed.for, "number");
  } finally {
    server.stop();
  }
});

test("kpop_run_deliberation respects user_vote", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_run_deliberation",
      arguments: { brief: "minimal test", size: 2, user_vote: "against" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.tally.audit_trail.some(v => v.voter === "user" && v.vote === "against"));
    assert.ok(parsed.verdict);
  } finally {
    server.stop();
  }
});

test("kpop_list_roster supports limit and offset", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_list_roster",
      arguments: { type: "idols", limit: 5, offset: 0 },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.idols.length, 5);
    assert.equal(parsed.meta.limit, 5);
    assert.equal(parsed.meta.offset, 0);
    assert.equal(parsed.totals.idols, 248);
    const offsetResult = await server.call("tools/call", {
      name: "kpop_list_roster",
      arguments: { type: "idols", limit: 2, offset: 1 },
    });
    const offsetParsed = JSON.parse(offsetResult.content[0].text);
    assert.equal(offsetParsed.idols.length, 2);
    assert.equal(offsetParsed.idols[0].slug, parsed.idols[1].slug);
  } finally {
    server.stop();
  }
});

test("kpop_list_roster returns idols", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_list_roster",
      arguments: { type: "idols" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(Array.isArray(parsed.idols));
    assert.ok(parsed.idols.some(i => i.slug === "aespa-karina"));
  } finally {
    server.stop();
  }
});

test("kpop_synthesize_voice returns voice prompt", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_synthesize_voice",
      arguments: { member: "aespa-karina", brief: "futuristic dashboard" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.member, "aespa-karina");
    assert.ok(parsed.voice.includes("aespa"));
  } finally {
    server.stop();
  }
});

test("kpop_conflicts detects label disputes", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_conflicts",
      arguments: { brief: "newjeans comeback" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.label_dispute.has_label_dispute, true);
    assert.ok(parsed.label_dispute.advisories.some(a => a.group_slug === "newjeans"));
  } finally {
    server.stop();
  }
});

test("validation rejects invalid tool arguments", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    await assert.rejects(
      () => server.call("tools/call", { name: "kpop_assemble_council", arguments: { brief: "" } }),
      /Invalid or missing brief/
    );
    await assert.rejects(
      () => server.call("tools/call", { name: "kpop_list_roster", arguments: { type: "unknown" } }),
      /Invalid type/
    );
  } finally {
    server.stop();
  }
});

test("kpop_search_roster returns matching idols", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_search_roster",
      arguments: { query: "karina", type: "idols" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.idols.some(i => i.slug === "aespa-karina"));
  } finally {
    server.stop();
  }
});

test("kpop_search_roster filters by group", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_search_roster",
      arguments: { query: "", type: "idols", group: "aespa" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.idols.length > 0);
    assert.ok(parsed.idols.every(i => i.group.toLowerCase() === "aespa"));
  } finally {
    server.stop();
  }
});

test("kpop_search_roster ranks exact matches first", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_search_roster",
      arguments: { query: "Karina", type: "idols" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.idols.length > 0);
    assert.equal(parsed.idols[0].slug, "aespa-karina");
  } finally {
    server.stop();
  }
});

test("kpop_compare_idols returns relationship analysis", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_compare_idols",
      arguments: { left: "aespa-karina", right: "aespa-winter" },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.left.slug, "aespa-karina");
    assert.equal(parsed.right.slug, "aespa-winter");
    assert.equal(parsed.same_group, true);
    assert.equal(typeof parsed.style_distance, "number");
  } finally {
    server.stop();
  }
});

test("kpop_get_member_persona returns speaking guide", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_get_member_persona",
      arguments: { member: "aespa-karina", brief: "futuristic dashboard", tension: 2 },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.member.slug, "aespa-karina");
    assert.ok(parsed.tone);
    assert.ok(parsed.speech_habits.length > 0);
    assert.equal(parsed.conflict_posture, "defend");
  } finally {
    server.stop();
  }
});

test("kpop_speak_in_character returns an in-character line", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_speak_in_character",
      arguments: { member: "aespa-karina", brief: "futuristic dashboard", stance: "agree", tension: 2 },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.equal(parsed.member, "aespa-karina");
    assert.equal(parsed.stance, "agree");
    assert.ok(parsed.line);
    assert.ok(parsed.line.includes("connect with æ"));
    assert.ok(parsed.tone);
  } finally {
    server.stop();
  }
});

test("kpop_build_host_prompt returns a council system prompt", async () => {
  const server = await startServer();
  try {
    await server.call("initialize", { protocolVersion: "2024-11-05", capabilities: {} });
    server.notify("notifications/initialized");
    const result = await server.call("tools/call", {
      name: "kpop_build_host_prompt",
      arguments: { brief: "red velvet summer comeback landing page", size: 3, include_sample_lines: true },
    });
    const parsed = JSON.parse(result.content[0].text);
    assert.ok(parsed.prompt);
    assert.ok(parsed.prompt.includes("R1 Independent statements"));
    assert.ok(parsed.prompt.includes("red velvet summer comeback landing page"));
    assert.ok(Array.isArray(parsed.members));
  } finally {
    server.stop();
  }
});
