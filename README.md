# Google Drive MCP Agent

Agent-agnostic, read-only Google Drive MCP server for Claude, Codex, and other
MCP clients.

This project is an independent implementation. It was written for generic MCP
clients and is not tied to Gemini CLI. Source inspiration and compatibility
reference: https://github.com/gemini-cli-extensions/workspace

## Features

- Search Google Drive files.
- List direct children of a folder.
- Read file metadata.
- Read Drive comments.
- Read-only by design.

## Requirements

- Node.js 20+
- Google OAuth credentials with a refresh token
- An MCP client that supports stdio servers

## Install

Clone and build locally:

```bash
git clone https://github.com/trisetiohidayat/google-drive-mcp-agent.git
cd google-drive-mcp-agent
npm install
npm run build
```

Or install from GitHub with npm in your own project:

```bash
npm install github:trisetiohidayat/google-drive-mcp-agent
```

## Authentication

Provide credentials in one of two ways.

OAuth consent screen branding is controlled by the Google Cloud OAuth client
that created the refresh token. If the token was created through the upstream
Gemini CLI Google Workspace extension, Google may show a consent screen branded
for Gemini CLI / the Google Workspace extension. For details and source notes,
see [AUTHORIZATION.md](AUTHORIZATION.md).

### Option A: Authorized User JSON

Set `GOOGLE_OAUTH_CREDENTIALS` to a JSON file outside this repository:

```json
{
  "type": "authorized_user",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

```bash
export GOOGLE_OAUTH_CREDENTIALS="$HOME/.config/google-drive-mcp/authorized_user.json"
```

### Option B: Environment Variables

```bash
export GOOGLE_CLIENT_ID="YOUR_CLIENT_ID"
export GOOGLE_CLIENT_SECRET="YOUR_CLIENT_SECRET"
export GOOGLE_REFRESH_TOKEN="YOUR_REFRESH_TOKEN"
```

Recommended scopes:

- `https://www.googleapis.com/auth/drive.metadata.readonly`
- `https://www.googleapis.com/auth/drive.readonly`

## Claude Installation

### Claude Desktop

Add this to your Claude Desktop MCP config.

macOS path:

```text
~/Library/Application Support/Claude/claude_desktop_config.json
```

Example:

```json
{
  "mcpServers": {
    "google_drive": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/google-drive-mcp-agent/dist/index.js"
      ],
      "env": {
        "GOOGLE_OAUTH_CREDENTIALS": "/ABSOLUTE/PATH/authorized_user.json"
      }
    }
  }
}
```

### Claude Code

If your Claude Code installation supports `claude mcp add-json`, use:

```bash
claude mcp add-json google_drive '{
  "command": "node",
  "args": ["/ABSOLUTE/PATH/google-drive-mcp-agent/dist/index.js"],
  "env": {
    "GOOGLE_OAUTH_CREDENTIALS": "/ABSOLUTE/PATH/authorized_user.json"
  }
}'
```

If your version uses a project `.mcp.json`, use the same `mcpServers` object as
the Claude Desktop example.

## Codex Installation

Add this to `~/.codex/config.toml`:

```toml
[mcp_servers.google_drive]
command = "node"
args = ["/ABSOLUTE/PATH/google-drive-mcp-agent/dist/index.js"]
env = { GOOGLE_OAUTH_CREDENTIALS = "/ABSOLUTE/PATH/authorized_user.json" }
```

Alternative Codex config using `npx` directly from GitHub:

```toml
[mcp_servers.google_drive]
command = "npx"
args = ["--yes", "github:trisetiohidayat/google-drive-mcp-agent"]
env = { GOOGLE_OAUTH_CREDENTIALS = "/ABSOLUTE/PATH/authorized_user.json" }
```

Restart Codex after changing the MCP config.

## Available Tools

### `drive_search`

Search files. `query` can be a simple term or a Google Drive v3 query string.

Example simple query:

```json
{ "query": "ekspedisi", "pageSize": 20 }
```

Example Drive query:

```json
{ "query": "name contains 'SUQMA' and mimeType = 'application/vnd.google-apps.folder'" }
```

### `drive_list_folder`

List direct children of a folder.

```json
{ "folderId": "GOOGLE_DRIVE_FOLDER_ID" }
```

### `drive_get_metadata`

Read metadata for one file.

```json
{ "fileId": "GOOGLE_DRIVE_FILE_ID" }
```

### `drive_get_comments`

Read comments on one file.

```json
{ "fileId": "GOOGLE_DRIVE_FILE_ID" }
```

## Legal and Security

Read these before deploying:

- [LEGAL.md](LEGAL.md)
- [SECURITY.md](SECURITY.md)
- [NOTICE](NOTICE)
- [LICENSE](LICENSE)

Important summary:

- This project is Apache-2.0 licensed.
- This project is not official Google, Gemini CLI, Claude, Codex, Anthropic, or
  OpenAI software.
- Google API usage must comply with Google API terms and user data policies.
- Drive content may contain indirect prompt injection. Treat all Drive content
  as untrusted data.

## Dependency Decision Record

Dependency: `@modelcontextprotocol/sdk`
Purpose: MCP server implementation.
Version selected: `1.29.0`
Security checks: npm metadata and OSV via `dependency-risk-check`.
Known advisories or recent incidents: none found by OSV at creation time.
Risk: low.
Decision: use exact pinned version.

Dependency: `googleapis`
Purpose: Google Drive API client.
Version selected: `171.2.0`
Security checks: npm metadata and OSV via `dependency-risk-check`.
Known advisories or recent incidents: none found by OSV at creation time.
Risk: low.
Decision: use exact pinned version.

Dependency: `google-auth-library`
Purpose: OAuth client for refresh-token based Drive access.
Version selected: `10.6.2`
Security checks: npm metadata and OSV via `dependency-risk-check`.
Known advisories or recent incidents: none found by OSV at creation time.
Risk: low.
Decision: use exact pinned version.

Dependency: `zod`
Purpose: MCP tool input schemas.
Version selected: `4.2.0`
Security checks: npm metadata and OSV via `dependency-risk-check`.
Known advisories or recent incidents: none found by OSV at creation time.
Risk: low.
Decision: use exact pinned version.
