/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const initEditor = (monacoEditor): void => {
	monacoEditor.languages.register({ id: 'mermaid' });

	const requirementDiagrams = [
		'requirement',
		'functionalRequirement',
		'interfaceRequirement',
		'performanceRequirement',
		'physicalRequirement',
		'designConstraint'
	];

	const keywords: {
		[key: string]: {
			typeKeywords: string[];
			blockKeywords: string[];
			keywords: string[];
		};
	} = {
		flowchart: {
			typeKeywords: ['flowchart', 'flowchart-v2', 'graph'],
			blockKeywords: ['subgraph', 'end'],
			keywords: [
				'TB',
				'TD',
				'BT',
				'RL',
				'LR',
				'click',
				'call',
				'href',
				'_self',
				'_blank',
				'_parent',
				'_top',
				'linkStyle',
				'style',
				'classDef',
				'class',
				'direction',
				'interpolate'
			]
		},
		sequenceDiagram: {
			typeKeywords: ['sequenceDiagram'],
			blockKeywords: ['alt', 'par', 'and', 'loop', 'else', 'end', 'rect', 'opt', 'alt', 'rect'],
			keywords: [
				'participant',
				'as',
				'Note',
				'note',
				'right of',
				'left of',
				'over',
				'activate',
				'deactivate',
				'autonumber',
				'title',
				'actor'
			]
		},
		classDiagram: {
			typeKeywords: ['classDiagram', 'classDiagram-v2'],
			blockKeywords: ['class'],
			keywords: [
				'link',
				'click',
				'callback',
				'call',
				'href',
				'cssClass',
				'direction',
				'TB',
				'BT',
				'RL',
				'LR'
			]
		},
		stateDiagram: {
			typeKeywords: ['stateDiagram', 'stateDiagram-v2'],
			blockKeywords: ['state', 'note', 'end'],
			keywords: ['state', 'as', 'hide empty description', 'direction', 'TB', 'BT', 'RL', 'LR']
		},
		erDiagram: {
			typeKeywords: ['erDiagram'],
			blockKeywords: [],
			keywords: []
		},
		journey: {
			typeKeywords: ['journey'],
			blockKeywords: ['section'],
			keywords: ['title']
		},
		info: {
			typeKeywords: ['info'],
			blockKeywords: [],
			keywords: ['showInfo']
		},
		gantt: {
			typeKeywords: ['gantt'],
			blockKeywords: [],
			keywords: [
				'title',
				'dateFormat',
				'axisFormat',
				'todayMarker',
				'section',
				'excludes',
				'inclusiveEndDates'
			]
		},
		requirementDiagram: {
			typeKeywords: ['requirement', 'requirementDiagram'],
			blockKeywords: requirementDiagrams.concat('element'),
			keywords: []
		},
		gitGraph: {
			typeKeywords: ['gitGraph'],
			blockKeywords: [],
			keywords: ['commit', 'branch', 'merge', 'reset', 'checkout', 'LR', 'BT']
		},
		pie: {
			typeKeywords: ['pie'],
			blockKeywords: [],
			keywords: ['title', 'showData']
		}
	};

	// Register a tokens provider for the mermaid language
	monacoEditor.languages.setMonarchTokensProvider('mermaid', {
		...Object.entries(keywords)
			.map((entry) =>
				Object.fromEntries(
					Object.entries(entry[1]).map((deepEntry) => [
						entry[0] + deepEntry[0][0].toUpperCase() + deepEntry[0].slice(1),
						deepEntry[1]
					])
				)
			)
			.reduce((overallKeywords, nextKeyword) => ({ ...overallKeywords, ...nextKeyword }), {}),
		tokenizer: {
			root: [
				[/%%(?=.*%%$)/, { token: 'string', nextEmbedded: 'json' }],
				[/%%$/, { token: 'string', nextEmbedded: '@pop' }],
				[/^\s*gitGraph/m, 'typeKeyword', 'gitGraph'],
				[/^\s*info/m, 'typeKeyword', 'info'],
				[/^\s*pie/m, 'typeKeyword', 'pie'],
				[/^\s*(flowchart|flowchart-v2|graph)/m, 'typeKeyword', 'flowchart'],
				[/^\s*sequenceDiagram/, 'typeKeyword', 'sequenceDiagram'],
				[/^\s*classDiagram(-v2)?/, 'typeKeyword', 'classDiagram'],
				[/^\s*journey/, 'typeKeyword', 'journey'],
				[/^\s*gantt/, 'typeKeyword', 'gantt'],
				[/^\s*stateDiagram(-v2)?/, 'typeKeyword', 'stateDiagram'],
				[/^\s*erDiagram/, 'typeKeyword', 'erDiagram'],
				[/^\s*requirement(Diagram)?/, 'typeKeyword', 'requirementDiagram'],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
			],
			gitGraph: [
				[/option(?=s)/, { token: 'typeKeyword', next: 'optionsGitGraph' }],
				[/(^\s*branch|reset|merge|checkout)(.*$)/, ['keyword', 'variable']],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@gitGraphBlockKeywords': 'typeKeyword',
							'@gitGraphKeywords': 'keyword'
						}
					}
				],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/".*?"/, 'string'],
				[/\^/, 'delimiter.bracket']
			],
			optionsGitGraph: [
				[/s$/, { token: 'typeKeyword', nextEmbedded: 'json', matchOnlyAtLineStart: false }],
				['end', { token: 'typeKeyword', next: '@pop', nextEmbedded: '@pop' }]
			],
			info: [
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@infoBlockKeywords': 'typeKeyword',
							'@infoKeywords': 'keyword'
						}
					}
				]
			],
			pie: [
				[/(title)(.*$)/, ['keyword', 'string']],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@pieBlockKeywords': 'typeKeyword',
							'@pieKeywords': 'keyword'
						}
					}
				],
				[/".*?"/, 'string'],
				[/\s*\d+/, 'number'],
				[/:/, 'delimiter.bracket'],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
			],
			flowchart: [
				[/[ox]?(--+|==+)[ox]/, 'transition'],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@flowchartBlockKeywords': 'typeKeyword',
							'@flowchartKeywords': 'keyword',
							'@default': 'variable'
						}
					}
				],
				[/\|+.+?\|+/, 'string'],
				[/\[+(\\.+?[\\/]|\/.+?[/\\])\]+/, 'string'],
				[/[[>]+[^\]|[]+?\]+/, 'string'],
				[/{+.+?}+/, 'string'],
				[/\(+.+?\)+/, 'string'],
				[/-\.+->?/, 'transition'],
				[/(-[-.])([^->]+?)(-{3,}|-{2,}>|\.-+>)/, ['transition', 'string', 'transition']],
				[/(==+)([^=]+?)(={3,}|={2,}>)/, ['transition', 'string', 'transition']],
				[/<?(--+|==+)>|===+|---+/, 'transition'],
				[/:::/, 'transition'],
				[/[;&]/, 'delimiter.bracket'],
				[/".*?"/, 'string'],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
			],
			sequenceDiagram: [
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@sequenceDiagramBlockKeywords': 'typeKeyword',
							'@sequenceDiagramKeywords': 'keyword',
							'@default': 'variable'
						}
					}
				],
				[/(--?>?>|--?[)x])[+-]?/, 'transition'],
				[/(:)([^:\n]*?$)/, ['delimiter.bracket', 'string']],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
			],
			classDiagram: [
				[/(?!class\s)([a-zA-Z]+)(\s+[a-zA-Z]+)/, ['type', 'variable']],
				[/(\*|<\|?|o)?(--|\.\.)(\*|\|?>|o)?/, 'transition'],
				[/^\s*class\s(?!.*\{)/, 'keyword'],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@classDiagramBlockKeywords': 'typeKeyword',
							'@classDiagramKeywords': 'keyword',
							'@default': 'variable'
						}
					}
				],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/(<<)(.+?)(>>)/, ['delimiter.bracket', 'annotation', 'delimiter.bracket']],
				[/".*?"/, 'string'],
				[/:::/, 'transition'],
				[/:|\+|-|#|~|\*\s*$|\$\s*$|\(|\)|{|}/, 'delimiter.bracket']
			],
			journey: [
				[/(title)(.*)/, ['keyword', 'string']],
				[/(section)(.*)/, ['typeKeyword', 'string']],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@journeyBlockKeywords': 'typeKeyword',
							'@journeyKeywords': 'keyword',
							'@default': 'variable'
						}
					}
				],
				[
					/(^\s*.+?)(:)(.*?)(:)(.*?)([,$])/,
					[
						'string',
						'delimiter.bracket',
						'number',
						'delimiter.bracket',
						'variable',
						'delimiter.bracket'
					]
				],
				[/,/, 'delimiter.bracket'],
				[/(^\s*.+?)(:)([^:]*?)$/, ['string', 'delimiter.bracket', 'variable']],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
			],
			gantt: [
				[/(title)(.*)/, ['keyword', 'string']],
				[/(section)(.*)/, ['typeKeyword', 'string']],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@ganttBlockKeywords': 'typeKeyword',
							'@ganttKeywords': 'keyword'
						}
					}
				],
				[/(^\s*.*?)(:)/, ['string', 'delimiter.bracket']],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/:/, 'delimiter.bracket']
			],
			stateDiagram: [
				[/note[^:]*$/, { token: 'typeKeyword', next: 'stateDiagramNote' }],
				['hide empty description', 'keyword'],
				[/^\s*state\s(?!.*\{)/, 'keyword'],
				[/(<<)(fork|join|choice)(>>)/, 'annotation'],
				[/(\[\[)(fork|join|choice)(]])/, ['delimiter.bracket', 'annotation', 'delimiter.bracket']],
				[
					/[a-zA-Z][\w$]*/,
					{
						cases: {
							'@stateDiagramBlockKeywords': 'typeKeyword',
							'@stateDiagramKeywords': 'keyword',
							'@default': 'variable'
						}
					}
				],
				[/".*?"/, 'string'],
				[/(:)([^:\n]*?$)/, ['delimiter.bracket', 'string']],
				[/{|}/, 'delimiter.bracket'],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/-->/, 'transition'],
				[/\[.*?]/, 'string']
			],
			stateDiagramNote: [
				[/^\s*end note$/, { token: 'typeKeyword', next: '@pop' }],
				[/.*/, 'string']
			],
			erDiagram: [
				[/[}|][o|](--|\.\.)[o|][{|]/, 'transition'],
				[/".*?"/, 'string'],
				[/(:)(.*?$)/, ['delimiter.bracket', 'string']],
				[/:|{|}/, 'delimiter.bracket'],
				[/([a-zA-Z]+)(\s+[a-zA-Z]+)/, ['type', 'variable']],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/[a-zA-Z_-][\w$]*/, 'variable']
			],
			requirementDiagram: [
				[/->|<-|-/, 'transition'],
				[/(\d+\.)*\d+/, 'number'],
				[
					/[a-zA-Z_-][\w$]*/,
					{
						cases: {
							'@requirementDiagramBlockKeywords': 'typeKeyword',
							'@default': 'variable'
						}
					}
				],
				[/:|{|}|\//, 'delimiter.bracket'],
				[/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
				[/".*?"/, 'string']
			]
		}
	});

	monacoEditor.editor.defineTheme('mermaid-dark', {
		base: 'vs-dark',
		inherit: true,
		rules: [
			{ token: 'typeKeyword', foreground: '9650c8', fontStyle: 'bold' },
			{ token: 'transition', foreground: '008800', fontStyle: 'bold' }
		],
              colors: { 'editor.foreground': '#000000' }
	});

	monacoEditor.editor.defineTheme('mermaid', {
		base: 'vs',
		inherit: true,
		rules: [
			{ token: 'typeKeyword', foreground: '9650c8', fontStyle: 'bold' },
			{ token: 'keyword', foreground: '649696' },
			{ token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
			{ token: 'string', foreground: 'AA8500' },
			{ token: 'transition', foreground: '008800', fontStyle: 'bold' },
			{ token: 'delimiter.bracket', foreground: '000000', fontStyle: 'bold' },
			{ token: 'annotation', foreground: '4b4b96' },
			{ token: 'number', foreground: '4b4b96' },
			{ token: 'comment', foreground: '888c89' },
			{ token: 'variable', foreground: 'A22889' },
			{ token: 'type', foreground: '2BDEA8' }
		],
              colors: { 'editor.foreground': '#000000' }
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
					label: 'subgraph',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['subgraph ${1:title}', '\t$0', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Subgraph'
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
				{
					label: 'element',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['element ${1:test_entity} {', '\t$0', '}'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Requirement Diagram Element'
				},
				{
					label: 'options',
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: ['options', '{', '    $0', '}', 'end'].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: 'Git Graph Options'
				},
				...requirementDiagrams.map((requirementDiagramType) => ({
					label: requirementDiagramType,
					kind: monacoEditor.languages.CompletionItemKind.Snippet,
					insertText: [
						requirementDiagramType + ' ${1:test_req} {',
						'\tid: 1',
						'\ttext: the test text.',
						'\trisk: high',
						'\tverifyMethod: test',
						'}'
					].join('\n'),
					insertTextRules: monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet,
					documentation: requirementDiagramType
						.split(/(?=[A-Z])/)
						.map((part) => part[0].toUpperCase() + part.slice(1))
						.join(' ')
				})),
				...[
					...new Set(
						Object.values(keywords)
							.map((diagramKeywords) =>
								Object.entries(diagramKeywords)
									.filter((keywordType) => keywordType[0] !== 'annotations')
									.map((entry) => entry[1])
							)
							.flat(2)
					)
				].map((keyword) => ({
					label: keyword,
					kind: monacoEditor.languages.CompletionItemKind.Keyword,
					insertText: keyword
				}))
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
