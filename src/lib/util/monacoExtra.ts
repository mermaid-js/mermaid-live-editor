// Modified from https://github.com/Yash-Singh1/monaco-mermaid/blob/main/index.ts

import type * as Monaco from 'monaco-editor';

const commentRegex = /(?<!["'])%%(?![^"']*["']\)).*$/;

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
    c4Diagram: {
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
      ],
      typeKeywords: ['C4Context', 'C4Container', 'C4Component', 'C4Dynamic', 'C4Deployment']
    },
    classDiagram: {
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
      ],
      typeKeywords: ['classDiagram', 'classDiagram-v2']
    },
    erDiagram: {
      blockKeywords: [],
      keywords: ['title', 'accDescription'],
      typeKeywords: ['erDiagram']
    },
    flowchart: {
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
      ],
      typeKeywords: ['flowchart', 'flowchart-v2', 'graph']
    },
    gantt: {
      blockKeywords: [],
      keywords: [
        'title',
        'dateFormat',
        'axisFormat',
        'todayMarker',
        'section',
        'excludes',
        'inclusiveEndDates'
      ],
      typeKeywords: ['gantt']
    },
    gitGraph: {
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
      ],
      typeKeywords: ['gitGraph']
    },
    info: {
      blockKeywords: [],
      keywords: ['showInfo'],
      typeKeywords: ['info']
    },
    journey: {
      blockKeywords: ['section'],
      keywords: ['title'],
      typeKeywords: ['journey']
    },
    pie: {
      blockKeywords: [],
      keywords: ['showData', 'title', 'accDescr', 'accTitle'],
      typeKeywords: ['pie']
    },
    requirementDiagram: {
      blockKeywords: [...requirementDiagrams, 'element'],
      keywords: [],
      typeKeywords: ['requirement', 'requirementDiagram']
    },
    sankey: {
      blockKeywords: [],
      keywords: [],
      typeKeywords: ['sankey-beta']
    },
    sequenceDiagram: {
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
      ],
      typeKeywords: ['sequenceDiagram']
    },
    stateDiagram: {
      blockKeywords: ['state', 'note', 'end'],
      keywords: ['state', 'as', 'hide empty description', 'direction', 'TB', 'BT', 'RL', 'LR'],
      typeKeywords: ['stateDiagram', 'stateDiagram-v2']
    }
  };

  const configDirectiveHandler = [
    /^\s*%%(?={)/,
    {
      next: '@configDirective',
      nextEmbedded: 'javascript',
      token: 'string'
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
      .reduce(
        (overallKeywords, nextKeyword) => ({
          ...overallKeywords,
          ...nextKeyword
        }),
        {}
      ),
    tokenizer: {
      c4Diagram: [
        configDirectiveHandler,
        [/(title|accDescription)(.*$)/, ['keyword', 'string']],
        [/\(/, { next: 'c4DiagramParenthesis', token: 'delimiter.bracket' }],
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
        [commentRegex, 'comment']
      ],
      c4DiagramParenthesis: [
        [/,/, 'delimiter.bracket'],
        [/\)/, { next: '@pop', token: 'delimiter.bracket' }],
        [/[^),]/, 'string']
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
        [commentRegex, 'comment'],
        [/(<<)(.+?)(>>)/, ['delimiter.bracket', 'annotation', 'delimiter.bracket']],
        [/".*?"/, 'string'],
        [/:::/, 'transition'],
        [/:|\+|-|#|~|\*\s*$|\$\s*$|\(|\)|{|}/, 'delimiter.bracket']
      ],
      configDirective: [[/%%$/, { next: '@pop', nextEmbedded: '@pop', token: 'string' }]],
      erDiagram: [
        configDirectiveHandler,
        [/(title|accDescription)(.*$)/, ['keyword', 'string']],
        [/[|}][o|](--|\.\.)[o|][{|]/, 'transition'],
        [/".*?"/, 'string'],
        [/(:)(.*?$)/, ['delimiter.bracket', 'string']],
        [/[:{}]/, 'delimiter.bracket'],
        [/([A-Za-z]+)(\s+[A-Za-z]+)/, ['type', 'variable']],
        [commentRegex, 'comment'],
        [/[A-Z_a-z-][\w$]*/, 'variable']
      ],
      flowchart: [
        configDirectiveHandler,
        [/[ox]?(--+|==+)[ox]/, 'transition'],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@default': 'variable',
              '@flowchartBlockKeywords': 'typeKeyword',
              '@flowchartKeywords': 'keyword'
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
        [commentRegex, 'comment']
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
        [commentRegex, 'comment'],
        [/:/, 'delimiter.bracket']
      ],
      gitGraph: [
        configDirectiveHandler,
        [/option(?=s)/, { next: 'optionsGitGraph', token: 'typeKeyword' }],
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
        [commentRegex, 'comment'],
        [/\^/, 'delimiter.bracket']
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
      journey: [
        configDirectiveHandler,
        [/(title)(.*)/, ['keyword', 'string']],
        [/(section)(.*)/, ['typeKeyword', 'string']],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@default': 'variable',
              '@journeyBlockKeywords': 'typeKeyword',
              '@journeyKeywords': 'keyword'
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
        [commentRegex, 'comment']
      ],
      optionsGitGraph: [
        [
          /s$/,
          {
            nextEmbedded: 'json',
            token: 'typeKeyword'
          }
        ],
        ['end', { next: '@pop', nextEmbedded: '@pop', token: 'typeKeyword' }]
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
        [commentRegex, 'comment']
      ],
      requirementDiagram: [
        configDirectiveHandler,
        [/->|<-|-/, 'transition'],
        [/(\d+\.)*\d+/, 'number'],
        [
          /[A-Z_a-z-][\w$]*/,
          {
            cases: {
              '@default': 'variable',
              '@requirementDiagramBlockKeywords': 'typeKeyword'
            }
          }
        ],
        [/[/:{}]/, 'delimiter.bracket'],
        [commentRegex, 'comment'],
        [/".*?"/, 'string']
      ],
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
      sankey: [
        configDirectiveHandler,
        [/(title)(.*)/, ['keyword', 'string']],
        [/(accTitle|accDescr)(\s*:)(\s*[^\n\r]+$)/, ['keyword', 'delimiter.bracket', 'string']],
        [/".*?"/, 'string'],
        [/[A-Za-z]+/, 'string'],
        [/\s*\d+/, 'number'],
        [/,/, 'delimiter.bracket'],
        [commentRegex, 'comment']
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
              next: '@sequenceDiagramLinksProps',
              nextEmbedded: 'javascript',
              token: 'delimiter.bracket'
            }
          ]
        ],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@default': 'variable',
              '@sequenceDiagramBlockKeywords': 'typeKeyword',
              '@sequenceDiagramKeywords': 'keyword'
            }
          }
        ],
        [/(--?>?>|--?[)x])[+-]?/, 'transition'],
        [/(:)([^\n:]*?$)/, ['delimiter.bracket', 'string']],
        [commentRegex, 'comment']
      ],
      sequenceDiagramLinksProps: [
        // [/^:/, { token: 'delimiter.bracket', nextEmbedded: 'json' }],
        [/$|;/, { next: '@pop', nextEmbedded: '@pop', token: 'delimiter.bracket' }]
      ],
      stateDiagram: [
        configDirectiveHandler,
        [/note[^:]*$/, { next: 'stateDiagramNote', token: 'typeKeyword' }],
        ['hide empty description', 'keyword'],
        [/^\s*state\s(?!.*{)/, 'keyword'],
        [/(<<)(fork|join|choice)(>>)/, 'annotation'],
        [/(\[\[)(fork|join|choice)(]])/, ['delimiter.bracket', 'annotation', 'delimiter.bracket']],
        [
          /[A-Za-z][\w$]*/,
          {
            cases: {
              '@default': 'variable',
              '@stateDiagramBlockKeywords': 'typeKeyword',
              '@stateDiagramKeywords': 'keyword'
            }
          }
        ],
        [/".*?"/, 'string'],
        [/(:)([^\n:]*?$)/, ['delimiter.bracket', 'string']],
        [/{|}/, 'delimiter.bracket'],
        [commentRegex, 'comment'],
        [/-->/, 'transition'],
        [/\[.*?]/, 'string']
      ],
      stateDiagramNote: [
        [/^\s*end note$/, { next: '@pop', token: 'typeKeyword' }],
        [/.*/, 'string']
      ]
    }
  });

  monacoEditor.editor.defineTheme('mermaid-dark', {
    base: 'vs-dark',
    colors: {},
    inherit: true,
    rules: [
      { fontStyle: 'bold', foreground: '9650c8', token: 'typeKeyword' },
      { fontStyle: 'bold', foreground: '008800', token: 'transition' },
      { foreground: '9cdcfe', token: 'identifier' }
    ]
  });

  monacoEditor.editor.defineTheme('mermaid', {
    base: 'vs',
    colors: {},
    inherit: true,
    rules: [
      { fontStyle: 'bold', foreground: '9650c8', token: 'typeKeyword' },
      { foreground: '649696', token: 'keyword' },
      { fontStyle: 'bold', foreground: 'ff0000', token: 'custom-error' },
      { foreground: 'AA8500', token: 'string' },
      { fontStyle: 'bold', foreground: '008800', token: 'transition' },
      { fontStyle: 'bold', foreground: '000000', token: 'delimiter.bracket' },
      { foreground: '4b4b96', token: 'annotation' },
      { foreground: '4b4b96', token: 'number' },
      { foreground: '888c89', token: 'comment' },
      { foreground: 'A22889', token: 'variable' },
      { foreground: '2BDEA8', token: 'type' },
      { foreground: '9cdcfe', token: 'identifier' }
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
        close: ')',
        open: '('
      },
      {
        close: '}',
        open: '{'
      },
      {
        close: ']',
        open: '['
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
