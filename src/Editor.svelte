<script>
import { codeStore } from './code-store.js';
import { errorStore } from './error-store.js';
import { onMount } from 'svelte';
import mermaid from 'mermaid';
import Error from './error.svelte';
// (1) Desired editor features:
import 'monaco-editor/esm/vs/editor/browser/controller/coreCommands.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/codeEditorWidget.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/diffEditorWidget.js';
// import 'monaco-editor/esm/vs/editor/browser/widget/diffNavigator.js';
// import 'monaco-editor/esm/vs/editor/contrib/bracketMatching/bracketMatching.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/caretOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/caretOperations/transpose.js';
// import 'monaco-editor/esm/vs/editor/contrib/clipboard/clipboard.js';
// import 'monaco-editor/esm/vs/editor/contrib/codelens/codelensController.js';
// import 'monaco-editor/esm/vs/editor/contrib/colorPicker/colorDetector.js';
// import 'monaco-editor/esm/vs/editor/contrib/comment/comment.js';
// import 'monaco-editor/esm/vs/editor/contrib/contextmenu/contextmenu.js';
// import 'monaco-editor/esm/vs/editor/contrib/cursorUndo/cursorUndo.js';
// import 'monaco-editor/esm/vs/editor/contrib/dnd/dnd.js';
import 'monaco-editor/esm/vs/editor/contrib/find/findController.js';
// import 'monaco-editor/esm/vs/editor/contrib/folding/folding.js';
// import 'monaco-editor/esm/vs/editor/contrib/format/formatActions.js';
// import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/goToDeclaration/goToDeclarationMouse.js';
// import 'monaco-editor/esm/vs/editor/contrib/gotoError/gotoError.js';
// import 'monaco-editor/esm/vs/editor/contrib/hover/hover.js';
// import 'monaco-editor/esm/vs/editor/contrib/inPlaceReplace/inPlaceReplace.js';
// import 'monaco-editor/esm/vs/editor/contrib/linesOperations/linesOperations.js';
// import 'monaco-editor/esm/vs/editor/contrib/links/links.js';
// import 'monaco-editor/esm/vs/editor/contrib/multicursor/multicursor.js';
// import 'monaco-editor/esm/vs/editor/contrib/parameterHints/parameterHints.js';
// import 'monaco-editor/esm/vs/editor/contrib/quickFix/quickFixCommands.js';
// import 'monaco-editor/esm/vs/editor/contrib/referenceSearch/referenceSearch.js';
// import 'monaco-editor/esm/vs/editor/contrib/rename/rename.js';
// import 'monaco-editor/esm/vs/editor/contrib/smartSelect/smartSelect.js';
// import 'monaco-editor/esm/vs/editor/contrib/snippet/snippetController2.js';
// import 'monaco-editor/esm/vs/editor/contrib/suggest/suggestController.js';
// import 'monaco-editor/esm/vs/editor/contrib/toggleTabFocusMode/toggleTabFocusMode.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordHighlighter/wordHighlighter.js';
// import 'monaco-editor/esm/vs/editor/contrib/wordOperations/wordOperations.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/accessibilityHelp/accessibilityHelp.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/inspectTokens/inspectTokens.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/iPadShowKeyboard/iPadShowKeyboard.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickOutline.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/gotoLine.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/quickOpen/quickCommand.js';
// import 'monaco-editor/esm/vs/editor/standalone/browser/toggleHighContrast/toggleHighContrast.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// (2) Desired languages:
// import 'monaco-editor/esm/vs/language/typescript/monaco.contribution';
// import 'monaco-editor/esm/vs/language/css/monaco.contribution';
// import 'monaco-editor/esm/vs/language/json/monaco.contribution';
// import 'monaco-editor/esm/vs/language/html/monaco.contribution';
// import 'monaco-editor/esm/vs/basic-languages/bat/bat.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/coffee/coffee.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/cpp/cpp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csharp/csharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/csp/csp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/css/css.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/dockerfile/dockerfile.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/fsharp/fsharp.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/go/go.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/handlebars/handlebars.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/html/html.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ini/ini.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/java/java.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/less/less.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/lua/lua.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/msdax/msdax.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/mysql/mysql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/objective-c/objective-c.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pgsql/pgsql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/php/php.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/postiats/postiats.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/powershell/powershell.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/pug/pug.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/r/r.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/razor/razor.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redis/redis.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/redshift/redshift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/ruby/ruby.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sb/sb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/scss/scss.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/solidity/solidity.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/sql/sql.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/swift/swift.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/vb/vb.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/xml/xml.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/yaml/yaml.contribution.js';
// import './mermaid-language/mermaid.contribution.js';
// import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';

monaco.languages.register({ id: 'mermaid' });

// Register a tokens provider for the language
monaco.languages.setMonarchTokensProvider('mermaid', {
  typeKeywords: [
    'graph', 'stateDiagram', 'sequenceDiagram', 'classDiagram', 'pie'
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


onMount(async () => {
self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		return './editor.worker.bundle.js';
	}
}

	const code = `graph TD
	A[Client] --> B[Load Balancer]
	B --> C[Server01]
	B --> D[Server02]
	D --> F[Server03]
	D --> I[Server02]
	D --> H[Server05]
	D --> G[Server04]
`;

	codeStore.set(code);

// Define a new theme that contains only rules that match this language
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

	const edit = monaco.editor.create(document.getElementById('editor'), {
		value: [
			code,
		].join('\n'),
		theme: 'myCoolTheme',
		// value: getCode(),
		language: 'mermaid'
		// language: 'mermaid'
	});
	let decorations;
	edit.onDidChangeModelContent(function (e) {
		const code = edit.getValue();

		try {
			mermaid.parse(code);
			codeStore.set(edit.getValue());
			edit.deltaDecorations(decorations, []);
			console.log(decorations);
			errorStore.set(undefined);
		} catch(e) {
			console.log(e.hash.line);
			errorStore.set(e);
			const l = e.hash.line;
		 decorations = edit.deltaDecorations([], [
			{ range: new monaco.Range(e.hash.loc.first_line,e.hash.loc.last_line,e.hash.loc.first_column,e.hash.loc.last_column), options: { inlineClassName: 'myInlineDecoration' }}]);

		}


	});
});

	export let name;
</script>

<style>
	#editor-container {
		height: 80%;
		max-height: 400px;
		border: 1px solor darkred;
		flex: 1;
	}
	#editor {
		height: 80%;
		max-height: 400px;
		border: 1px solor darkred;
		flex: 1;
	}

	.myLineDecoration {
		background: lightblue;
		width: 50px !important;
		margin-left: 3px;
	}
</style>

<div id="editor-container">
	<div id="editor"> </div>
	<Error />
</div>
