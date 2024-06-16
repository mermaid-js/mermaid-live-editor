// Modified from https://github.com/Yash-Singh1/monaco-mermaid/blob/main/index.ts

import type * as Monaco from 'monaco-editor';

export const initEditor = (monacoEditor: typeof Monaco): void => {
  monacoEditor.languages.register({ id: 'mermaid' });
  const requirementDiagrams = [
    'requirement',
    'functionalRequirement',
    'interfaceRequirement',
    'performanceRequirement',
    'physicalRequirement',
    'designConstraint'
  ];
  const keywords: Record<
    string,
    {
      typeKeywords: string[];
      blockKeywords: string[];
      keywords: string[];
    }
  > = {
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
        'actor',
        'accDescription',
        'link',
        'links'
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
        'LR',
        'title',
        'accDescription',
        'order'
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
      keywords: ['title', 'accDescription']
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
      blockKeywords: [...requirementDiagrams, 'element'],
      keywords: []
    },
    gitGraph: {
      typeKeywords: ['gitGraph'],
      blockKeywords: [],
      keywords: [
        'accTitle',
        'accDescr',
        'commit',
        'cherry-pick',
        'branch',
        'merge',
        'reset',
        'checkout',
        'LR',
        'BT',
        'id',
        'msg',
        'type',
        'tag',
        'NORMAL',
        'REVERSE',
        'HIGHLIGHT'
      ]
    },
    pie: {
      typeKeywords: ['pie'],
      blockKeywords: [],
      keywords: ['showData', 'title', 'accDescr', 'accTitle']
    },
    c4Diagram: {
      typeKeywords: ['C4Context', 'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment'],
      blockKeywords: [
        'Boundary',
        'Enterprise_Boundary',
        'System_Boundary',
        'Container_Boundary',
        'Node',
        'Node_L',
        'Node_R'
      ],
      keywords: [
        'title',
        'accDescription',
        'direction',
        'TB',
        'BT',
        'RL',
        'LR',
        'Person_Ext',
        'Person',
        'SystemQueue_Ext',
        'SystemDb_Ext',
        'System_Ext',
        'SystemQueue',
        'SystemDb',
        'System',
        'ContainerQueue_Ext',
        'ContainerDb_Ext',
        'Container_Ext',
        'ContainerQueue',
        'ContainerDb',
        'Container',
        'ComponentQueue_Ext',
        'ComponentDb_Ext',
        'Component_Ext',
        'ComponentQueue',
        'ComponentDb',
        'Component',
        'Deployment_Node',
        'Rel',
        'BiRel',
        'Rel_Up',
        'Rel_U',
        'Rel_Down',
        'Rel_D',
        'Rel_Left',
        'Rel_L',
        'Rel_Right',
        'Rel_R',
        'Rel_Back',
        'RelIndex'
      ]
    },
    sankey: {
      typeKeywords: ['sankey-beta'],
      blockKeywords: [],
      keywords: []
    }
  };

  const configDirectiveHandler = [
    /^\s*%%(?={)/,
    {
      token: 'string',
      next: '@configDirective',
      nextEmbedded: 'javascript'
    }
  ] as Monaco.languages.IShortMonarchLanguageRule1;

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
      // eslint-disable-next-line unicorn/no-array-reduce
      .reduce(
        (overallKeywords, nextKeyword) => ({
          ...overallKeywords,
          ...nextKeyword
        }),
        {}
      ),
    tokenizer: {
      root: [
        [/^\s*gitGraph/m, 'typeKeyword', 'gitGraph'],
        [/^\s*info/m, 'typeKeyword', 'info'],
        [/^\s*pie/m, 'typeKeyword', 'pie'],
        [/^\s*(flowchart|flowchart-v2|graph)/m, 'typeKeyword', 'flowchart'],
        [/^\s*sequenceDiagram/, 'typeKeyword', 'sequenceDiagram'],
        [/^\s*classDiagram(-v2)?/, 'typeKeyword', 'classDiagram'],
        [/^\s*journey/, 'typeKeyword', 'journey'],
        [/^\s*gantt/, 'typeKeyword', 'gantt'],
        [/^\s*stateDiagram(-v2)?/, 'typeKeyword', 'stateDiagram'],
        [/^\s*er(Diagram)?/, 'typeKeyword', 'erDiagram'],
        [/^\s*requirement(Diagram)?/, 'typeKeyword', 'requirementDiagram'],
        [/^\s*sankey-beta/m, 'typeKeyword', 'sankey'],
        [
          /^\s*(C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)/m,
          'typeKeyword',
          'c4Diagram'
        ],
        configDirectiveHandler,
        [/%%[^${].*$/, 'comment']
      ],
      configDirective: [[/%%$/, { token: 'string', next: '@pop', nextEmbedded: '@pop' }]],
      gitGraph: [
        configDirectiveHandler,
        [/option(?=s)/, { token: 'typeKeyword', next: 'optionsGitGraph' }],
        [/(accTitle|accDescr)(\s*:)(\s*[^\n\r]+$)/, ['keyword', 'delimiter.bracket', 'string']],
        [
          /(^\s*branch)(.*?)(\s+order)(:\s*)(\d+\s*$)/,
          ['keyword', 'variable', 'keyword', 'delimiter.bracket', 'number']
        ],
        [/".*?"/, 'string'],
        [
          /(^\s*)(branch|reset|merge|checkout)(\s*\S+)/m,
          ['delimiter.bracket', 'keyword', 'variable']
        ],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@gitGraphBlockKeywords': 'typeKeyword',
              '@gitGraphKeywords': 'keyword'
            }
          }
        ],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
        [/\^/, 'delimiter.bracket']
      ],
      optionsGitGraph: [
        [
          /s$/,
          {
            token: 'typeKeyword',
            nextEmbedded: 'json'
          }
        ],
        ['end', { token: 'typeKeyword', next: '@pop', nextEmbedded: '@pop' }]
      ],
      info: [
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@infoBlockKeywords': 'typeKeyword',
              '@infoKeywords': 'keyword'
            }
          }
        ]
      ],
      pie: [
        configDirectiveHandler,
        [/(title|accDescription)(.*$)/, ['keyword', 'string']],
        [
          /[A-Za-z][\w$]*/,
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
        configDirectiveHandler,
        [/[ox]?(--+|==+)[ox]/, 'transition'],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@flowchartBlockKeywords': 'typeKeyword',
              '@flowchartKeywords': 'keyword',
              '@default': 'variable'
            }
          }
        ],
        [/\|+.+?\|+/, 'string'],
        [/\[+(\\.+?[/\\]|\/.+?[/\\])]+/, 'string'],
        [/[>[]+[^[\]|]+?]+/, 'string'],
        [/{+.+?}+/, 'string'],
        [/\(+.+?\)+/, 'string'],
        [/-\.+->?/, 'transition'],
        [/(-[.-])([^>-][^-]+?)(-{3,}|-{2,}>|\.-+>)/, ['transition', 'string', 'transition']],
        [/(==+)([^=]+?)(={3,}|={2,}>)/, ['transition', 'string', 'transition']],
        [/<?(--+|==+)>|===+|---+/, 'transition'],
        [/:::/, 'transition'],
        [/[&;]/, 'delimiter.bracket'],
        [/".*?"/, 'string'],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
      ],
      sequenceDiagram: [
        configDirectiveHandler,
        [/(title:?|accDescription)([^\n\r;]*$)/, ['keyword', 'string']],
        [/(autonumber)([^\S\n\r]+off[^\S\n\r]*$)/, ['keyword', 'keyword']],
        [/(autonumber)((?:[^\S\n\r]+\d+){2}[^\S\n\r]*$)/, ['keyword', 'number']],
        [/(autonumber)([^\S\n\r]+\d+[^\S\n\r]*$)/, ['keyword', 'number']],
        [
          /(link\s+)(.*?)(:)(\s*.*?)(\s*@)(\s*[^\n\r;]+)/,
          ['keyword', 'variable', 'delimiter.bracket', 'string', 'delimiter.bracket', 'string']
        ],
        [
          /((?:links|properties)\s+)([^\n\r:]*?)(:\s+)/,
          [
            { token: 'keyword' },
            { token: 'variable' },
            {
              token: 'delimiter.bracket',
              nextEmbedded: 'javascript',
              next: '@sequenceDiagramLinksProps'
            }
          ]
        ],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@sequenceDiagramBlockKeywords': 'typeKeyword',
              '@sequenceDiagramKeywords': 'keyword',
              '@default': 'variable'
            }
          }
        ],
        [/(--?>?>|--?[)x])[+-]?/, 'transition'],
        [/(:)([^\n:]*?$)/, ['delimiter.bracket', 'string']],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
      ],
      sequenceDiagramLinksProps: [
        // [/^:/, { token: 'delimiter.bracket', nextEmbedded: 'json' }],
        [/$|;/, { nextEmbedded: '@pop', next: '@pop', token: 'delimiter.bracket' }]
      ],
      classDiagram: [
        configDirectiveHandler,
        [/(^\s*(?:title|accDescription))(\s+.*$)/, ['keyword', 'string']],
        [
          /(\*|<\|?|o|)(--|\.\.)(\*|\|?>|o|)([\t ]*[A-Za-z]+[\t ]*)(:)(.*?$)/,
          ['transition', 'transition', 'transition', 'variable', 'delimiter.bracket', 'string']
        ],
        [/(?!class\s)([A-Za-z]+)(\s+[A-Za-z]+)/, ['type', 'variable']],
        [/(\*|<\|?|o)?(--|\.\.)(\*|\|?>|o)?/, 'transition'],
        [/^\s*class\s(?!.*{)/, 'keyword'],
        [
          /[A-Za-z][\w$]*/,
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
        configDirectiveHandler,
        [/(title)(.*)/, ['keyword', 'string']],
        [/(section)(.*)/, ['typeKeyword', 'string']],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@journeyBlockKeywords': 'typeKeyword',
              '@journeyKeywords': 'keyword',
              '@default': 'variable'
            }
          }
        ],
        [
          /(^\s*.+?)(:)(.*?)(:)(.*?)([$,])/,
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
        configDirectiveHandler,
        [/(title)(.*)/, ['keyword', 'string']],
        [/(section)(.*)/, ['typeKeyword', 'string']],
        [/^\s*([^\n:]*?)(:)/, ['string', 'delimiter.bracket']],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@ganttBlockKeywords': 'typeKeyword',
              '@ganttKeywords': 'keyword'
            }
          }
        ],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
        [/:/, 'delimiter.bracket']
      ],
      stateDiagram: [
        configDirectiveHandler,
        [/note[^:]*$/, { token: 'typeKeyword', next: 'stateDiagramNote' }],
        ['hide empty description', 'keyword'],
        [/^\s*state\s(?!.*{)/, 'keyword'],
        [/(<<)(fork|join|choice)(>>)/, 'annotation'],
        [/(\[\[)(fork|join|choice)(]])/, ['delimiter.bracket', 'annotation', 'delimiter.bracket']],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@stateDiagramBlockKeywords': 'typeKeyword',
              '@stateDiagramKeywords': 'keyword',
              '@default': 'variable'
            }
          }
        ],
        [/".*?"/, 'string'],
        [/(:)([^\n:]*?$)/, ['delimiter.bracket', 'string']],
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
        configDirectiveHandler,
        [/(title|accDescription)(.*$)/, ['keyword', 'string']],
        [/[|}][o|](--|\.\.)[o|][{|]/, 'transition'],
        [/".*?"/, 'string'],
        [/(:)(.*?$)/, ['delimiter.bracket', 'string']],
        [/[:{}]/, 'delimiter.bracket'],
        [/([A-Za-z]+)(\s+[A-Za-z]+)/, ['type', 'variable']],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
        [/[A-Z_a-z-][\w$]*/, 'variable']
      ],
      requirementDiagram: [
        configDirectiveHandler,
        [/->|<-|-/, 'transition'],
        [/(\d+\.)*\d+/, 'number'],
        [
          /[A-Z_a-z-][\w$]*/,
          {
            cases: {
              '@requirementDiagramBlockKeywords': 'typeKeyword',
              '@default': 'variable'
            }
          }
        ],
        [/[/:{}]/, 'delimiter.bracket'],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment'],
        [/".*?"/, 'string']
      ],
      c4Diagram: [
        configDirectiveHandler,
        [/(title|accDescription)(.*$)/, ['keyword', 'string']],
        [/\(/, { token: 'delimiter.bracket', next: 'c4DiagramParenthesis' }],
        [
          /[A-Z_a-z-][\w$]*/,
          {
            cases: {
              '@c4DiagramBlockKeywords': 'typeKeyword',
              '@c4DiagramKeywords': 'keyword',
              '@default': 'variable'
            }
          }
        ],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
      ],
      c4DiagramParenthesis: [
        [/,/, 'delimiter.bracket'],
        [/\)/, { next: '@pop', token: 'delimiter.bracket' }],
        [/[^),]/, 'string']
      ],
      sankey: [
        configDirectiveHandler,
        [/(title)(.*)/, ['keyword', 'string']],
        [/(accTitle|accDescr)(\s*:)(\s*[^\n\r]+$)/, ['keyword', 'delimiter.bracket', 'string']],
        [/".*?"/, 'string'],
        [/[A-Za-z]+/, 'string'],
        [/\s*\d+/, 'number'],
        [/,/, 'delimiter.bracket'],
        [/%%[^$]([^%]*(?!%%$)%?)*$/, 'comment']
      ]
    }
  });

  monacoEditor.editor.defineTheme('mermaid-dark', {
    base: 'vs-dark',
    inherit: true,
    colors: {},
    rules: [
      { token: 'typeKeyword', foreground: '9650c8', fontStyle: 'bold' },
      { token: 'transition', foreground: '008800', fontStyle: 'bold' },
      { token: 'identifier', foreground: '9cdcfe' }
    ]
  });

  monacoEditor.editor.defineTheme('mermaid', {
    base: 'vs',
    inherit: true,
    colors: {},
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
      { token: 'type', foreground: '2BDEA8' },
      { token: 'identifier', foreground: '9cdcfe' }
    ]
  });

  monacoEditor.languages.registerCompletionItemProvider('mermaid', {
    provideCompletionItems: () => {
      return {
        suggestions: []
      };
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
    ],
    comments: {
      lineComment: '%%'
    }
  });
};
