// (1) Desired editor features:
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

monaco.languages.register({ id: 'mermaid' });

// Register a tokens provider for the language
monaco.languages.setMonarchTokensProvider('mermaid', {
  tokenizer: {
    root: [
      [/\[graph.*/, 'custom-error'],
      [/\[notice.*/, 'custom-notice'],
      [/\[info.*/, 'custom-info'],
      [/\[[a-zA-Z 0-9:]+\]/, 'custom-date'],
    ],
  },
});

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    return './editor.worker.bundle.js';
  },
};

// Define a new theme that contains only rules that match this language
monaco.editor.defineTheme('myCoolTheme', {
  base: 'vs',
  inherit: false,
  rules: [
    { token: 'custom-info', foreground: '808080' },
    { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
    { token: 'custom-notice', foreground: 'FFA500' },
    { token: 'custom-date', foreground: '008800' },
  ],
});

// Register a completion item provider for the new language
monaco.languages.registerCompletionItemProvider('mySpecialLanguage', {
  provideCompletionItems: () => {
    var suggestions = [
      {
        label: 'simpleText',
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: 'simpleText',
      },
      {
        label: 'testing',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'testing(${1:condition})',
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: 'ifelse',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: [
          'if (${1:condition}) {',
          '\t$0',
          '} else {',
          '\t',
          '}',
        ].join('\n'),
        insertTextRules:
          monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'If-Else Statement',
      },
    ];
    return { suggestions: suggestions };
  },
});

const edit = monaco.editor.create(document.getElementById('editor'), {
  value: [code].join('\n'),
  theme: 'myCoolTheme',
  language: 'mermaid',
});
edit.onDidChangeModelContent(function (e) {
  codeStore.set(edit.getValue());
});
