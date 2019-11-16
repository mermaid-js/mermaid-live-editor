<script>
import { errorStore } from '../error-store.js';
import { onMount } from 'svelte';

onMount(async () => {
});

	export let code = '';
	export let classes = '';

	export let error = {};
	export let token = '';
	export let expected = '';

	export let params = {}


const unsubscribeError = errorStore.subscribe( _error => {
		if(typeof _error === 'undefined') {
			classes = 'invisible';
			error = {};
			token='';
			expected='';
		} else {
			classes = 'visible';
			error = _error;
			console.log('error: ',  _error);
			token = error.hash.token;
			expected = error.hash.expected.join(' ');;
		}
	});
</script>

<style>
	#error {
		border: 1px solid darkred;
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

<div id="error" class="{classes}">
	<div>Expected: {expected}</div>
	<br/>
	<div>Got: {token}</div>
</div>