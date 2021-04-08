(window["webpackJsonp"] = window["webpackJsonp"] || []).push([[36],{

/***/ "./node_modules/monaco-editor/esm/vs/basic-languages/objective-c/objective-c.js":
/*!**************************************************************************************!*\
  !*** ./node_modules/monaco-editor/esm/vs/basic-languages/objective-c/objective-c.js ***!
  \**************************************************************************************/
/*! exports provided: conf, language */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "conf", function() { return conf; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "language", function() { return language; });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var conf = {
    comments: {
        lineComment: '//',
        blockComment: ['/*', '*/']
    },
    brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
    ],
    autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
    ],
    surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
    ]
};
var language = {
    defaultToken: '',
    tokenPostfix: '.objective-c',
    keywords: [
        '#import',
        '#include',
        '#define',
        '#else',
        '#endif',
        '#if',
        '#ifdef',
        '#ifndef',
        '#ident',
        '#undef',
        '@class',
        '@defs',
        '@dynamic',
        '@encode',
        '@end',
        '@implementation',
        '@interface',
        '@package',
        '@private',
        '@protected',
        '@property',
        '@protocol',
        '@public',
        '@selector',
        '@synthesize',
        '__declspec',
        'assign',
        'auto',
        'BOOL',
        'break',
        'bycopy',
        'byref',
        'case',
        'char',
        'Class',
        'const',
        'copy',
        'continue',
        'default',
        'do',
        'double',
        'else',
        'enum',
        'extern',
        'FALSE',
        'false',
        'float',
        'for',
        'goto',
        'if',
        'in',
        'int',
        'id',
        'inout',
        'IMP',
        'long',
        'nil',
        'nonatomic',
        'NULL',
        'oneway',
        'out',
        'private',
        'public',
        'protected',
        'readwrite',
        'readonly',
        'register',
        'return',
        'SEL',
        'self',
        'short',
        'signed',
        'sizeof',
        'static',
        'struct',
        'super',
        'switch',
        'typedef',
        'TRUE',
        'true',
        'union',
        'unsigned',
        'volatile',
        'void',
        'while'
    ],
    decpart: /\d(_?\d)*/,
    decimal: /0|@decpart/,
    tokenizer: {
        root: [
            { include: '@comments' },
            { include: '@whitespace' },
            { include: '@numbers' },
            { include: '@strings' },
            [/[,:;]/, 'delimiter'],
            [/[{}\[\]()<>]/, '@brackets'],
            [
                /[a-zA-Z@#]\w*/,
                {
                    cases: {
                        '@keywords': 'keyword',
                        '@default': 'identifier'
                    }
                }
            ],
            [/[<>=\\+\\-\\*\\/\\^\\|\\~,]|and\\b|or\\b|not\\b]/, 'operator']
        ],
        whitespace: [[/\s+/, 'white']],
        comments: [
            ['\\/\\*', 'comment', '@comment'],
            ['\\/\\/+.*', 'comment']
        ],
        comment: [
            ['\\*\\/', 'comment', '@pop'],
            ['.', 'comment']
        ],
        numbers: [
            [/0[xX][0-9a-fA-F]*(_?[0-9a-fA-F])*/, 'number.hex'],
            [
                /@decimal((\.@decpart)?([eE][\-+]?@decpart)?)[fF]*/,
                {
                    cases: {
                        '(\\d)*': 'number',
                        $0: 'number.float'
                    }
                }
            ]
        ],
        // Recognize strings, including those broken across lines with \ (but not without)
        strings: [
            [/'$/, 'string.escape', '@popall'],
            [/'/, 'string.escape', '@stringBody'],
            [/"$/, 'string.escape', '@popall'],
            [/"/, 'string.escape', '@dblStringBody']
        ],
        stringBody: [
            [/[^\\']+$/, 'string', '@popall'],
            [/[^\\']+/, 'string'],
            [/\\./, 'string'],
            [/'/, 'string.escape', '@popall'],
            [/\\$/, 'string']
        ],
        dblStringBody: [
            [/[^\\"]+$/, 'string', '@popall'],
            [/[^\\"]+/, 'string'],
            [/\\./, 'string'],
            [/"/, 'string.escape', '@popall'],
            [/\\$/, 'string']
        ]
    }
};


/***/ })

}]);
//# sourceMappingURL=36.36.js.map