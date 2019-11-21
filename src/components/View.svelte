<script>
import { codeStore } from '../code-store.js';
import { errorStore } from '../error-store.js';
import { configStore } from '../config-store.js';
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
	export let configClasses = '';
	export let codeClasses = '';
	const unsubscribe = codeStore.subscribe( state => {
		try {
			if(container && state) {
				code = state.code;
				container.innerHTML = code;
				delete container.dataset.processed
				mermaid.initialize(state.mermaid)
				mermaid.init(undefined, container)
				if(code) mermaid.render('graph-div', code, insertSvg);
			}
		} catch(e) {
			console.log('view fail', e);
		}

	});
	const unsubscribeError = errorStore.subscribe( _error => {
		if(typeof _error === 'undefined') {
			codeClasses = '';
		} else {
			codeClasses = 'error';
			console.log('code error: ', _error);
		}
	});
	const unsubscribeConfigError = configStore.subscribe( _error => {
		if(typeof _error === 'undefined') {
			configClasses = '';
		} else {
			configClasses = 'error';
			console.log('conf error: ', _error);
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

<div id="view" class="{codeClasses} {configClasses}">
	<div id="container" bind:this={container}></div>
</div>