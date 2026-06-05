import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import 'dotenv/config';
import { z } from 'zod';
import { ApiClient } from './api';
import { buildPayload } from './serde';

// --- Config -----------------------------------------------------------------
// NOTE: stdout is the MCP protocol channel — never console.log here. All
// diagnostics go to stderr.

const configSchema = z.object({
  MLE_BASE_URL: z
    .string()
    .url()
    .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
      message: 'must be an http(s) URL'
    }),
  MCP_API_TOKEN: z.string().min(24)
});

const parsed = configSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid MCP configuration. Set MLE_BASE_URL and MCP_API_TOKEN.');
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

const baseUrl = parsed.data.MLE_BASE_URL.replace(/\/+$/, '');
const api = new ApiClient(baseUrl, parsed.data.MCP_API_TOKEN);
const editorUrl = (payload: string): string => `${baseUrl}/edit#${payload}`;

// --- Tool result helpers ----------------------------------------------------

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

const ok = (summary: string, data: unknown): ToolResult => ({
  content: [{ type: 'text', text: `${summary}\n\n${JSON.stringify(data, null, 2)}` }]
});

const fail = (err: unknown): ToolResult => ({
  content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }],
  isError: true
});

// --- Server -----------------------------------------------------------------

const server = new McpServer({ name: 'mermaid-live-editor', version: '0.1.0' });

server.registerTool(
  'save_diagram',
  {
    title: 'Save diagram',
    description:
      'Save a new Mermaid diagram to the editor. Pass raw Mermaid source as `code`; ' +
      'it is encoded into the editor payload automatically. Returns the new diagram ' +
      'id and a shareable editor URL.',
    inputSchema: {
      name: z.string().min(1).max(200).describe('Diagram name shown in the editor'),
      code: z.string().min(1).describe('Raw Mermaid diagram source'),
      folderId: z.string().optional().describe('Optional folder id (see list_folders)')
    }
  },
  async ({ name, code, folderId }): Promise<ToolResult> => {
    try {
      const payload = buildPayload(code);
      const diagram = await api.createDiagram(name, payload, folderId);
      return ok(`Saved "${diagram.name}". Open: ${editorUrl(payload)}`, diagram);
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'update_diagram',
  {
    title: 'Update diagram',
    description:
      'Update an existing diagram by id. Provide `code` to replace the diagram source ' +
      'and/or `name` to rename. At least one must be given.',
    inputSchema: {
      id: z.string().min(1).describe('Diagram id'),
      name: z.string().min(1).max(200).optional(),
      code: z.string().min(1).optional().describe('New raw Mermaid source')
    }
  },
  async ({ id, name, code }): Promise<ToolResult> => {
    try {
      if (name === undefined && code === undefined) {
        return fail(new Error('Provide `name` and/or `code` to update.'));
      }
      const payload = code !== undefined ? buildPayload(code) : undefined;
      const diagram = await api.updateDiagram(id, { name, payload });
      const suffix = payload ? `\nOpen: ${editorUrl(payload)}` : '';
      return ok(`Updated "${diagram.name}".${suffix}`, diagram);
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'list_diagrams',
  {
    title: 'List diagrams',
    description: 'List saved diagrams (metadata only), optionally filtered to a folder.',
    inputSchema: {
      folderId: z.string().optional().describe('Optional folder id to filter by')
    }
  },
  async ({ folderId }): Promise<ToolResult> => {
    try {
      const diagrams = await api.listDiagrams(folderId);
      return ok(`${diagrams.length} diagram(s).`, diagrams);
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'list_folders',
  {
    title: 'List folders',
    description: 'List all folders for the account (flat list with parentId for nesting).',
    inputSchema: {}
  },
  async (): Promise<ToolResult> => {
    try {
      const folders = await api.listFolders();
      return ok(`${folders.length} folder(s).`, folders);
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'create_folder',
  {
    title: 'Create folder',
    description: 'Create a folder to organise diagrams. Optionally nest under a parent folder.',
    inputSchema: {
      name: z.string().min(1).max(200),
      parentId: z.string().optional().describe('Optional parent folder id')
    }
  },
  async ({ name, parentId }): Promise<ToolResult> => {
    try {
      const folder = await api.createFolder(name, parentId);
      return ok(`Created folder "${folder.name}".`, folder);
    } catch (err) {
      return fail(err);
    }
  }
);

server.registerTool(
  'get_editor_url',
  {
    title: 'Get editor URL',
    description:
      'Encode Mermaid source into a shareable editor URL WITHOUT saving it. Useful for ' +
      'a quick preview link.',
    inputSchema: {
      code: z.string().min(1).describe('Raw Mermaid diagram source')
    }
  },
  async ({ code }): Promise<ToolResult> => {
    try {
      const url = editorUrl(buildPayload(code));
      return ok('Shareable editor URL (not saved):', { url });
    } catch (err) {
      return fail(err);
    }
  }
);

// --- Connect ----------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`mermaid-live-editor MCP server connected (base: ${baseUrl})`);
