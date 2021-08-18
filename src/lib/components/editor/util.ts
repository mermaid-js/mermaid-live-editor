/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initEditor = (monacoEditor): void => {
	monacoEditor.languages.register({ id: 'mermaid' });

	// Register a tokens provider for the mermaid language
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
			'journey',
			'info'
		],
		keywords: ['participant', 'as', 'showInfo', 'autonumber'],
		arrows: ['---', '===', '-->>', '-->', '==>', '->>', '->', '--)', '-)', '--x', '-x'].reduce(
			(accumalator, arrow) => accumalator.concat(arrow, arrow + '+', arrow + '-'),
			[]
		),
		tokenizer: {
			root: [
				[/[a-z_$][\w$]*/, { cases: { '@typeKeywords': 'keyword', '@keywords': 'keyword' } }],
				[/[[{(}>]+.+?[)\]}]+/, 'string'],
				[/[-+=>ox]+/, { cases: { '@arrows': 'transition' } }],
				[/[{}]/, 'delimiter.bracket'],
				[/".*"/, 'string'],
				[/#(\d|[a-zA-Z])*;/, 'html.entity']
			]
		},
		whitespace: [
			[/[ \t\r\n]+/, 'white'],
			[/%%.*$/, 'comment']
		]
	});

	monacoEditor.editor.defineTheme('mermaidTheme', {
		base: 'vs',
		inherit: false,
		rules: [
			{ token: 'keyword', foreground: '880000', fontStyle: 'bold' },
			{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
			{ token: 'string', foreground: 'AA8500' },
			{ token: 'transition', foreground: '008800', fontStyle: 'bold' },
			{ token: 'delimiter.bracket', foreground: '000000', fontStyle: 'bold' },
			{ token: 'html.entity', foreground: 'f5b436' }
		]
	});

	// Register a completion item provider for the mermaid language
	monacoEditor.languages.registerCompletionItemProvider('mermaid', {
		provideCompletionItems: () => {
			const suggestions = [
				{
					label: 'loop',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['loop ${1:Loop text}', '\t$0', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Sequence Diagram Loops'
				},
				{
					label: 'alt',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['alt ${1:Describing text}', '\t$0', 'else', '\t', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Alternative Path'
				},
				{
					label: 'opt',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['opt ${1:Describing text}', '\t$0', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Optional Path'
				},
				{
					label: 'par',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: [
						'par ${1:[Action 1]}',
						'\t$0',
						'and ${2:[Action 2]}',
						'\t',
						'and ${3:[Action 3]}',
						'\t',
						'end'
					].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Parallel Actions'
				},
				{
					label: 'rect',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['rect ${1:rgb(0, 255, 0)}', '\t$0', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Background Color'
				}
			];
			return { suggestions: suggestions };
		}
	});
};
