/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initEditor = (monacoEditor): void => {
	monacoEditor.languages.register({ id: 'mermaid' });

	// Register a tokens provider for the language
	monacoEditor.languages.setMonarchTokensProvider('mermaid', {
		typeKeywords: [
			'graph',
			'stateDiagram',
			'sequenceDiagram',
			'classDiagram',
			'pie',
			'erDiagram',
			'flowchart',
			'gantt',
			'gitGraph',
			'journey'
		],
		keywords: ['participant', 'as'],
		arrows: ['---', '===', '-->', '==>', '->>', '->'],
		tokenizer: {
			root: [
				[/[{}]/, 'delimiter.bracket'],
				[/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword', '@keywords': 'keyword' } }],
				[/[-=>ox]+/, { cases: { '@arrows': 'transition' } }],
				[/[[{(}]+.+?[)\]}]+/, 'string'],
				[/".*"/, 'string']
			]
		},
		whitespace: [
			[/[ \t\r\n]+/, 'white'],
			[/%%.*$/, 'comment']
		]
	});

	monacoEditor.editor.defineTheme('myCoolTheme', {
		base: 'vs',
		inherit: false,
		rules: [
			{ token: 'keyword', foreground: '880000', fontStyle: 'bold' },
			{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
			{ token: 'string', foreground: 'AA8500' },
			{ token: 'transition', foreground: '008800', fontStyle: 'bold' },
			{ token: 'delimiter.bracket', foreground: '000000', fontStyle: 'bold' }
		]
	});

	// Register a completion item provider for the new language
	monacoEditor.languages.registerCompletionItemProvider('mermaid', {
		provideCompletionItems: () => {
			const suggestions = [
				{
					label: 'simpleText',
					kind: monacoEditor.languages.CompletionItemKind.Text,
					insertText: 'simpleText'
				},
				{
					label: 'testing',
					kind: monacoEditor.languages.CompletionItemKind.Keyword,
					insertText: 'testing(${1:condition})',
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet
				},
				{
					label: 'ifelse',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['if (${1:condition}) {', '\t$0', '} else {', '\t', '}'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'If-Else Statement'
				}
			];
			return { suggestions: suggestions };
		}
	});
};
