var M=Object.defineProperty;var R=(e,t,r)=>t in e?M(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var _=(e,t,r)=>(R(e,typeof t!="symbol"?t+"":t,r),r);import{t as K,m as E}from"./3.07580719.js";/*!-----------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Version: 0.45.0(5e5af013f8d295555a7210df0d5f2cea0bf5dd56)
 * Released under the MIT license
 * https://github.com/microsoft/monaco-editor/blob/main/LICENSE.txt
 *-----------------------------------------------------------------------------*/var L=Object.defineProperty,H=Object.getOwnPropertyDescriptor,V=Object.getOwnPropertyNames,W=Object.prototype.hasOwnProperty,j=(e,t,r)=>t in e?L(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,T=(e,t,r,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of V(t))!W.call(e,n)&&n!==r&&L(e,n,{get:()=>t[n],enumerable:!(l=H(t,n))||l.enumerable});return e},B=(e,t,r)=>(T(e,t,"default"),r&&T(r,t,"default")),b=(e,t,r)=>(j(e,typeof t!="symbol"?t+"":t,r),r),i={};B(i,E);var U=class{constructor(e,t){_(this,"_configChangeListener");_(this,"_updateExtraLibsToken");_(this,"_extraLibsChangeListener");_(this,"_worker");_(this,"_client");this._modeId=e,this._defaults=t,this._worker=null,this._client=null,this._configChangeListener=this._defaults.onDidChange(()=>this._stopWorker()),this._updateExtraLibsToken=0,this._extraLibsChangeListener=this._defaults.onDidExtraLibsChange(()=>this._updateExtraLibs())}dispose(){this._configChangeListener.dispose(),this._extraLibsChangeListener.dispose(),this._stopWorker()}_stopWorker(){this._worker&&(this._worker.dispose(),this._worker=null),this._client=null}async _updateExtraLibs(){if(!this._worker)return;const e=++this._updateExtraLibsToken,t=await this._worker.getProxy();this._updateExtraLibsToken===e&&t.updateExtraLibs(this._defaults.getExtraLibs())}_getClient(){return this._client||(this._client=(async()=>(this._worker=i.editor.createWebWorker({moduleId:"vs/language/typescript/tsWorker",label:this._modeId,keepIdleModels:!0,createData:{compilerOptions:this._defaults.getCompilerOptions(),extraLibs:this._defaults.getExtraLibs(),customWorkerPath:this._defaults.workerOptions.customWorkerPath,inlayHintsOptions:this._defaults.inlayHintsOptions}}),this._defaults.getEagerModelSync()?await this._worker.withSyncedResources(i.editor.getModels().filter(e=>e.getLanguageId()===this._modeId).map(e=>e.uri)):await this._worker.getProxy()))()),this._client}async getLanguageServiceWorker(...e){const t=await this._getClient();return this._worker&&await this._worker.withSyncedResources(e),t}},s={};s["lib.d.ts"]=!0;s["lib.decorators.d.ts"]=!0;s["lib.decorators.legacy.d.ts"]=!0;s["lib.dom.d.ts"]=!0;s["lib.dom.iterable.d.ts"]=!0;s["lib.es2015.collection.d.ts"]=!0;s["lib.es2015.core.d.ts"]=!0;s["lib.es2015.d.ts"]=!0;s["lib.es2015.generator.d.ts"]=!0;s["lib.es2015.iterable.d.ts"]=!0;s["lib.es2015.promise.d.ts"]=!0;s["lib.es2015.proxy.d.ts"]=!0;s["lib.es2015.reflect.d.ts"]=!0;s["lib.es2015.symbol.d.ts"]=!0;s["lib.es2015.symbol.wellknown.d.ts"]=!0;s["lib.es2016.array.include.d.ts"]=!0;s["lib.es2016.d.ts"]=!0;s["lib.es2016.full.d.ts"]=!0;s["lib.es2017.d.ts"]=!0;s["lib.es2017.full.d.ts"]=!0;s["lib.es2017.intl.d.ts"]=!0;s["lib.es2017.object.d.ts"]=!0;s["lib.es2017.sharedmemory.d.ts"]=!0;s["lib.es2017.string.d.ts"]=!0;s["lib.es2017.typedarrays.d.ts"]=!0;s["lib.es2018.asyncgenerator.d.ts"]=!0;s["lib.es2018.asynciterable.d.ts"]=!0;s["lib.es2018.d.ts"]=!0;s["lib.es2018.full.d.ts"]=!0;s["lib.es2018.intl.d.ts"]=!0;s["lib.es2018.promise.d.ts"]=!0;s["lib.es2018.regexp.d.ts"]=!0;s["lib.es2019.array.d.ts"]=!0;s["lib.es2019.d.ts"]=!0;s["lib.es2019.full.d.ts"]=!0;s["lib.es2019.intl.d.ts"]=!0;s["lib.es2019.object.d.ts"]=!0;s["lib.es2019.string.d.ts"]=!0;s["lib.es2019.symbol.d.ts"]=!0;s["lib.es2020.bigint.d.ts"]=!0;s["lib.es2020.d.ts"]=!0;s["lib.es2020.date.d.ts"]=!0;s["lib.es2020.full.d.ts"]=!0;s["lib.es2020.intl.d.ts"]=!0;s["lib.es2020.number.d.ts"]=!0;s["lib.es2020.promise.d.ts"]=!0;s["lib.es2020.sharedmemory.d.ts"]=!0;s["lib.es2020.string.d.ts"]=!0;s["lib.es2020.symbol.wellknown.d.ts"]=!0;s["lib.es2021.d.ts"]=!0;s["lib.es2021.full.d.ts"]=!0;s["lib.es2021.intl.d.ts"]=!0;s["lib.es2021.promise.d.ts"]=!0;s["lib.es2021.string.d.ts"]=!0;s["lib.es2021.weakref.d.ts"]=!0;s["lib.es2022.array.d.ts"]=!0;s["lib.es2022.d.ts"]=!0;s["lib.es2022.error.d.ts"]=!0;s["lib.es2022.full.d.ts"]=!0;s["lib.es2022.intl.d.ts"]=!0;s["lib.es2022.object.d.ts"]=!0;s["lib.es2022.regexp.d.ts"]=!0;s["lib.es2022.sharedmemory.d.ts"]=!0;s["lib.es2022.string.d.ts"]=!0;s["lib.es2023.array.d.ts"]=!0;s["lib.es2023.d.ts"]=!0;s["lib.es2023.full.d.ts"]=!0;s["lib.es5.d.ts"]=!0;s["lib.es6.d.ts"]=!0;s["lib.esnext.d.ts"]=!0;s["lib.esnext.full.d.ts"]=!0;s["lib.esnext.intl.d.ts"]=!0;s["lib.scripthost.d.ts"]=!0;s["lib.webworker.d.ts"]=!0;s["lib.webworker.importscripts.d.ts"]=!0;s["lib.webworker.iterable.d.ts"]=!0;function D(e,t,r=0){if(typeof e=="string")return e;if(e===void 0)return"";let l="";if(r){l+=t;for(let n=0;n<r;n++)l+="  "}if(l+=e.messageText,r++,e.next)for(const n of e.next)l+=D(n,t,r);return l}function k(e){return e?e.map(t=>t.text).join(""):""}var w=class{constructor(e){this._worker=e}_textSpanToRange(e,t){let r=e.getPositionAt(t.start),l=e.getPositionAt(t.start+t.length),{lineNumber:n,column:u}=r,{lineNumber:g,column:a}=l;return{startLineNumber:n,startColumn:u,endLineNumber:g,endColumn:a}}},$=class{constructor(e){_(this,"_libFiles");_(this,"_hasFetchedLibFiles");_(this,"_fetchLibFilesPromise");this._worker=e,this._libFiles={},this._hasFetchedLibFiles=!1,this._fetchLibFilesPromise=null}isLibFile(e){return e&&e.path.indexOf("/lib.")===0?!!s[e.path.slice(1)]:!1}getOrCreateModel(e){const t=i.Uri.parse(e),r=i.editor.getModel(t);if(r)return r;if(this.isLibFile(t)&&this._hasFetchedLibFiles)return i.editor.createModel(this._libFiles[t.path.slice(1)],"typescript",t);const l=K.getExtraLibs()[e];return l?i.editor.createModel(l.content,"typescript",t):null}_containsLibFile(e){for(let t of e)if(this.isLibFile(t))return!0;return!1}async fetchLibFilesIfNecessary(e){this._containsLibFile(e)&&await this._fetchLibFiles()}_fetchLibFiles(){return this._fetchLibFilesPromise||(this._fetchLibFilesPromise=this._worker().then(e=>e.getLibFiles()).then(e=>{this._hasFetchedLibFiles=!0,this._libFiles=e})),this._fetchLibFilesPromise}},z=class extends w{constructor(t,r,l,n){super(n);_(this,"_disposables",[]);_(this,"_listener",Object.create(null));this._libFiles=t,this._defaults=r,this._selector=l;const u=o=>{if(o.getLanguageId()!==l)return;const p=()=>{const{onlyVisible:y}=this._defaults.getDiagnosticsOptions();y?o.isAttachedToEditor()&&this._doValidate(o):this._doValidate(o)};let d;const f=o.onDidChangeContent(()=>{clearTimeout(d),d=window.setTimeout(p,500)}),h=o.onDidChangeAttached(()=>{const{onlyVisible:y}=this._defaults.getDiagnosticsOptions();y&&(o.isAttachedToEditor()?p():i.editor.setModelMarkers(o,this._selector,[]))});this._listener[o.uri.toString()]={dispose(){f.dispose(),h.dispose(),clearTimeout(d)}},p()},g=o=>{i.editor.setModelMarkers(o,this._selector,[]);const p=o.uri.toString();this._listener[p]&&(this._listener[p].dispose(),delete this._listener[p])};this._disposables.push(i.editor.onDidCreateModel(o=>u(o))),this._disposables.push(i.editor.onWillDisposeModel(g)),this._disposables.push(i.editor.onDidChangeModelLanguage(o=>{g(o.model),u(o.model)})),this._disposables.push({dispose(){for(const o of i.editor.getModels())g(o)}});const a=()=>{for(const o of i.editor.getModels())g(o),u(o)};this._disposables.push(this._defaults.onDidChange(a)),this._disposables.push(this._defaults.onDidExtraLibsChange(a)),i.editor.getModels().forEach(o=>u(o))}dispose(){this._disposables.forEach(t=>t&&t.dispose()),this._disposables=[]}async _doValidate(t){const r=await this._worker(t.uri);if(t.isDisposed())return;const l=[],{noSyntaxValidation:n,noSemanticValidation:u,noSuggestionDiagnostics:g}=this._defaults.getDiagnosticsOptions();n||l.push(r.getSyntacticDiagnostics(t.uri.toString())),u||l.push(r.getSemanticDiagnostics(t.uri.toString())),g||l.push(r.getSuggestionDiagnostics(t.uri.toString()));const a=await Promise.all(l);if(!a||t.isDisposed())return;const o=a.reduce((d,f)=>f.concat(d),[]).filter(d=>(this._defaults.getDiagnosticsOptions().diagnosticCodesToIgnore||[]).indexOf(d.code)===-1),p=o.map(d=>d.relatedInformation||[]).reduce((d,f)=>f.concat(d),[]).map(d=>d.file?i.Uri.parse(d.file.fileName):null);await this._libFiles.fetchLibFilesIfNecessary(p),!t.isDisposed()&&i.editor.setModelMarkers(t,this._selector,o.map(d=>this._convertDiagnostics(t,d)))}_convertDiagnostics(t,r){const l=r.start||0,n=r.length||1,{lineNumber:u,column:g}=t.getPositionAt(l),{lineNumber:a,column:o}=t.getPositionAt(l+n),p=[];return r.reportsUnnecessary&&p.push(i.MarkerTag.Unnecessary),r.reportsDeprecated&&p.push(i.MarkerTag.Deprecated),{severity:this._tsDiagnosticCategoryToMarkerSeverity(r.category),startLineNumber:u,startColumn:g,endLineNumber:a,endColumn:o,message:D(r.messageText,`
`),code:r.code.toString(),tags:p,relatedInformation:this._convertRelatedInformation(t,r.relatedInformation)}}_convertRelatedInformation(t,r){if(!r)return[];const l=[];return r.forEach(n=>{let u=t;if(n.file&&(u=this._libFiles.getOrCreateModel(n.file.fileName)),!u)return;const g=n.start||0,a=n.length||1,{lineNumber:o,column:p}=u.getPositionAt(g),{lineNumber:d,column:f}=u.getPositionAt(g+a);l.push({resource:u.uri,startLineNumber:o,startColumn:p,endLineNumber:d,endColumn:f,message:D(n.messageText,`
`)})}),l}_tsDiagnosticCategoryToMarkerSeverity(t){switch(t){case 1:return i.MarkerSeverity.Error;case 3:return i.MarkerSeverity.Info;case 0:return i.MarkerSeverity.Warning;case 2:return i.MarkerSeverity.Hint}return i.MarkerSeverity.Info}},C=class extends w{get triggerCharacters(){return["."]}async provideCompletionItems(e,t,r,l){const n=e.getWordUntilPosition(t),u=new i.Range(t.lineNumber,n.startColumn,t.lineNumber,n.endColumn),g=e.uri,a=e.getOffsetAt(t),o=await this._worker(g);if(e.isDisposed())return;const p=await o.getCompletionsAtPosition(g.toString(),a);return!p||e.isDisposed()?void 0:{suggestions:p.entries.map(f=>{let h=u;if(f.replacementSpan){const x=e.getPositionAt(f.replacementSpan.start),v=e.getPositionAt(f.replacementSpan.start+f.replacementSpan.length);h=new i.Range(x.lineNumber,x.column,v.lineNumber,v.column)}const y=[];return f.kindModifiers!==void 0&&f.kindModifiers.indexOf("deprecated")!==-1&&y.push(i.languages.CompletionItemTag.Deprecated),{uri:g,position:t,offset:a,range:h,label:f.name,insertText:f.name,sortText:f.sortText,kind:C.convertKind(f.kind),tags:y}})}}async resolveCompletionItem(e,t){const r=e,l=r.uri,n=r.position,u=r.offset,a=await(await this._worker(l)).getCompletionEntryDetails(l.toString(),u,r.label);return a?{uri:l,position:n,label:a.name,kind:C.convertKind(a.kind),detail:k(a.displayParts),documentation:{value:C.createDocumentationString(a)}}:r}static convertKind(e){switch(e){case c.primitiveType:case c.keyword:return i.languages.CompletionItemKind.Keyword;case c.variable:case c.localVariable:return i.languages.CompletionItemKind.Variable;case c.memberVariable:case c.memberGetAccessor:case c.memberSetAccessor:return i.languages.CompletionItemKind.Field;case c.function:case c.memberFunction:case c.constructSignature:case c.callSignature:case c.indexSignature:return i.languages.CompletionItemKind.Function;case c.enum:return i.languages.CompletionItemKind.Enum;case c.module:return i.languages.CompletionItemKind.Module;case c.class:return i.languages.CompletionItemKind.Class;case c.interface:return i.languages.CompletionItemKind.Interface;case c.warning:return i.languages.CompletionItemKind.File}return i.languages.CompletionItemKind.Property}static createDocumentationString(e){let t=k(e.documentation);if(e.tags)for(const r of e.tags)t+=`

${P(r)}`;return t}};function P(e){let t=`*@${e.name}*`;if(e.name==="param"&&e.text){const[r,...l]=e.text;t+=`\`${r.text}\``,l.length>0&&(t+=` — ${l.map(n=>n.text).join(" ")}`)}else Array.isArray(e.text)?t+=` — ${e.text.map(r=>r.text).join(" ")}`:e.text&&(t+=` — ${e.text}`);return t}var O=class extends w{constructor(){super(...arguments);_(this,"signatureHelpTriggerCharacters",["(",","])}static _toSignatureHelpTriggerReason(t){switch(t.triggerKind){case i.languages.SignatureHelpTriggerKind.TriggerCharacter:return t.triggerCharacter?t.isRetrigger?{kind:"retrigger",triggerCharacter:t.triggerCharacter}:{kind:"characterTyped",triggerCharacter:t.triggerCharacter}:{kind:"invoked"};case i.languages.SignatureHelpTriggerKind.ContentChange:return t.isRetrigger?{kind:"retrigger"}:{kind:"invoked"};case i.languages.SignatureHelpTriggerKind.Invoke:default:return{kind:"invoked"}}}async provideSignatureHelp(t,r,l,n){const u=t.uri,g=t.getOffsetAt(r),a=await this._worker(u);if(t.isDisposed())return;const o=await a.getSignatureHelpItems(u.toString(),g,{triggerReason:O._toSignatureHelpTriggerReason(n)});if(!o||t.isDisposed())return;const p={activeSignature:o.selectedItemIndex,activeParameter:o.argumentIndex,signatures:[]};return o.items.forEach(d=>{const f={label:"",parameters:[]};f.documentation={value:k(d.documentation)},f.label+=k(d.prefixDisplayParts),d.parameters.forEach((h,y,x)=>{const v=k(h.displayParts),N={label:v,documentation:{value:k(h.documentation)}};f.label+=v,f.parameters.push(N),y<x.length-1&&(f.label+=k(d.separatorDisplayParts))}),f.label+=k(d.suffixDisplayParts),p.signatures.push(f)}),{value:p,dispose(){}}}},G=class extends w{async provideHover(e,t,r){const l=e.uri,n=e.getOffsetAt(t),u=await this._worker(l);if(e.isDisposed())return;const g=await u.getQuickInfoAtPosition(l.toString(),n);if(!g||e.isDisposed())return;const a=k(g.documentation),o=g.tags?g.tags.map(d=>P(d)).join(`  

`):"",p=k(g.displayParts);return{range:this._textSpanToRange(e,g.textSpan),contents:[{value:"```typescript\n"+p+"\n```\n"},{value:a+(o?`

`+o:"")}]}}},J=class extends w{async provideDocumentHighlights(e,t,r){const l=e.uri,n=e.getOffsetAt(t),u=await this._worker(l);if(e.isDisposed())return;const g=await u.getDocumentHighlights(l.toString(),n,[l.toString()]);if(!(!g||e.isDisposed()))return g.flatMap(a=>a.highlightSpans.map(o=>({range:this._textSpanToRange(e,o.textSpan),kind:o.kind==="writtenReference"?i.languages.DocumentHighlightKind.Write:i.languages.DocumentHighlightKind.Text})))}},Q=class extends w{constructor(e,t){super(t),this._libFiles=e}async provideDefinition(e,t,r){const l=e.uri,n=e.getOffsetAt(t),u=await this._worker(l);if(e.isDisposed())return;const g=await u.getDefinitionAtPosition(l.toString(),n);if(!g||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(g.map(o=>i.Uri.parse(o.fileName))),e.isDisposed()))return;const a=[];for(let o of g){const p=this._libFiles.getOrCreateModel(o.fileName);p&&a.push({uri:p.uri,range:this._textSpanToRange(p,o.textSpan)})}return a}},q=class extends w{constructor(e,t){super(t),this._libFiles=e}async provideReferences(e,t,r,l){const n=e.uri,u=e.getOffsetAt(t),g=await this._worker(n);if(e.isDisposed())return;const a=await g.getReferencesAtPosition(n.toString(),u);if(!a||e.isDisposed()||(await this._libFiles.fetchLibFilesIfNecessary(a.map(p=>i.Uri.parse(p.fileName))),e.isDisposed()))return;const o=[];for(let p of a){const d=this._libFiles.getOrCreateModel(p.fileName);d&&o.push({uri:d.uri,range:this._textSpanToRange(d,p.textSpan)})}return o}},X=class extends w{async provideDocumentSymbols(e,t){const r=e.uri,l=await this._worker(r);if(e.isDisposed())return;const n=await l.getNavigationTree(r.toString());if(!n||e.isDisposed())return;const u=(a,o)=>{var d;return{name:a.text,detail:"",kind:m[a.kind]||i.languages.SymbolKind.Variable,range:this._textSpanToRange(e,a.spans[0]),selectionRange:this._textSpanToRange(e,a.spans[0]),tags:[],children:(d=a.childItems)==null?void 0:d.map(f=>u(f,a.text)),containerName:o}};return n.childItems?n.childItems.map(a=>u(a)):[]}},c=class{};b(c,"unknown","");b(c,"keyword","keyword");b(c,"script","script");b(c,"module","module");b(c,"class","class");b(c,"interface","interface");b(c,"type","type");b(c,"enum","enum");b(c,"variable","var");b(c,"localVariable","local var");b(c,"function","function");b(c,"localFunction","local function");b(c,"memberFunction","method");b(c,"memberGetAccessor","getter");b(c,"memberSetAccessor","setter");b(c,"memberVariable","property");b(c,"constructorImplementation","constructor");b(c,"callSignature","call");b(c,"indexSignature","index");b(c,"constructSignature","construct");b(c,"parameter","parameter");b(c,"typeParameter","type parameter");b(c,"primitiveType","primitive type");b(c,"label","label");b(c,"alias","alias");b(c,"const","const");b(c,"let","let");b(c,"warning","warning");var m=Object.create(null);m[c.module]=i.languages.SymbolKind.Module;m[c.class]=i.languages.SymbolKind.Class;m[c.enum]=i.languages.SymbolKind.Enum;m[c.interface]=i.languages.SymbolKind.Interface;m[c.memberFunction]=i.languages.SymbolKind.Method;m[c.memberVariable]=i.languages.SymbolKind.Property;m[c.memberGetAccessor]=i.languages.SymbolKind.Property;m[c.memberSetAccessor]=i.languages.SymbolKind.Property;m[c.variable]=i.languages.SymbolKind.Variable;m[c.const]=i.languages.SymbolKind.Variable;m[c.localVariable]=i.languages.SymbolKind.Variable;m[c.variable]=i.languages.SymbolKind.Variable;m[c.function]=i.languages.SymbolKind.Function;m[c.localFunction]=i.languages.SymbolKind.Function;var S=class extends w{static _convertOptions(e){return{ConvertTabsToSpaces:e.insertSpaces,TabSize:e.tabSize,IndentSize:e.tabSize,IndentStyle:2,NewLineCharacter:`
`,InsertSpaceAfterCommaDelimiter:!0,InsertSpaceAfterSemicolonInForStatements:!0,InsertSpaceBeforeAndAfterBinaryOperators:!0,InsertSpaceAfterKeywordsInControlFlowStatements:!0,InsertSpaceAfterFunctionKeywordForAnonymousFunctions:!0,InsertSpaceAfterOpeningAndBeforeClosingNonemptyParenthesis:!1,InsertSpaceAfterOpeningAndBeforeClosingNonemptyBrackets:!1,InsertSpaceAfterOpeningAndBeforeClosingTemplateStringBraces:!1,PlaceOpenBraceOnNewLineForControlBlocks:!1,PlaceOpenBraceOnNewLineForFunctions:!1}}_convertTextChanges(e,t){return{text:t.newText,range:this._textSpanToRange(e,t.span)}}},Y=class extends S{constructor(){super(...arguments);_(this,"canFormatMultipleRanges",!1)}async provideDocumentRangeFormattingEdits(t,r,l,n){const u=t.uri,g=t.getOffsetAt({lineNumber:r.startLineNumber,column:r.startColumn}),a=t.getOffsetAt({lineNumber:r.endLineNumber,column:r.endColumn}),o=await this._worker(u);if(t.isDisposed())return;const p=await o.getFormattingEditsForRange(u.toString(),g,a,S._convertOptions(l));if(!(!p||t.isDisposed()))return p.map(d=>this._convertTextChanges(t,d))}},Z=class extends S{get autoFormatTriggerCharacters(){return[";","}",`
`]}async provideOnTypeFormattingEdits(e,t,r,l,n){const u=e.uri,g=e.getOffsetAt(t),a=await this._worker(u);if(e.isDisposed())return;const o=await a.getFormattingEditsAfterKeystroke(u.toString(),g,r,S._convertOptions(l));if(!(!o||e.isDisposed()))return o.map(p=>this._convertTextChanges(e,p))}},ee=class extends S{async provideCodeActions(e,t,r,l){const n=e.uri,u=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),g=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),a=S._convertOptions(e.getOptions()),o=r.markers.filter(h=>h.code).map(h=>h.code).map(Number),p=await this._worker(n);if(e.isDisposed())return;const d=await p.getCodeFixesAtPosition(n.toString(),u,g,o,a);return!d||e.isDisposed()?{actions:[],dispose:()=>{}}:{actions:d.filter(h=>h.changes.filter(y=>y.isNewFile).length===0).map(h=>this._tsCodeFixActionToMonacoCodeAction(e,r,h)),dispose:()=>{}}}_tsCodeFixActionToMonacoCodeAction(e,t,r){const l=[];for(const u of r.changes)for(const g of u.textChanges)l.push({resource:e.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(e,g.span),text:g.newText}});return{title:r.description,edit:{edits:l},diagnostics:t.markers,kind:"quickfix"}}},te=class extends w{constructor(e,t){super(t),this._libFiles=e}async provideRenameEdits(e,t,r,l){const n=e.uri,u=n.toString(),g=e.getOffsetAt(t),a=await this._worker(n);if(e.isDisposed())return;const o=await a.getRenameInfo(u,g,{allowRenameOfImportPath:!1});if(o.canRename===!1)return{edits:[],rejectReason:o.localizedErrorMessage};if(o.fileToRename!==void 0)throw new Error("Renaming files is not supported.");const p=await a.findRenameLocations(u,g,!1,!1,!1);if(!p||e.isDisposed())return;const d=[];for(const f of p){const h=this._libFiles.getOrCreateModel(f.fileName);if(h)d.push({resource:h.uri,versionId:void 0,textEdit:{range:this._textSpanToRange(h,f.textSpan),text:r}});else throw new Error(`Unknown file ${f.fileName}.`)}return{edits:d}}},re=class extends w{async provideInlayHints(e,t,r){const l=e.uri,n=l.toString(),u=e.getOffsetAt({lineNumber:t.startLineNumber,column:t.startColumn}),g=e.getOffsetAt({lineNumber:t.endLineNumber,column:t.endColumn}),a=await this._worker(l);return e.isDisposed()?null:{hints:(await a.provideInlayHints(n,u,g)).map(d=>({...d,label:d.text,position:e.getPositionAt(d.position),kind:this._convertHintKind(d.kind)})),dispose:()=>{}}}_convertHintKind(e){switch(e){case"Parameter":return i.languages.InlayHintKind.Parameter;case"Type":return i.languages.InlayHintKind.Type;default:return i.languages.InlayHintKind.Type}}},F,A;function ae(e){A=I(e,"typescript")}function oe(e){F=I(e,"javascript")}function le(){return new Promise((e,t)=>{if(!F)return t("JavaScript not registered!");e(F)})}function ce(){return new Promise((e,t)=>{if(!A)return t("TypeScript not registered!");e(A)})}function I(e,t){const r=[],l=new U(t,e),n=(...a)=>l.getLanguageServiceWorker(...a),u=new $(n);function g(){const{modeConfiguration:a}=e;se(r),a.completionItems&&r.push(i.languages.registerCompletionItemProvider(t,new C(n))),a.signatureHelp&&r.push(i.languages.registerSignatureHelpProvider(t,new O(n))),a.hovers&&r.push(i.languages.registerHoverProvider(t,new G(n))),a.documentHighlights&&r.push(i.languages.registerDocumentHighlightProvider(t,new J(n))),a.definitions&&r.push(i.languages.registerDefinitionProvider(t,new Q(u,n))),a.references&&r.push(i.languages.registerReferenceProvider(t,new q(u,n))),a.documentSymbols&&r.push(i.languages.registerDocumentSymbolProvider(t,new X(n))),a.rename&&r.push(i.languages.registerRenameProvider(t,new te(u,n))),a.documentRangeFormattingEdits&&r.push(i.languages.registerDocumentRangeFormattingEditProvider(t,new Y(n))),a.onTypeFormattingEdits&&r.push(i.languages.registerOnTypeFormattingEditProvider(t,new Z(n))),a.codeActions&&r.push(i.languages.registerCodeActionProvider(t,new ee(n))),a.inlayHints&&r.push(i.languages.registerInlayHintsProvider(t,new re(n))),a.diagnostics&&r.push(new z(u,e,t,n))}return g(),n}function se(e){for(;e.length;)e.pop().dispose()}export{w as Adapter,ee as CodeActionAdaptor,Q as DefinitionAdapter,z as DiagnosticsAdapter,J as DocumentHighlightAdapter,Y as FormatAdapter,S as FormatHelper,Z as FormatOnTypeAdapter,re as InlayHintsAdapter,c as Kind,$ as LibFiles,X as OutlineAdapter,G as QuickInfoAdapter,q as ReferenceAdapter,te as RenameAdapter,O as SignatureHelpAdapter,C as SuggestAdapter,U as WorkerManager,D as flattenDiagnosticMessageText,le as getJavaScriptWorker,ce as getTypeScriptWorker,oe as setupJavaScript,ae as setupTypeScript};
