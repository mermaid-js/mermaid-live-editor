export const initEditor = monaco => {
  monaco.languages.register({ id: 'mermaid' });

  // Register a tokens provider for the language
  monaco.languages.setMonarchTokensProvider('mermaid', {
    typeKeywords: [
      'graph', 'stateDiagram', 'sequenceDiagram', 'classDiagram', 'pie', 'flowchart', 'gantt'
    ],
    keywords: [
    'patricipant','as'
    ],
    arrows: [
      '---', '===', '-->', '==>'
    ],

    tokenizer: {
      root: [
        [/[{}]/, 'delimiter.bracket'],
        [/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword',
                                '@keywords': 'keyword'} }],
        [/[-=>ox]+/, { cases: { '@arrows': 'transition'} }],
        [/[\[\{\(}]+.+?[\)\]\}]+/, "string"],
        [/\".*\"/, "string"],
      ]
    },
    whitespace: [
        [/[ \t\r\n]+/, 'white'],
        [/\%\%.*$/,    'comment'],
      ],
  });

  monaco.editor.defineTheme('myCoolTheme', {
    base: 'vs',
    inherit: false,
    rules: [
      { token: 'keyword', foreground: '880000', fontStyle: 'bold' },
      { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
      { token: 'string', foreground: 'AA8500' },
      { token: 'transition', foreground: '008800', fontStyle: 'bold'},
      { token: 'delimiter.bracket', foreground: '000000', fontStyle: 'bold'},
    ]
  });

  // Register a completion item provider for the new language
  monaco.languages.registerCompletionItemProvider('mermaid', {
    provideCompletionItems: () => {
      var suggestions = [{
        label: 'simpleText',
        kind: monaco.languages.CompletionItemKind.Text,
        insertText: 'simpleText'
      }, {
        label: 'testing',
        kind: monaco.languages.CompletionItemKind.Keyword,
        insertText: 'testing(${1:condition})',
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      }, {
        label: 'ifelse',
        kind: monaco.languages.CompletionItemKind.Snippet,
        insertText: [
          'if (${1:condition}) {',
          '\t$0',
          '} else {',
          '\t',
          '}'
        ].join('\n'),
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        documentation: 'If-Else Statement'
      }];
      return { suggestions: suggestions };
    }
  });
};