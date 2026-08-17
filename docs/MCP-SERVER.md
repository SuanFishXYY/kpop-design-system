# MCP Server

`bin/mcp-server.mjs` exposes the kpop-design-system engine as an MCP (Model Context Protocol) server. It supports both **stdio** (default) and **HTTP+SSE** transports.

## Run

### stdio (default)

```bash
node bin/mcp-server.mjs
```

### HTTP+SSE

```bash
node bin/mcp-server.mjs --transport=http --port=3000 --host=127.0.0.1
```

The server prints the listening URL to stderr. Clients connect via:

- `GET /sse` — establish an SSE stream and receive a `sessionId`
- `POST /messages?sessionId=...` — send JSON-RPC requests; responses arrive on the SSE stream

## Tools

| Tool | Purpose |
|------|---------|
| `kpop_assemble_council` | Assemble a style-first idol council for a brief |
| `kpop_run_deliberation` | Run a full deliberation and return a verdict document |
| `kpop_generate_design_brief` | Generate a complete design brief from a short description |
| `kpop_review_design` | Run a brief-aware design reviewer panel |
| `kpop_list_roster` | List idols, groups, or the full roster (with pagination) |
| `kpop_search_roster` | Search idols/groups by name/slug and optional filters |
| `kpop_compare_idols` | Compare two roster members across identity dimensions |
| `kpop_get_member_persona` | Get a deterministic speaking-persona guide for an idol/group |
| `kpop_conflicts` | Check a council for label disputes and personal conflicts |
| `kpop_synthesize_voice` | Generate a voice identity prompt for an idol or group |
| `kpop_speak_in_character` | Generate a deterministic first-person line for an idol/group |
| `kpop_build_host_prompt` | Build a host-AI system prompt for an in-character council |

## Tool parameters

- `kpop_assemble_council`: `{ brief, size?, add?, veto?, strict_size?: boolean }`
- `kpop_run_deliberation`: `{ brief, size?, add?, veto?, user_vote?: "for" | "against" | "abstain`, rebuttals?: boolean, strict_size?: boolean }`
- `kpop_generate_design_brief`: `{ brief, format?: "markdown" | "json" }`
- `kpop_review_design`: `{ brief }`
- `kpop_list_roster`: `{ type: "idols" | "groups" | "all", limit?: integer, offset?: integer }`
- `kpop_search_roster`: `{ query, type, group?, era?, specialty?, agency?, aesthetic_tag?, exact?, limit?, offset? }`
- `kpop_compare_idols`: `{ left, right }`
- `kpop_get_member_persona`: `{ member, brief?, tension?: 0-10 }`
- `kpop_conflicts`: `{ brief, size?, add?, veto?, strict_size?: boolean }`
- `kpop_synthesize_voice`: `{ member, brief? }`
- `kpop_speak_in_character`: `{ member, brief?, topic?, stance?: "agree" | "against" | "question" | "veto", tension?: 0-10 }`
  - `against`/`question`/`veto` are mapped internally to `dissent`/`reserve`/`dissent`; the raw stance is returned for traceability.
- `kpop_build_host_prompt`: `{ brief, size?, add?, veto?, strict_size?: boolean, include_sample_lines?: boolean }`

## Example JSON-RPC flow (stdio)

```json
{ "jsonrpc": "2.0", "id": 1, "method": "initialize", "params": { "protocolVersion": "2024-11-05", "capabilities": {} } }
{ "jsonrpc": "2.0", "method": "notifications/initialized" }
{ "jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": { "name": "kpop_assemble_council", "arguments": { "brief": "IVE comeback landing" } } }
{ "jsonrpc": "2.0", "id": 3, "method": "tools/call", "params": { "name": "kpop_run_deliberation", "arguments": { "brief": "IVE comeback landing", "user_vote": "for" } } }
{ "jsonrpc": "2.0", "id": 4, "method": "tools/call", "params": { "name": "kpop_list_roster", "arguments": { "type": "groups" } } }
```

## Example HTTP+SSE flow

```bash
# Terminal 1: start server
node bin/mcp-server.mjs --transport=http --port=3000

# Terminal 2: connect to SSE and read endpoint
curl -N http://127.0.0.1:3000/sse
# -> event: endpoint
# -> data: http://127.0.0.1:3000/messages?sessionId=...

# Terminal 3: post requests to the returned endpoint
curl -X POST "http://127.0.0.1:3000/messages?sessionId=..." \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Claude Code / Claude Desktop config

Add to your MCP settings:

```json
{
  "mcpServers": {
    "kpop-design-system": {
      "command": "node",
      "args": ["/path/to/kpop-design-system/bin/mcp-server.mjs"]
    }
  }
}
```

For HTTP mode, use an MCP client that supports HTTP+SSE and point it at `http://127.0.0.1:3000/sse`.

## Notes

- The server is stateless: every tool call receives its own brief and builds its own council.
- `kpop_run_deliberation` uses a default user vote of `for` unless `user_vote` is supplied.
- `kpop_generate_design_brief` defaults to markdown; set `format: "json"` for raw structured data.
- Tool arguments are validated before execution; invalid input returns a JSON-RPC error with a clear message.
- `kpop_list_roster` supports `limit`/`offset` to avoid dumping the full roster in one call.
- `kpop_search_roster` supports empty `query` with filters (e.g. `group: "aespa"`) to list matching roster slices.
- `kpop_compare_idols` returns `relationship`, `same_group`, `same_agency`, `same_era`, `common_rivals`, `common_aesthetic_tags`, and a `style_distance` score.
- `kpop_get_member_persona` derives tone, speech habits, conflict posture, negotiation levers, signature phrase, and hard veto triggers from frontmatter and group voice templates.
- `kpop_run_deliberation` now includes a `persona` object for every member in R1/R3, and each statement is an in-character line generated by `engine/speak.mjs`.
- `kpop_review_design` orders reviewers by relevance to the brief's detected design dimensions.
- `strict_size` on council tools caps the final council at `size`, trimming non-override members when `add`/`veto` would otherwise exceed the cap.
- `kpop_speak_in_character` is deterministic: the same member + topic + stance always returns the same line. Change the topic/stance to get a different variant.
