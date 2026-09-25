import { describe, expect, it } from 'vitest';
import { initEditor } from './monacoExtra';

interface MonarchRule {
  cases?: Record<string, string>;
}
type MonarchAction = string | string[] | MonarchRule;
interface Grammar {
  tokenizer: Record<string, [RegExp | string, MonarchAction][]>;
}

const noop = () => undefined;

/** The Monarch grammar that {@link initEditor} registers for the `mermaid` language. */
const grammar = (): Grammar => {
  let definition: Grammar | undefined;
  const monacoStub = {
    editor: { defineTheme: noop },
    languages: {
      register: noop,
      registerCompletionItemProvider: noop,
      setLanguageConfiguration: noop,
      setMonarchTokensProvider: (_id: string, def: Grammar) => {
        definition = def;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
  initEditor(monacoStub);
  if (!definition) {
    throw new Error('initEditor did not register a tokens provider');
  }
  return definition;
};

/**
 * Applies the rules of `state` to `text` the way Monarch does — first rule that matches at the
 * start wins — and returns the matched text plus the token (or the `cases` map for keyword rules).
 */
const firstMatch = (state: string, text: string) => {
  for (const [pattern, action] of grammar().tokenizer[state]) {
    if (!(pattern instanceof RegExp)) {
      continue;
    }
    const match = new RegExp(`^(?:${pattern.source})`, pattern.flags).exec(text);
    if (match) {
      return { action, matched: match[0] };
    }
  }
  return undefined;
};

describe('mermaid Monarch grammar', () => {
  // Monarch compiles its rules without the `u` flag, so `[A-Za-z][\w$]*` stopped at the first
  // accented character and the rest of the identifier fell through to a later rule, picking up a
  // different colour (#1657).
  it.each([
    ['flowchart', 'kávéház9ök'],
    ['flowchart', 'ergeűáúassdf9ök'],
    ['stateDiagram', 'Prüfung'],
    ['classDiagram', 'Größe'],
    ['sequenceDiagram', 'Παράδειγμα'],
    ['journey', 'Ünnep'],
    ['c4Diagram', 'Système'],
    ['requirementDiagram', 'Anforderung_1']
  ])('%s: consumes the whole accented identifier %s', (state, identifier) => {
    expect(firstMatch(state, identifier)?.matched).toBe(identifier);
  });

  it('consumes an accented identifier up to, but not past, a separator', () => {
    expect(firstMatch('flowchart', 'kávéház --> B')?.matched).toBe('kávéház');
  });

  it('keeps classifying ASCII keywords through the same rule', () => {
    const match = firstMatch('flowchart', 'subgraph');

    expect(match?.matched).toBe('subgraph');
    expect((match?.action as MonarchRule).cases).toHaveProperty('@flowchartBlockKeywords');
  });

  it.each([
    ['flowchart', 'nodeId1'],
    ['erDiagram', 'CUSTOMER'],
    ['sankey', 'Electricity']
  ])('%s: leaves the ASCII identifier %s tokenized as before', (state, identifier) => {
    expect(firstMatch(state, identifier)?.matched).toBe(identifier);
  });

  it('does not let an identifier swallow a following ASCII separator', () => {
    expect(firstMatch('flowchart', 'A[Start]')?.matched).toBe('A');
  });
});
