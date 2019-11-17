<script>
import { errorStore } from '../error-store.js';
import {link} from 'svelte-spa-router';
import { Base64 } from 'js-base64'
import { onMount } from 'svelte';
import { codeStore } from '../code-store.js';

onMount(async () => {
});

let url = '/view';
const unsubscribe = codeStore.subscribe( state => {
	url = '/#/view/' + Base64.encode(JSON.stringify(state));
});
</script>

<style>
	#error {
		background: darkred;
		color:  white;
		flex: 1;
		padding: 10px;
		/* position: absolute; */

	}
	.invisible {
		display: none;
	}
	.visible {
		display: block;
	}
</style>

<div id="links" >
	<a href="{url}" use:link>Link to view</a>
</div>