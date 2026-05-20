# Security Notes

This MCP server exposes Google Drive data to an AI agent through MCP tools.
Treat it as security-sensitive infrastructure.

## Default Safety Model

- This implementation is read-only.
- No file creation, update, delete, move, permission, or sharing tools are
  included.
- Keep it read-only unless there is a reviewed and explicit business need for
  write access.

## OAuth and Secrets

- Never commit OAuth credentials, refresh tokens, service account keys, or
  downloaded Drive files.
- Store credentials outside the repository.
- Use a dedicated OAuth client where practical.
- Use the least-privilege Drive scope that still satisfies your use case.
- Rotate credentials immediately if exposed to logs, prompts, chat history, or
  source control.
- Verify which OAuth client created a refresh token before sharing it with an
  agent. Consent screen branding and user trust belong to that OAuth client,
  not to this MCP server. See `AUTHORIZATION.md`.

Recommended read-only scopes:

- `https://www.googleapis.com/auth/drive.metadata.readonly`
- `https://www.googleapis.com/auth/drive.readonly`

## Prompt Injection Risk

Google Drive content can contain malicious or misleading instructions. When an
agent reads documents, spreadsheets, comments, or filenames, those contents can
attempt indirect prompt injection.

Operational guidance:

- Do not grant write tools to agents that process untrusted Drive content.
- Do not let document text override system or developer instructions.
- Treat Drive content as data, not instructions.
- Log and review high-impact actions performed after reading Drive content.
- Prefer human approval before any future write-capable tool is enabled.

## Data Handling

- Avoid returning more data than needed to the agent.
- Prefer metadata search/list tools before downloading or exporting content.
- Do not store downloaded files in shared, synced, or public folders.
- Apply your organization's retention and deletion policies to any Drive data
  copied outside Google Drive.

## Reporting Security Issues

Do not open public issues containing secrets, tokens, or private Drive data.
Report privately to the repository owner.
