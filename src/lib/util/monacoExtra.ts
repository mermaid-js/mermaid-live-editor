// Modified from https://github.com/Yash-Singh1/monaco-mermaid/blob/main/index.ts

import type * as Monaco from 'monaco-editor';
import { diagramLanguageData } from '@mermaid-js/syntax-metadata';
import {
  getCompletions,
  type CompletionSuggestion,
  type SuggestionKind
} from './mermaidCompletions';

const commentRegex = /(?<!["'])%%(?![^"']*["']\)).*$/;

export const initEditor = (monacoEditor: typeof Monaco): void => {
  monacoEditor.languages.register({ id: 'mermaid' });

  // Monarch keyword attributes (e.g. `flowchartKeywords`) consumed by the tokenizer below.
  const monarchKeywords: Record<string, string[]> = Object.fromEntries(
    diagramLanguageData.flatMap((data) => [
      [`${data.id}BlockKeywords`, []],
      [
        `${data.id}Keywords`,
        data.tokens.filter((token) => token.kind !== 'operator').map((token) => token.text)
      ],
      [`${data.id}TypeKeywords`, []]
    ])
  );

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
    ...monarchKeywords,
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

  const completionItemKind: Record<SuggestionKind, Monaco.languages.CompletionItemKind> = {
    diagram: monacoEditor.languages.CompletionItemKind.Class,
    identifier: monacoEditor.languages.CompletionItemKind.Variable,
    keyword: monacoEditor.languages.CompletionItemKind.Keyword,
    operator: monacoEditor.languages.CompletionItemKind.Operator,
    snippet: monacoEditor.languages.CompletionItemKind.Snippet
  };

  const toCompletionItem = (
    suggestion: CompletionSuggestion,
    range: Monaco.IRange
  ): Monaco.languages.CompletionItem => {
    const item: Monaco.languages.CompletionItem = {
      detail: suggestion.detail,
      insertText: suggestion.insertText,
      kind: completionItemKind[suggestion.kind],
      label: suggestion.label,
      range,
      sortText: suggestion.sortText
    };
    if (suggestion.documentation) {
      item.documentation = { value: suggestion.documentation };
    }
    if (suggestion.snippet) {
      item.insertTextRules = monacoEditor.languages.CompletionItemInsertTextRule.InsertAsSnippet;
    }
    return item;
  };

  monacoEditor.languages.registerCompletionItemProvider('mermaid', {
    provideCompletionItems: (model, position) => {
      const { from, suggestions, to } = getCompletions(
        model.getValue(),
        model.getOffsetAt(position)
      );
      const start = model.getPositionAt(from);
      const end = model.getPositionAt(to);
      const range = new monacoEditor.Range(
        start.lineNumber,
        start.column,
        end.lineNumber,
        end.column
      );
      return {
        suggestions: suggestions.map((suggestion) => toCompletionItem(suggestion, range))
      };
    },
    triggerCharacters: [' ', '.', '<', '>']
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
