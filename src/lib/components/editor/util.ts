/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initEditor = (monacoEditor): void => {
	monacoEditor.languages.register({ id: 'mermaid' });

	const orientations = ['TB', 'TD', 'BT', 'RL', 'LR'];
	const typeKeywords = [
		'flowchart',
		'graph',
		'stateDiagram-v2',
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
	];
	const blockKeywords = [
		'subgraph',
		'rect',
		'opt',
		'class',
		'alt',
		'par',
		'and',
		'loop',
		'else',
		'end',
		'state',
		'section'
	];
	const keywords = [
		'participant',
		'as',
		'showInfo',
		'autonumber',
		'rgba',
		'rgb',
		'hsla',
		'hsl',
		'linkStyle',
		'style',
		'classDef',
		'direction',
		'activate',
		'deactivate',
		'cssClass',
		'link',
		'callback',
		'click',
		'class',
		'href',
		'call',
		'state',
		'note',
		'Note',
		'title',
		'excludes',
		'dateFormat',
		'axisFormat',
		'todayMarker',
		'showData',
		'options',
		'commit',
		'branch',
		'merge',
		'reset',
		'checkout'
	];

	// Register a tokens provider for the mermaid language
	monacoEditor.languages.setMonarchTokensProvider('mermaid', {
		typeKeywords,
		blockKeywords,
		keywords,
		orientation: orientations,
		noEatingSequenceArrows: ['-)', '--)', '->>', '-->>'].reduce(
			(accumalator, arrow) => accumalator.concat(arrow, arrow + '+', arrow + '-'),
			[]
		),
		eatingSequenceArrows: ['->', '-x'].reduce(
			(accumalator, arrow) => accumalator.concat(arrow, arrow + '+', arrow + '-'),
			[]
		),
		tokenizer: {
			root: [
				[/-{1,2}\)|-{1,2}>>/, { cases: { '@noEatingSequenceArrows': 'transition' } }],
				[/\*--\*?|--\*/, 'transition'],
				[/(<\|?)(\.{2}|-{2})(\|?>)?|(\.{2}|-{2})(\|?>)/, 'transition'],
				[/(\|o|\|\||}o|}\|)(-{2}|\.{2})(o\||\|\||o\{|\|\{)/, 'transition'],
				[/[ox<]?(-{2,}|-+\.+-+|={2,})[ox>]?/, 'transition'],
				[/[-+>]+/, { cases: { '@eatingSequenceArrows': 'transition' } }],
				[':::', 'transition'],
				[
					/[a-z_$][\w$]*((?<=stateDiagram)-v2)?/,
					{
						cases: {
							'@typeKeywords': 'typeKeyword',
							'@blockKeywords': 'typeKeyword',
							'@keywords': 'keyword'
						}
					}
				],
				[/[A-Z$][\w$]*/, { cases: { '@orientation': 'keyword' } }],
				[/\[\[(fork|join|choice)\]\]/, 'annotation'],
				[/[[{(}>|]+.+?[)\]}|]+/, 'string'],
				[/[{}&]/, 'delimiter.bracket'],
				[/".*"/, 'string'],
				[/#(\d|[a-zA-Z])*;/, 'html.entity/hex-color-code'],
				[/#(?:[0-9a-fA-F]{3}){1,2}/, 'html.entity/hex-color-code'],
				[/<<.+>>/, 'annotation'],
				[/%%.*(?<!%%)$/, 'comment']
			]
		},
		whitespace: [[/[ \t\r\n]+/, 'white']]
	});

	monacoEditor.editor.defineTheme('mermaidTheme', {
		base: 'vs',
		inherit: false,
		rules: [
			{ token: 'typeKeyword', foreground: '9650c8', fontStyle: 'bold' },
			{ token: 'keyword', foreground: '649696' },
			{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
			{ token: 'string', foreground: 'AA8500' },
			{ token: 'transition', foreground: '008800', fontStyle: 'bold' },
			{ token: 'delimiter.bracket', foreground: '000000', fontStyle: 'bold' },
			{ token: 'html.entity/hex-color-code', foreground: 'f5b436' },
			{ token: 'annotation', foreground: '4b4b96' },
			{ token: 'comment', foreground: '888c89' }
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
				},
				{
					label: 'class',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['class ${1:className} {', '\t$0', '}'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Class'
				},
				{
					label: 'state',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['state ${1:stateName} {', '\t$0', '}'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'State'
				},
				{
					label: 'note',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['note ${1:right of State1}', '\t$0', 'end note'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'State'
				},
				{
					label: 'section',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['section ${1:Go to work}', '\t$0'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'User-journey Section'
				},
				...[...new Set([...orientations, ...typeKeywords, ...blockKeywords, ...keywords])].map(
					(keyword) => ({
						label: keyword,
						kind: monacoEditor.languages.CompletionItemKind.Keyword,
						insertText: keyword
					})
				)
			];
			return { suggestions: suggestions };
		}
	});

	monacoEditor.languages.setLanguageConfiguration('mermaid', {
		autoClosingPairs: [
			{
				open: '(',
				close: ')'
			},
			{
				open: '{',
				close: '}'
			},
			{
				open: '[',
				close: ']'
			}
		],
		brackets: [
			['(', ')'],
			['{', '}'],
			['[', ']']
		]
	});
};
