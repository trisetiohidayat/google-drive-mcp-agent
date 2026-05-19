#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { OAuth2Client } from "google-auth-library";
import { google, drive_v3 } from "googleapis";
import { z } from "zod";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

type AuthorizedUserCredentials = {
  type?: string;
  client_id?: string;
  client_secret?: string;
  refresh_token?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function loadAuthorizedUserCredentials(): Promise<AuthorizedUserCredentials> {
  const credentialsPath = process.env.GOOGLE_OAUTH_CREDENTIALS;
  if (credentialsPath) {
    const raw = await readFile(credentialsPath, "utf8");
    return JSON.parse(raw) as AuthorizedUserCredentials;
  }

  return {
    type: "authorized_user",
    client_id: requireEnv("GOOGLE_CLIENT_ID"),
    client_secret: requireEnv("GOOGLE_CLIENT_SECRET"),
    refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN"),
  };
}

async function createDriveClient(): Promise<drive_v3.Drive> {
  const credentials = await loadAuthorizedUserCredentials();
  if (!credentials.client_id || !credentials.client_secret || !credentials.refresh_token) {
    throw new Error(
      "OAuth credentials must include client_id, client_secret, and refresh_token."
    );
  }

  const auth = new OAuth2Client(credentials.client_id, credentials.client_secret);
  auth.setCredentials({ refresh_token: credentials.refresh_token });
  return google.drive({ version: "v3", auth });
}

function asPageSize(value: number | undefined): number {
  return Math.min(Math.max(value ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
}

function escapeQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function searchTermToDriveQuery(query: string, includeTrashed: boolean): string {
  const trimmed = query.trim();
  const looksLikeDriveQuery =
    /\b(name|mimeType|modifiedTime|createdTime|fullText|parents|trashed|sharedWithMe|starred|owners|writers|readers)\b/.test(
      trimmed
    );
  const driveQuery = looksLikeDriveQuery
    ? trimmed
    : `name contains '${escapeQueryValue(trimmed)}'`;

  if (includeTrashed || /\btrashed\b/.test(driveQuery)) {
    return driveQuery;
  }
  return `(${driveQuery}) and trashed = false`;
}

function toFileSummary(file: drive_v3.Schema$File) {
  return {
    id: file.id,
    name: file.name,
    mimeType: file.mimeType,
    parents: file.parents,
    webViewLink: file.webViewLink,
    modifiedTime: file.modifiedTime,
    size: file.size,
  };
}

async function main() {
  const drive = await createDriveClient();
  const server = new McpServer({
    name: "google-drive-mcp-agent",
    version: "0.1.0",
  });

  server.tool(
    "drive_search",
    "Search Google Drive files. Accepts a simple term or a Google Drive v3 query string.",
    {
      query: z.string().min(1),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
      pageToken: z.string().optional(),
      includeTrashed: z.boolean().optional(),
      corpus: z.enum(["user", "domain", "allDrives"]).optional(),
      includeSharedDrives: z.boolean().optional(),
    },
    async (input) => {
      const response = await drive.files.list({
        q: searchTermToDriveQuery(input.query, input.includeTrashed ?? false),
        pageSize: asPageSize(input.pageSize),
        pageToken: input.pageToken,
        corpora: input.corpus ?? "user",
        includeItemsFromAllDrives: input.includeSharedDrives ?? true,
        supportsAllDrives: true,
        fields:
          "nextPageToken, files(id,name,mimeType,parents,webViewLink,modifiedTime,size)",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                files: (response.data.files ?? []).map(toFileSummary),
                nextPageToken: response.data.nextPageToken,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "drive_list_folder",
    "List direct children of a Google Drive folder.",
    {
      folderId: z.string().min(1),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
      pageToken: z.string().optional(),
    },
    async (input) => {
      const response = await drive.files.list({
        q: `'${escapeQueryValue(input.folderId)}' in parents and trashed = false`,
        pageSize: asPageSize(input.pageSize),
        pageToken: input.pageToken,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        fields:
          "nextPageToken, files(id,name,mimeType,parents,webViewLink,modifiedTime,size)",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                files: (response.data.files ?? []).map(toFileSummary),
                nextPageToken: response.data.nextPageToken,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "drive_get_metadata",
    "Get metadata for one Google Drive file.",
    {
      fileId: z.string().min(1),
    },
    async (input) => {
      const response = await drive.files.get({
        fileId: input.fileId,
        supportsAllDrives: true,
        fields:
          "id,name,mimeType,parents,webViewLink,webContentLink,modifiedTime,createdTime,size,owners(displayName,emailAddress),lastModifyingUser(displayName,emailAddress)",
      });

      return {
        content: [{ type: "text", text: JSON.stringify(response.data, null, 2) }],
      };
    }
  );

  server.tool(
    "drive_get_comments",
    "Read comments on a Google Drive file.",
    {
      fileId: z.string().min(1),
      pageSize: z.number().int().min(1).max(MAX_PAGE_SIZE).optional(),
      pageToken: z.string().optional(),
    },
    async (input) => {
      const response = await drive.comments.list({
        fileId: input.fileId,
        pageSize: asPageSize(input.pageSize),
        pageToken: input.pageToken,
        fields:
          "nextPageToken, comments(id,content,createdTime,modifiedTime,author(displayName,emailAddress),resolved,replies(id,content,createdTime,modifiedTime,author(displayName,emailAddress)))",
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                comments: response.data.comments ?? [],
                nextPageToken: response.data.nextPageToken,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  await server.connect(new StdioServerTransport());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
