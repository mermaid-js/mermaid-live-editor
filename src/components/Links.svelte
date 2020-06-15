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
	if(imagemodeselected === "width") {
		const ratio = box.height/box.width;
		canvas.width = userimagewidth;
		canvas.height = userimagewidth * ratio;
	} else if(imagemodeselected === "height") {
		const ratio = box.width/box.height;
		canvas.width = userimageheight * ratio;
		canvas.height = userimageheight;
	}
	const context = canvas.getContext('2d');
	context.fillStyle = "white";
	context.fillRect(0, 0, canvas.width, canvas.height);

	var image = new Image();
	image.onload = function () {
		context.drawImage(image, 0, 0, canvas.width, canvas.height);

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
let imagemodeselected = "auto";
let userimagewidth = 1920;
let userimageheight = 1080;

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
<p>
  <label>PNG size:</label>
  <input type="radio" value="auto" id="autosize" bind:group={imagemodeselected}>
  <label for="autosize">auto</label>
  <input type="radio" value="width" id="width-active" bind:group={imagemodeselected}>
  <label for="width">width</label>
  <input id="width" type="number" min="3" max="10000" bind:value={userimagewidth} disabled={imagemodeselected !== "width"}>
  <input type="radio" value="height" id="height-active" bind:group={imagemodeselected}>
  <label for="height">height</label>
  <input id="height" type="number" min="3" max="10000" bind:value={userimageheight} disabled={imagemodeselected !== "height"}><br>
</p>
