// bin/mcp-server.http.test.mjs
// HTTP+SSE transport smoke tests for the MCP server.

import { test } from "node:test";
import assert from "node:assert";
import { spawn } from "node:child_process";
import http from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVER = join(__dirname, "mcp-server.mjs");
const PORT = 3999;
const HOST = "127.0.0.1";

function startHttpServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SERVER, "--transport=http", `--port=${PORT}`, `--host=${HOST}`], {
      stdio: ["ignore", "ignore", "pipe"],
    });
    let stderr = "";
    let resolved = false;
    child.stderr.on("data", data => {
      stderr += data;
      if (!resolved && stderr.includes("listening on")) {
        resolved = true;
        resolve(child);
      }
    });
    child.on("error", reject);
    setTimeout(() => reject(new Error("HTTP server did not start in time")), 5000);
  });
}

function connectSse() {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://${HOST}:${PORT}/sse`, res => {
      const chunks = [];
      res.on("data", chunk => {
        chunks.push(chunk);
        const text = Buffer.concat(chunks).toString("utf-8");
        const m = text.match(/data: (?:https?:\/\/[^\n]+)?(\/messages\?sessionId=[^\n]+)/);
        if (m) {
          resolve({ res, endpoint: m[1] });
        }
      });
      res.on("error", reject);
    });
    req.on("error", reject);
  });
}

function postMessage(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      { hostname: HOST, port: PORT, path: endpoint, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } },
      res => {
        let out = "";
        res.on("data", chunk => { out += chunk; });
        res.on("end", () => resolve({ statusCode: res.statusCode, body: out }));
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function collectMessages(res, expected, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    const messages = [];
    const timer = setTimeout(() => {
      res.destroy();
      resolve(messages);
    }, timeoutMs);
    res.on("data", chunk => {
      buffer += chunk;
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop();
      for (const block of blocks) {
        const dataLines = block.split("\n").filter(l => l.startsWith("data: "));
        for (const line of dataLines) {
          try {
            messages.push(JSON.parse(line.slice("data: ".length)));
          } catch {}
        }
      }
      if (messages.length >= expected) {
        clearTimeout(timer);
        res.destroy();
        resolve(messages);
      }
    });
    res.on("error", reject);
  });
}

test("HTTP+SSE transport handles initialize and tools/call", async () => {
  const child = await startHttpServer();
  try {
    const { res, endpoint } = await connectSse();
    const messagesPromise = collectMessages(res, 2);

    const initAck = await postMessage(endpoint, { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {} } });
    assert.equal(initAck.statusCode, 202);

    const toolAck = await postMessage(endpoint, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "kpop_assemble_council", arguments: { brief: "HTTP test" } } });
    assert.equal(toolAck.statusCode, 202);

    const messages = await messagesPromise;
    assert.equal(messages.length, 2);
    assert.equal(messages[0].id, 1);
    assert.ok(messages[0].result.serverInfo);
    assert.equal(messages[1].id, 2);
    assert.ok(messages[1].result.content);
  } finally {
    child.kill();
  }
});

test("HTTP transport rejects unknown routes", async () => {
  const child = await startHttpServer();
  try {
    const res = await new Promise((resolve, reject) => {
      http.get(`http://${HOST}:${PORT}/unknown`, r => resolve(r)).on("error", reject);
    });
    assert.equal(res.statusCode, 404);
  } finally {
    child.kill();
  }
});

test("HTTP transport rejects oversized request bodies", async () => {
  const child = await startHttpServer();
  try {
    const { res, endpoint } = await connectSse();
    const bigBody = "x".repeat(11 * 1024 * 1024);
    const ack = await new Promise((resolve, reject) => {
      const req = http.request(
        { hostname: HOST, port: PORT, path: endpoint, method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(bigBody) } },
        r => { let out = ""; r.on("data", c => out += c); r.on("end", () => resolve({ statusCode: r.statusCode, body: out })); }
      );
      req.on("error", reject);
      req.write(bigBody);
      req.end();
    });
    res.destroy();
    assert.equal(ack.statusCode, 413);
  } finally {
    child.kill();
  }
});
