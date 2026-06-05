// Thin REST client for the Mermaid Live Editor backend. Authenticates with the
// static MCP token via `Authorization: Bearer`. See server/src/auth/middleware.ts.

export interface DiagramMeta {
  id: string;
  name: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string
  ) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}/api${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {})
      },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    if (!res.ok) {
      let detail = '';
      try {
        const json = (await res.json()) as { error?: string; details?: unknown };
        detail = json.error ?? JSON.stringify(json);
      } catch {
        detail = (await res.text().catch(() => '')) || res.statusText;
      }
      throw new Error(`${method} ${path} failed (${res.status}): ${detail}`);
    }

    if (res.status === 204) {
      return undefined as T;
    }
    return (await res.json()) as T;
  }

  listFolders(): Promise<Folder[]> {
    return this.request('GET', '/folders');
  }

  createFolder(name: string, parentId?: string | null): Promise<Folder> {
    return this.request('POST', '/folders', { name, parentId: parentId ?? null });
  }

  listDiagrams(folderId?: string): Promise<DiagramMeta[]> {
    const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
    return this.request('GET', `/diagrams${query}`);
  }

  createDiagram(name: string, payload: string, folderId?: string | null): Promise<DiagramMeta> {
    return this.request('POST', '/diagrams', { name, payload, folderId: folderId ?? null });
  }

  updateDiagram(
    id: string,
    fields: { name?: string; payload?: string; folderId?: string | null }
  ): Promise<DiagramMeta> {
    return this.request('PATCH', `/diagrams/${encodeURIComponent(id)}`, fields);
  }
}
