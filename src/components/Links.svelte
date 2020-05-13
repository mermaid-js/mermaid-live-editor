<script>
import { codeErrorStore } from '../code-error-store.js';
import {link} from 'svelte-spa-router';
import { Base64 } from 'js-base64'
import { onMount } from 'svelte';
import moment from 'moment';
import { codeStore } from '../code-store.js';

onMount(async () => {
});

export const onDownloadPNG = event => {
	var canvas = document.createElement('canvas');
	const container = document.getElementById('container');
	const svg = document.querySelector('#container svg');
	const box = svg.getBoundingClientRect();
	canvas.width = box.width;
	canvas.height = box.height;
	const context = canvas.getContext('2d');
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var image = new Image();
	image.onload = function () {
		context.drawImage(image, 0, 0);

		var a = document.createElement('a')
		a.download = `mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.png`;
		a.href = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
		a.click();
	}

	console.warn('SVG', container.innerHTML);
	image.src = `data:image/svg+xml;base64,${Base64.encode(container.innerHTML)}`;
	event.stopPropagation();
	event.preventDefault();
	event.target.download = `mermaid-diagram-${moment().format(
	'YYYYMMDDHHmmss'
)}.png`;
};
export const onDownloadSVG = event => {
	console.log('event', event.target);
	const container = document.getElementById('container');
	event.target.href = `data:image/svg+xml;base64,${Base64.encode(
		container.innerHTML
	)}`
	event.target.download = `mermaid-diagram-${moment().format(
		'YYYYMMDDHHmmss'
	)}.svg`
	console.log('event', event);
};
export const onCopyMarkdown = event => {
  event.target.select();
  document.execCommand('Copy');
}

let url = '/mermaid-live-editor/#/view';
let b64Code;
let iUrl;
let svgUrl;
let mdCode;

const unsubscribe = codeStore.subscribe(state => {
  b64Code = Base64.encodeURI(JSON.stringify(state));
  url = `/mermaid-live-editor/#/view/${b64Code}`;
  iUrl = `https://mermaid.ink/img/${b64Code}`;
  svgUrl = `https://mermaid.ink/svg/${b64Code}`;
  mdCode = `[![](${iUrl})](${window.location.protocol}//${window.location.host}${window.location.pathname}#/edit/${b64Code})`;
});
</script>

<style>
#markdown {
  padding: 7px;
  font-family: monospace;
  font-size: 14px;
  width: 300px;
}
label[for="markdown"] {
  cursor: pointer;
  color: -webkit-link;
  color: -moz-link;
  color: blue;
  text-decoration: underline;
}
</style>

<div id="links" >
	<a href="{url}" use:link>Link to view</a>
	<a href="{url}" download='' on:click={onDownloadSVG}>
		Download SVG
	</a>
	<a href={iUrl}>Link to Image</a>
	<a href={svgUrl}>Link to SVG</a>
	<a href="{url}" download='' on:click={onDownloadPNG}>
		Download PNG
	</a>
</div>
<p>
  <label for="markdown">Copy Markdown</label>
  <input id="markdown" type="text" value="{mdCode}" on:click={onCopyMarkdown} />
</p>
