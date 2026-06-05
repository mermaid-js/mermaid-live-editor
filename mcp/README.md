# Mermaid Live Editor — MCP server

An [MCP](https://modelcontextprotocol.io) server that lets an AI assistant (e.g. Claude
Desktop) save Mermaid diagrams it generates straight into your self-hosted Mermaid Live
Editor. It turns raw Mermaid source into the editor's `pako:` payload and calls the backend
REST API, authenticating with a static Bearer token.

It runs **on your machine** (next to Claude Desktop), not on the server.

## Prerequisites

- Node.js ≥ 20.19 on the machine running Claude Desktop.
- The backend reachable over HTTPS (e.g. `https://mermaid.internal.elementdigital.com.au`).
- The account you want diagrams saved under must have **signed into the editor at least
  once** (so its user row exists).

## 1. Configure the server token

On the server, set these in `server/.env` (a fresh `setup.sh` install generates the token
for you):

```bash
# A long random token. Generate one with:
#   node -e "console.log('mle_pat_' + require('crypto').randomBytes(32).toString('base64url'))"
MCP_API_TOKEN=mle_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# The account diagrams are saved under (defaults to the first ADMIN_EMAILS entry).
MCP_API_EMAIL=leigh@elementdigital.com.au
```

Restart the backend: `systemctl restart mermaid`.

Verify the token works (note: **no** `Set-Cookie` is returned for Bearer auth):

```bash
curl -i https://mermaid.internal.elementdigital.com.au/api/folders \
  -H "Authorization: Bearer mle_pat_xxxx"
```

A correct token returns `200` and a JSON array; a wrong/empty one returns `401`.

## 2. Install this MCP server

```bash
cd mcp
pnpm install        # or: npm install
```

## 3. Hook it into Claude Desktop

Edit `claude_desktop_config.json` (Settings → Developer → Edit Config) and add:

```json
{
  "mcpServers": {
    "mermaid": {
      "command": "node",
      "args": [
        "--import",
        "tsx",
        "C:\\Users\\Leigh\\OneDrive\\Documents\\GitHub\\mermaid-live-editor\\mcp\\src\\index.ts"
      ],
      "env": {
        "MLE_BASE_URL": "https://mermaid.internal.elementdigital.com.au",
        "MCP_API_TOKEN": "mle_pat_xxxx (same value as the server)"
      }
    }
  }
}
```

Restart Claude Desktop. The `mermaid` tools should appear.

> Config is read from the `env` block above. A local `mcp/.env` (copy `.env.example`) also
> works when you run the server directly with `pnpm start` — handy for testing.

## Tools

| Tool | Purpose |
| --- | --- |
| `save_diagram(name, code, folderId?)` | Save new diagram from raw Mermaid; returns id + share URL |
| `update_diagram(id, name?, code?)` | Rename and/or replace an existing diagram's source |
| `list_diagrams(folderId?)` | List saved diagrams (metadata) |
| `list_folders()` | List folders |
| `create_folder(name, parentId?)` | Create a folder |
| `get_editor_url(code)` | Encode source into a shareable `/edit#…` URL without saving |

## Security notes

- The token grants full diagram/folder access for `MCP_API_EMAIL`. Keep `mcp/.env` and the
  Claude config private (the token is a credential).
- To revoke: change `MCP_API_TOKEN` in `server/.env` and restart the backend.
- Traffic is HTTPS-only; never log the token.
