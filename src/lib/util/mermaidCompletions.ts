import {
  declarations,
  detectDiagramType,
  getDiagramData,
  type DiagramDeclaration,
  type DiagramLanguageData,
  type SyntaxIdentifier,
  type SyntaxSnippet,
  type SyntaxToken
} from '@mermaid-js/syntax-metadata';

export type SuggestionKind = 'diagram' | 'identifier' | 'keyword' | 'operator' | 'snippet';

export interface CompletionSuggestion {
  detail: string;
  documentation?: string;
  insertText: string;
  kind: SuggestionKind;
  label: string;
  snippet: boolean;
  sortText: string;
}

export interface MermaidCompletionResult {
  from: number;
  suggestions: CompletionSuggestion[];
  to: number;
}

// A trailing token is either a word (identifiers, partial keywords) or a run of
// operator characters (arrows, links) so that completing `A--` replaces `--`.
const TRAILING_TOKEN = /(?:[\w\-.]+|[-.=<>~|ox*]{2,})$/;
const TRAILING_OPERATOR = /[-.=<>~|][-.=<>~|ox]*$/;
const LEADING_WORD = /^[\w\-.]*/;

const getReplaceRange = (text: string, offset: number): { from: number; to: number } => {
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
  const match = TRAILING_TOKEN.exec(text.slice(lineStart, offset));
  const to = offset + (LEADING_WORD.exec(text.slice(offset))?.[0].length ?? 0);
  if (!match) {
    return { from: offset, to };
  }
  const operator = TRAILING_OPERATOR.exec(match[0]);
  return { from: offset - (operator?.[0].length ?? match[0].length), to };
};

const count = (value: string, character: string): number => value.split(character).length - 1;

const isUnclosed = (linePrefix: string, open: string, close: string): boolean =>
  count(linePrefix, open) > count(linePrefix, close);

// Keywords after which the rest of the line is free text.
const SILENT_LINE_START =
  /^[\t ]*(?:accDescr|accTitle|axisFormat|dateFormat|excludes|section|title|tickInterval|todayMarker)\s/;

const isSuppressed = (
  text: string,
  offset: number,
  diagram: DiagramLanguageData | undefined
): boolean => {
  // Inside a (possibly multi-line) %%{ init: ... }%% directive.
  if (text.lastIndexOf('%%{', offset) > text.lastIndexOf('}%%', offset)) {
    return true;
  }
  const lineStart = text.lastIndexOf('\n', offset - 1) + 1;
  const linePrefix = text.slice(lineStart, offset);
  if (linePrefix.trimStart().startsWith('%%')) {
    return true;
  }
  // Inside a quoted string or a node/edge label.
  if (count(linePrefix, '"') % 2 === 1) {
    return true;
  }
  if (isUnclosed(linePrefix, '[', ']') || isUnclosed(linePrefix, '(', ')')) {
    return true;
  }
  if (diagram?.id === 'flowchart') {
    // Flowchart braces are node shapes and pipes delimit edge labels.
    if (isUnclosed(linePrefix, '{', '}') || count(linePrefix, '|') % 2 === 1) {
      return true;
    }
  }
  if (SILENT_LINE_START.test(linePrefix)) {
    return true;
  }
  return Boolean(diagram?.suppressAfterColon && linePrefix.includes(':'));
};

const documentationFor = (
  data: DiagramLanguageData,
  documentation?: string
): string | undefined => {
  const docs = data.docsUrl ? `[Syntax reference](${data.docsUrl})` : undefined;
  if (documentation && docs) {
    return `${documentation}\n\n${docs}`;
  }
  return documentation ?? docs;
};

const fromToken = (data: DiagramLanguageData, token: SyntaxToken): CompletionSuggestion => {
  const kind = token.kind === 'operator' ? 'operator' : 'keyword';
  return {
    detail: kind,
    documentation: documentationFor(data),
    insertText: token.text,
    kind,
    label: token.text,
    snippet: false,
    sortText: `${kind === 'operator' ? '2' : '3'}${token.text.toLowerCase()}`
  };
};

const fromSnippet = (data: DiagramLanguageData, spec: SyntaxSnippet): CompletionSuggestion => ({
  detail: 'snippet',
  documentation: documentationFor(data, spec.documentation),
  insertText: spec.insertText,
  kind: 'snippet',
  label: spec.label,
  snippet: true,
  sortText: `1${spec.label.toLowerCase()}`
});

const fromIdentifier = (spec: SyntaxIdentifier): CompletionSuggestion => ({
  detail: spec.detail ?? 'identifier',
  insertText: spec.name,
  kind: 'identifier',
  label: spec.name,
  snippet: false,
  sortText: `0${spec.name.toLowerCase()}`
});

const fromDeclaration = (spec: DiagramDeclaration): CompletionSuggestion => ({
  detail: 'diagram',
  documentation: spec.documentation,
  insertText: spec.insertText,
  kind: 'diagram',
  label: spec.label,
  snippet: true,
  sortText: `0${spec.label.toLowerCase()}`
});

const buildSuggestions = (data: DiagramLanguageData, text: string): CompletionSuggestion[] => {
  const tokens = data.tokens.filter((token) => token.kind !== 'punctuation');
  const reserved = new Set(tokens.map((token) => token.text));
  const identifiers = (data.extractIdentifiers?.(text) ?? [])
    .filter((spec) => !reserved.has(spec.name))
    .map((spec) => fromIdentifier(spec));
  const snippets = data.snippets.map((spec) => fromSnippet(data, spec));
  const keywords = tokens.map((spec) => fromToken(data, spec));
  return [...identifiers, ...snippets, ...keywords];
};

const dedupe = (suggestions: readonly CompletionSuggestion[]): CompletionSuggestion[] => {
  const seen = new Set<string>();
  const unique: CompletionSuggestion[] = [];
  for (const suggestion of suggestions) {
    if (!seen.has(suggestion.label)) {
      seen.add(suggestion.label);
      unique.push(suggestion);
    }
  }
  return unique;
};

/** Completions for the mermaid code at `offset`. */
export const getCompletions = (text: string, offset: number): MermaidCompletionResult => {
  const { from, to } = getReplaceRange(text, offset);
  const diagram = getDiagramData(detectDiagramType(text));
  if (isSuppressed(text, offset, diagram)) {
    return { from, suggestions: [], to };
  }
  const suggestions = diagram
    ? buildSuggestions(diagram, text)
    : declarations.map((spec) => fromDeclaration(spec));
  return { from, suggestions: dedupe(suggestions), to };
};

/** Plain-text version of a Monaco snippet, for editors without snippet support. */
export const snippetToPlainText = (insertText: string): string =>
  insertText
    .replaceAll(/\$\{\d+\|([^}]*)\|\}/g, (_match, choices: string) => choices.split(',')[0])
    .replaceAll(/\$\{\d+:([^}]*)\}/g, '$1')
    .replaceAll(/\$\{\d+\}/g, '')
    .replaceAll(/\$\d+/g, '');
