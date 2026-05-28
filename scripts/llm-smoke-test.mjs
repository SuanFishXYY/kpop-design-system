#!/usr/bin/env node
import * as deepseek from "../engine/llm/deepseek.mjs";

const system = "你是一个 K-pop 视觉策略专家.";
const user = "用 2 句话评价 IVE 的 4 代少女美学.";

function hasKey() {
  return Boolean(process.env.DEEPSEEK_API_KEY || process.env.KPOP_LLM_API_KEY);
}

if (!hasKey()) {
  console.log("Set DEEPSEEK_API_KEY then re-run. See docs/LLM-VERIFICATION.md");
  console.log("Example: $env:DEEPSEEK_API_KEY='sk-...' ; npm run llm:smoke");
  process.exit(0);
}

const started = Date.now();
try {
  const response = await deepseek.call({ system, user, max_tokens: 120 });
  const latencyMs = Date.now() - started;
  console.log("=== DeepSeek LLM Smoke Test ===");
  console.log(response);
  console.log("latency_ms: " + latencyMs);
  console.log("tokens: n/a (provider wrapper does not expose usage yet)");
  process.exit(0);
} catch (error) {
  const latencyMs = Date.now() - started;
  console.error("DeepSeek smoke test failed");
  console.error("latency_ms: " + latencyMs);
  console.error(error?.message || error);
  process.exit(1);
}
