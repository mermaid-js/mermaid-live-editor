import type { EditorMode } from '$/types';
import { describeDiagram } from './diagramTypes';
import { env } from './env';

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

/** mermaid.ai serves OSS docs under /open-source; a bare mermaid.ai origin 401s those paths. */
const resolveDocsBase = (docsUrl: string): string => {
  const parsed = new URL(docsUrl);
  const isMermaidAi = parsed.hostname === 'mermaid.ai' || parsed.hostname.endsWith('.mermaid.ai');
  if (isMermaidAi && (parsed.pathname === '/' || parsed.pathname === '')) {
    return `${parsed.origin}/open-source`;
  }
  return stripTrailingSlashes(parsed.origin + parsed.pathname);
};

const joinDocsUrl = (base: string, path: string): string => {
  if (!path) {
    return base;
  }
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const getDiagramDocumentationUrl = (
  diagramType: string | undefined,
  editorMode: EditorMode,
  docsUrl = env.docsUrl
): string => {
  const base = resolveDocsBase(docsUrl);
  const docs = describeDiagram(diagramType)?.docs;
  if (!docs) {
    return base;
  }
  return joinDocsUrl(base, docs[editorMode] ?? docs.code);
};
