<!-- <script context="module" ✂prettier:content✂="CglpbXBvcnQgeyBicm93c2VyLCBkZXYgfSBmcm9tICckYXBwL2Vudic7CgoJLy8gd2UgZG9uJ3QgbmVlZCBhbnkgSlMgb24gdGhpcyBwYWdlLCB0aG91Z2ggd2UnbGwgbG9hZAoJLy8gaXQgaW4gZGV2IHNvIHRoYXQgd2UgZ2V0IGhvdCBtb2R1bGUgcmVwbGFjZW1lbnQuLi4KCWV4cG9ydCBjb25zdCBoeWRyYXRlID0gZGV2OwoKCS8vIC4uLmJ1dCBpZiB0aGUgY2xpZW50LXNpZGUgcm91dGVyIGlzIGFscmVhZHkgbG9hZGVkCgkvLyAoaS5lLiB3ZSBjYW1lIGhlcmUgZnJvbSBlbHNld2hlcmUgaW4gdGhlIGFwcCksIHVzZSBpdAoJZXhwb3J0IGNvbnN0IHJvdXRlciA9IGJyb3dzZXI7CgoJLy8gc2luY2UgdGhlcmUncyBubyBkeW5hbWljIGRhdGEgaGVyZSwgd2UgY2FuIHByZXJlbmRlcgoJLy8gaXQgc28gdGhhdCBpdCBnZXRzIHNlcnZlZCBhcyBhIHN0YXRpYyBhc3NldCBpbiBwcm9kCglleHBvcnQgY29uc3QgcHJlcmVuZGVyID0gdHJ1ZTsK">{}</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div class="content">
	<h1>About this app</h1>

	<p>
		This is a <a href="https://kit.svelte.dev">SvelteKit</a> app. You can make your own by typing the
		following into your command line and following the prompts:
	</p>

	<pre>npm init svelte@next</pre>

	<p class="text-red-600	">
		The page you're looking at is purely static HTML, with no client-side interactivity needed.
		Because of that, we don't need to load any JavaScript. Try viewing the page's source, or opening
		the devtools network panel and reloading.
	</p>

	<p>
		The <a href="/todos">TODOs</a> page illustrates SvelteKit's data loading and form handling. Try using
		it with JavaScript disabled!
	</p>
</div>

<style style lang="postcss" ✂prettier:content✂="CgkuY29udGVudCB7CgkJd2lkdGg6IDEwMCU7CgkJbWF4LXdpZHRoOiB2YXIoLS1jb2x1bW4td2lkdGgpOwoJCW1hcmdpbjogdmFyKC0tY29sdW1uLW1hcmdpbi10b3ApIGF1dG8gMCBhdXRvOwoJfQo="></style> -->
<script lang="ts">
	import { browser, dev } from '$app/env';

	import type monaco from 'monaco-editor';
	import { onMount } from 'svelte';
	import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
	import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
	import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
	import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
	import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;

	let divEl: HTMLDivElement = null;
	let editor: monaco.editor.IStandaloneCodeEditor;
	let Monaco;

	onMount(async () => {
		// @ts-ignore
		self.MonacoEnvironment = {
			getWorker: function (_moduleId: any, label: string) {
				if (label === 'json') {
					return new jsonWorker();
				}
				if (label === 'css' || label === 'scss' || label === 'less') {
					return new cssWorker();
				}
				if (label === 'html' || label === 'handlebars' || label === 'razor') {
					return new htmlWorker();
				}
				if (label === 'typescript' || label === 'javascript') {
					return new tsWorker();
				}
				return new editorWorker();
			}
		};

		Monaco = await import('monaco-editor');
		editor = Monaco.editor.create(divEl, {
			value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
			language: 'javascript'
		});

		return () => {
			editor.dispose();
		};
	});
</script>

<svelte:head>
	<title>About</title>
</svelte:head>

<div bind:this={divEl} class="h-screen" />
