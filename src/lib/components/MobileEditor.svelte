<script lang="ts">
  import type { EditorProps } from '$/types';
  import {
    getCompletions,
    snippetToPlainText,
    type SuggestionKind
  } from '$/util/mermaidCompletions';
  import { validatedState } from '$/util/state.svelte';
  import { json, jsonLanguage } from '@codemirror/lang-json';
  import { markdown } from '@codemirror/lang-markdown';
  import { yamlFrontmatter } from '@codemirror/lang-yaml';
  import { language } from '@codemirror/language';
  import { Compartment, EditorState } from '@codemirror/state';
  import { EditorView } from '@codemirror/view';
  import { vsCodeDark } from '@fsegurai/codemirror-theme-vscode-dark';
  import { vsCodeLight } from '@fsegurai/codemirror-theme-vscode-light';
  import { basicSetup } from 'codemirror';
  import { mode } from 'mode-watcher';
  import { onMount } from 'svelte';

  let editorView: EditorView | undefined;
  let editorContainer: HTMLDivElement;
  // Deliberately not $state: the sync effect below both reads and writes it,
  // so a reactive currentText would make every keystroke re-run the effect
  // against the not-yet-revalidated state and revert the user's input.
  let currentText = '';
  const themeCompartment = new Compartment();
  const languageCompartment = new Compartment();

  const completionTypes: Record<SuggestionKind, string> = {
    diagram: 'class',
    identifier: 'variable',
    keyword: 'keyword',
    operator: 'keyword',
    snippet: 'text'
  };

  // CodeMirror matches completion sources by identity between updates, so the
  // source must not be recreated by the language data provider on every call.
  const mermaidCompletionSource = (context: { pos: number; state: EditorState }) => {
    const { from, suggestions, to } = getCompletions(context.state.doc.toString(), context.pos);
    if (suggestions.length === 0) {
      return null;
    }
    return {
      from,
      options: suggestions.map((suggestion) => ({
        apply: suggestion.snippet
          ? snippetToPlainText(suggestion.insertText)
          : suggestion.insertText,
        detail: suggestion.detail,
        info: suggestion.documentation,
        label: suggestion.label,
        sortText: suggestion.sortText,
        type: completionTypes[suggestion.kind]
      })),
      to
    };
  };

  const mermaidCompletions = EditorState.languageData.of(() => [
    { autocomplete: mermaidCompletionSource }
  ]);

  const { onUpdate }: EditorProps = $props();

  $effect(() => {
    editorView?.dispatch({
      effects: themeCompartment.reconfigure(mode.current === 'dark' ? vsCodeDark : vsCodeLight)
    });
  });

  onMount(() => {
    editorView = new EditorView({
      state: EditorState.create({
        doc: currentText,
        extensions: [
          basicSetup,
          languageCompartment.of([]),
          themeCompartment.of([]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newText = update.state.doc.toString();
              if (currentText === newText) {
                return;
              }
              currentText = newText;
              onUpdate(newText);
            }
          }),
          EditorView.theme({
            '&.cm-focused': {
              outline: 'none'
            },
            '&.cm-editor': {
              height: '100%'
            },
            '&.cm-scroller': {
              overflow: 'auto'
            }
          })
        ]
      }),
      parent: editorContainer
    });

    return () => {
      editorView?.destroy();
    };
  });

  $effect(() => {
    const { editorMode, code, mermaid } = validatedState.current;
    const text = editorMode === 'code' ? code : mermaid;
    if (currentText === text || !editorView) {
      return;
    }
    currentText = text;
    editorView.dispatch({
      changes: {
        from: 0,
        to: editorView.state.doc.length,
        insert: text
      }
    });
    const stateLanguage = editorView.state.facet(language);
    const isStateJson = stateLanguage === jsonLanguage;
    const isCodeJson = editorMode === 'config';
    if (stateLanguage && isStateJson === isCodeJson) {
      return;
    }
    editorView.dispatch({
      effects: languageCompartment.reconfigure(
        isCodeJson ? json() : [yamlFrontmatter({ content: markdown() }), mermaidCompletions]
      )
    });
  });
</script>

<div bind:this={editorContainer} class="size-full"></div>
