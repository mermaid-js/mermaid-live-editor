<script>
import { codeStore } from '../code-store.js';
import { errorStore } from '../error-store.js';
import { onMount } from 'svelte';
import mermaid from 'mermaid';

let element;
let container;
onMount(async () => {
	element = document.querySelector("graph-div");
});

let insertSvg = function(svgCode, bindFunctions){
	// element.innerHTML = svgCode;
};

	export let code = '';
	export let classes = '';
	const unsubscribe = codeStore.subscribe( state => {
		try {
			if(container && state) {
				code = state.code;
				container.innerHTML = code;
				delete container.dataset.processed
				mermaid.init(undefined, container)
				if(code) mermaid.render('graph-div', code, insertSvg);
			}
		} catch(e) {
			console.log('view fail', e);
		}

	});
	const unsubscribeError = errorStore.subscribe( _error => {
		if(typeof _error === 'undefined') {
			classes = '';
		} else {
			classes = 'error';
			console.log('error: ', typeof _error);
		}
	});
</script>

<style>
	#view {
		border: 1px solor darkred;
		flex: 1;
	}
	.error {
		opacity: 0.5;
	}
</style>

<div id="view" class="{classes}">
	<div bind:this={container}></div>
</div>