# Legal Notes

This is not legal advice. Review the licenses and service terms with counsel
before using this project in a commercial, regulated, or customer-facing system.

## License Boundaries

There are two separate license contexts:

1. This repository (`trisetiohidayat/google-drive-mcp-agent`) is licensed by
   its repository owner under Apache License 2.0.
2. The upstream reference repository
   (`gemini-cli-extensions/workspace`) is separately licensed by its upstream
   authors under Apache License 2.0.

The Apache 2.0 license in this repository applies to this repository's own
source code. The upstream project's Apache 2.0 license remains attached to the
upstream project and to any upstream code copied or derived from it.

Apache 2.0 generally permits use, modification, distribution, and sublicensing,
including use outside Gemini CLI, as long as the license obligations are
followed. Key obligations include:

- Include a copy of the Apache 2.0 license when redistributing.
- Preserve required copyright, patent, trademark, and attribution notices.
- Mark modified files when distributing modified versions.
- Do not imply endorsement by the original authors, Google, Gemini CLI,
  Anthropic, OpenAI, or any other vendor.

## Source Repository Reference

This repository was written as an independent MCP server, with source
inspiration and compatibility notes taken from:

- https://github.com/gemini-cli-extensions/workspace

The referenced project is the Google Workspace Extension for Gemini CLI. Its
Apache 2.0 license is the upstream license for that upstream project, not a
claim that Google, Gemini CLI, or the upstream authors endorse this repository.

## Google API Terms

Using this MCP server also requires compliance with Google terms and policies,
including:

- Google Terms of Service: https://policies.google.com/terms
- Google Privacy Policy: https://policies.google.com/privacy
- Google API Services User Data Policy:
  https://developers.google.com/terms/api-services-user-data-policy
- Google API Services Terms of Service:
  https://developers.google.com/terms

OAuth consent screens, requested scopes, user disclosure, storage, retention,
and deletion of Google user data must match the actual system behavior.

If credentials are produced through the upstream Gemini CLI Google Workspace
extension OAuth flow, the Google consent screen can be branded for that
upstream OAuth application. This repository does not own that OAuth client.
Use a dedicated OAuth client for deployments that should present their own app
identity. See `AUTHORIZATION.md`.

## Trademark

Google Drive, Google Workspace, Gemini, Claude, Codex, Anthropic, and OpenAI are
trademarks or product names of their respective owners. This project is not
endorsed by or affiliated with those owners.
