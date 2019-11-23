<script>
import { onMount } from 'svelte';
import Editor from '../components/Editor.svelte';
import Config from '../components/Config.svelte';
import View from '../components/View.svelte';
import Card from '../components/Card.svelte';
import Tag from '../components/Tag.svelte';
import Links from '../components/Links.svelte';
import { fromUrl } from '../code-store.js';
import pkg from '@mermaid-js/mermaid/package.json'

export let mermaidVersion = pkg.version

onMount(async () => {
	ga('send', 'pageview');
	fromUrl(params.data);
});

	export let code = '';
	export let classes = '';

	export let error = {};
	export let token = '';
	export let expected = '';
	export let params = {};

</script>

<style>
	#editor-root {
		display: flex;
		height: 100%;
	}

	#col1 {
		width: 35%;
	}
	#col2 {
		width: 65%;
		padding-left: 32px;
	}
	#app-title {
		border-bottom:  1px solid lightgrey;
		padding-bottom: 32px;
		margin-bottom: 32px;
		font-size: 28px;
		font-weight: 400;
		margin-top: 0;
	}

	#power {
		width: 100%;
    display: flex;
    justify-content: flex-end;
		align-items: center;
	}

</style>
<div>
	<h1 id="app-title">Mermaid Live Editor</h1>
	<div id="editor-root">
		<div id="col1">
			<Card title="Code" noPadding="true"><Editor data={params.data}/></Card>
			<Card title="Mermaid Configuration" ><Config /></Card>
		</div>
		<div id="col2">
			<Card title="Preview"><View /></Card>
			<Card title="Actions"><Links /></Card>
			<div id="power">
				Powered by mermaid <Tag color='green'>{mermaidVersion}</Tag>
			</div>
		</div>
	</div>
</div>