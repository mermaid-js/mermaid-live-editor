<script>
import { codeErrorStore } from '../code-error-store.js';
import { onMount } from 'svelte';

onMount(async () => {
});

	// export let code = '';
	export let classes = '';

	// export let error = {};
	// export let token = '';
	// export let expected = '';

	// export let params = {}
	export let errorText = '';


// const unsubscribeError = codeErrorStore.subscribe( _error => {
// 		if(typeof _error === 'undefined') {
// 			classes = 'invisible';
// 			error = {};
// 			token='';
// 			expected='';
// 		} else {
// 			classes = 'visible';
// 			error = _error;
// 			console.log('error: ',  _error);
// 			token = error.hash.token;
// 			expected = error.hash.expected.join(' ');;
// 		}
// 	});
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

<div id="error" class="{classes}">{errorText}
</div>