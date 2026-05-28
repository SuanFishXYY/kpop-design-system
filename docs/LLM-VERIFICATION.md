# LLM Verification

## 1. Why this matters

v3.4 LLM support is real code, but CI intentionally does not call paid external APIs. The deterministic stub keeps tests stable; this smoke test gives maintainers a one-command path to verify the live DeepSeek path before shipping.

## 2. How to verify in 2 minutes

PowerShell:

```powershell
$env:DEEPSEEK_API_KEY="sk-..."
npm run llm:smoke
```

macOS / Linux:

```bash
export DEEPSEEK_API_KEY="sk-..."
npm run llm:smoke
```

Expected behavior: the script prints a short response to "你是一个 K-pop 视觉策略专家. 用 2 句话评价 IVE 的 4 代少女美学." plus latency and token information when available.

## 3. Sample output

```text
=== DeepSeek LLM Smoke Test ===
<placeholder: paste real model response here after running>
latency_ms: <placeholder>
tokens: <placeholder or n/a>
```

## 4. Provider signup links

- DeepSeek: https://platform.deepseek.com/
- Anthropic: https://console.anthropic.com/
- Google Gemini: https://aistudio.google.com/

## 5. Cost estimate per smoke test

- DeepSeek: typically < 1 cent for this tiny prompt.
- Claude: roughly ~5 cents or less depending on selected model and current pricing.
- Google Gemini: usually < 1 cent on Flash-class models.

Always check provider dashboards for current pricing before high-volume tests.
