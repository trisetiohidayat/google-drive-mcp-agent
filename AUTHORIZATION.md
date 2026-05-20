# Authorization Notes

This project does not start a Google OAuth browser flow by itself. It expects
an existing Google OAuth `authorized_user` credential containing:

- `client_id`
- `client_secret`
- `refresh_token`

The Google consent screen name is controlled by the Google Cloud OAuth client
that created the refresh token. It is not controlled by this MCP server.

## What Happens With Gemini CLI Credentials

If the refresh token is created through the upstream Gemini CLI Google
Workspace extension flow, the browser authorization screen can appear under
the upstream Gemini CLI / Google Workspace OAuth application name. That is
expected because the OAuth URL is generated with the upstream OAuth client ID.

Relevant upstream references:

- `workspace-server/src/utils/config.ts` defines the default OAuth client ID and
  cloud function URL:
  https://github.com/gemini-cli-extensions/workspace/blob/main/workspace-server/src/utils/config.ts
- `workspace-server/src/auth/AuthManager.ts` generates the browser OAuth URL
  using that configured client ID and cloud function redirect:
  https://github.com/gemini-cli-extensions/workspace/blob/main/workspace-server/src/auth/AuthManager.ts
- `workspace-server/src/cli/headless-login.ts` generates the same style of
  OAuth URL for headless login:
  https://github.com/gemini-cli-extensions/workspace/blob/main/workspace-server/src/cli/headless-login.ts
- `workspace-server/src/auth/token-storage/oauth-credential-storage.ts` stores
  the resulting access token and refresh token under the
  `gemini-cli-workspace-oauth` keychain service:
  https://github.com/gemini-cli-extensions/workspace/blob/main/workspace-server/src/auth/token-storage/oauth-credential-storage.ts

Observed upstream defaults at the time this note was written:

```text
WORKSPACE_CLIENT_ID default:
338689075775-o75k922vn5fdl18qergr96rp8g63e4d7.apps.googleusercontent.com

WORKSPACE_CLOUD_FUNCTION_URL default:
https://google-workspace-extension.geminicli.com
```

Those values belong to the upstream flow. They are not credentials owned by
this repository.

## Example

If a user runs the upstream headless login flow, the generated Google OAuth URL
uses the upstream client ID and cloud function redirect. In simplified form:

```text
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id=338689075775-o75k922vn5fdl18qergr96rp8g63e4d7.apps.googleusercontent.com
  &redirect_uri=https%3A%2F%2Fgoogle-workspace-extension.geminicli.com
  &access_type=offline
  &prompt=consent
  &scope=...
```

Google will show the consent screen for the OAuth app registered to that
`client_id`. If that app is branded as Gemini CLI or the Google Workspace
extension, users will see that name during authorization.

After the refresh token exists, this MCP server only uses that credential to
call Google Drive APIs. It does not change the original OAuth app identity.

## Recommended Production Setup

For use outside Gemini CLI, create a dedicated Google Cloud OAuth client owned
by the deployer or organization using this MCP server.

Recommended practice:

- Use a dedicated Google Cloud project.
- Configure the OAuth consent screen with the real app name and support
  contact.
- Request only the required read-only Drive scopes.
- Store the resulting `authorized_user` JSON outside this repository.
- Do not reuse upstream Gemini CLI OAuth credentials unless the user clearly
  understands the consent screen and trust boundary.

This avoids confusing users with a consent screen branded for another tool and
keeps OAuth ownership, support, audit, and revocation under the correct party.
