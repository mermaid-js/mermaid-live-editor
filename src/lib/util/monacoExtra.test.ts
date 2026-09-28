import type * as Monaco from 'monaco-editor';
import { describe, expect, it } from 'vitest';
import { initEditor } from './monacoExtra';

type Rule = [RegExp | string, unknown, ...unknown[]] | Record<string, unknown>;
interface MonarchLanguage {
  [key: string]: unknown;
  tokenizer: Record<string, Rule[]>;
}

/** Captures the Monarch language that `initEditor` registers for `mermaid`. */
const getMonarchLanguage = (): MonarchLanguage => {
  let language: MonarchLanguage | undefined;
  const noop = () => undefined;
  const monacoStub = {
    editor: { defineTheme: noop },
    languages: {
      register: noop,
      registerCompletionItemProvider: noop,
      setLanguageConfiguration: noop,
      setMonarchTokensProvider: (_id: string, definition: MonarchLanguage) => {
        language = definition;
      }
    }
  } as unknown as typeof Monaco;
  initEditor(monacoStub);
  if (!language) {
    throw new Error('initEditor did not register a Monarch tokens provider');
  }
  return language;
};

/** Returns the first rule of `state` matching at the start of `line`, as Monarch does. */
const firstMatchingRule = (language: MonarchLanguage, state: string, line: string) => {
  for (const rule of language.tokenizer[state]) {
    if (!Array.isArray(rule) || !(rule[0] instanceof RegExp)) {
      continue;
    }
    const [pattern, action] = rule;
    const match = new RegExp(`^(?:${pattern.source})`, pattern.flags).exec(line);
    if (match) {
      return { action, match };
    }
  }
  return undefined;
};

describe('mermaid Monarch language', () => {
  const language = getMonarchLanguage();

  it.each(['checkout', 'switch'])('gitGraph: highlights `%s <branch>`', (command) => {
    const result = firstMatchingRule(language, 'gitGraph', `  ${command} develop`);
    expect(result?.match.slice(1)).toEqual(['  ', command, ' develop']);
    expect(result?.action).toEqual(['delimiter.bracket', 'keyword', 'variable']);
  });

  it('gitGraph: treats `switch` as a keyword', () => {
    expect(language.gitGraphKeywords).toContain('switch');
  });
});
