<script lang="ts">
	import { browser } from '$app/env';

	import Card from '$lib/components/card/card.svelte';
	import { rendererUrl, krokiRendererUrl } from '$lib/util/env';
	import { base64State, codeStore } from '$lib/util/state';
	import { toBase64 } from 'js-base64';
	import moment from 'moment';
	import pako from 'pako';

	type Exporter = (context: CanvasRenderingContext2D, image: HTMLImageElement) => () => void;

	const getBase64SVG = (svg?: HTMLElement, width?: number, height?: number): string => {
		svg?.setAttribute('height', `${height}px`);
		svg?.setAttribute('width', `${width}px`); // Workaround https://stackoverflow.com/questions/28690643/firefox-error-rendering-an-svg-image-to-html5-canvas-with-drawimage
		if (!svg) {
			svg = document.querySelector('#container svg');
		}
		const svgString = svg.outerHTML
			.replaceAll('<br>', '<br/>')
			.replaceAll(/<img([^>]*)>/g, (m, g) => `<img ${g} />`);
		return toBase64(svgString);
	};

	const exportImage = (event: Event, exporter: Exporter) => {
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		const svg: HTMLElement = document.querySelector('#container svg');
		const box: DOMRect = svg.getBoundingClientRect();
		canvas.width = box.width;
		canvas.height = box.height;
		if (imagemodeselected === 'width') {
			const ratio = box.height / box.width;
			canvas.width = userimagesize;
			canvas.height = userimagesize * ratio;
		} else if (imagemodeselected === 'height') {
			const ratio = box.width / box.height;
			canvas.width = userimagesize * ratio;
			canvas.height = userimagesize;
		}

		const context = canvas.getContext('2d');
		context.fillStyle = 'white';
		context.fillRect(0, 0, canvas.width, canvas.height);

		const image = new Image();
		image.onload = exporter(context, image);
		image.src = `data:image/svg+xml;base64,${getBase64SVG(svg, canvas.width, canvas.height)}`;

		event.stopPropagation();
		event.preventDefault();
	};

	const simulateDownload = (download: string, href: string): void => {
		const a = document.createElement('a');
		a.download = download;
		a.href = href;
		a.click();
		a.remove();
	};
	const downloadImage: Exporter = (context, image) => {
		return () => {
			const { canvas } = context;
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			simulateDownload(
				`mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.png`,
				canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
			);
		};
	};

	const isClipboardAvailable = (): boolean => {
		return Object.prototype.hasOwnProperty.call(window, 'ClipboardItem') as boolean;
	};

	const clipboardCopy: Exporter = (context, image) => {
		return () => {
			const { canvas } = context;
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			canvas.toBlob((blob) => {
				try {
					// @ts-ignore: https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1004/files
					navigator.clipboard.write([
						/* eslint-disable no-undef */
						// @ts-ignore: https://github.com/microsoft/TypeScript/issues/43821
						new ClipboardItem({
							[blob.type]: blob
						})
					]);
				} catch (error) {
					console.error(error);
				}
			});
		};
	};

	const onCopyClipboard = (event: Event) => {
		exportImage(event, clipboardCopy);
	};

	const onDownloadPNG = (event: Event) => {
		exportImage(event, downloadImage);
	};

	const onDownloadSVG = () => {
		simulateDownload(
			`mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.svg`,
			`data:image/svg+xml;base64,${getBase64SVG()}`
		);
	};

	const onCopyMarkdown = () => {
		document.getElementById('markdown').select();
		document.execCommand('Copy');
	};

	let gistURL = '';
	codeStore.subscribe((state) => {
		if (state.loader?.type === 'gist') {
			// @ts-ignore Gist will have url
			gistURL = state.loader.config.url;
		}
	});

	const loadGist = () => {
		if (!gistURL) {
			alert('Please enter a Gist URL first');
		}
		window.location.href = `${window.location.pathname}?gist=${gistURL}`;
	};

	const textEncode = (str) => {
		if (window.TextEncoder) {
			return new TextEncoder('utf-8').encode(str);
		}
		let utf8 = unescape(encodeURIComponent(str));
		let result = new Uint8Array(utf8.length);
		for (let i = 0; i < utf8.length; i++) {
			result[i] = utf8.charCodeAt(i);
		}
		return result;
	};

	const onKrokiClick = () => {
		const stateCopy = JSON.parse(JSON.stringify($codeStore));
		const krokiCode = getKrokiCode(stateCopy.code);
		const krokiUrl = `${krokiRendererUrl}/mermaid/svg/${krokiCode}`;
		return window.open(krokiUrl, '_blank');
	};

	const getKrokiCode = (source) => {
		const data = textEncode(source);
		const compressed = pako.deflate(data, { level: 9, to: 'string' });
		let result = btoa(compressed).replace(/\+/g, '-').replace(/\//g, '_');
		return result;
	};

	let iUrl: string;
	let svgUrl: string;
	let mdCode: string;
	let imagemodeselected = 'auto';
	let userimagesize = 1080;

	let isNetlify = false;
	if (browser && ['mermaid.live', 'netlify'].some((path) => window.location.host.includes(path))) {
		isNetlify = true;
	}
	base64State.subscribe((encodedState: string) => {
		const stateCopy = JSON.parse(JSON.stringify($codeStore));
		if (typeof stateCopy.mermaid === 'string') {
			stateCopy.mermaid = JSON.parse(stateCopy.mermaid);
		}
		const b64Code = toBase64(JSON.stringify(stateCopy), true);
		iUrl = `${rendererUrl}/img/${b64Code}`;
		svgUrl = `${rendererUrl}/svg/${b64Code}`;
		mdCode = `[![](${iUrl})](${window.location.protocol}//${window.location.host}${window.location.pathname}#${encodedState})`;
	});
</script>

<Card title="Actions" isOpen={true}>
	<div class="flex flex-wrap gap-2 m-2">
		{#if isClipboardAvailable()}
			<button class="action-btn w-full" on:click={onCopyClipboard}
				><i class="far fa-copy mr-2" /> Copy Image to clipboard
			</button>
		{/if}
		<button class="action-btn flex-auto" on:click={onDownloadPNG}>
			<i class="fas fa-download mr-2" /> PNG
		</button>
		<button class="action-btn flex-auto" on:click={onDownloadSVG}>
			<i class="fas fa-download mr-2" /> SVG
		</button>
		<button class="action-btn flex-auto">
			<a target="_blank" href={iUrl}><i class="fas fa-external-link-alt mr-2" /> PNG</a>
		</button>
		<button class="action-btn flex-auto">
			<a target="_blank" href={svgUrl}><i class="fas fa-external-link-alt mr-2" /> SVG</a>
		</button>
		<button class="action-btn flex-auto" on:click={onKrokiClick}>
			<i class="fas fa-external-link-alt mr-2" /> Kroki
		</button>

		<div class="flex gap-2 items-center">
			PNG size
			<label for="autosize">
				<input type="radio" value="auto" id="autosize" bind:group={imagemodeselected} /> Auto
			</label>

			<label for="width">
				<input type="radio" value="width" id="width" bind:group={imagemodeselected} /> Width
			</label>

			<label for="height">
				<input type="radio" value="height" id="height" bind:group={imagemodeselected} /> Height
			</label>

			{#if imagemodeselected !== 'auto'}
				<input
					id="height"
					class="input"
					type="number"
					min="3"
					max="10000"
					bind:value={userimagesize} />
			{/if}
		</div>

		<div class="w-full flex gap-2 items-center">
			<input class="input" id="markdown" type="text" value={mdCode} on:click={onCopyMarkdown} />
			<label for="markdown">
				<button class="btn btn-primary btn-md flex-auto" on:click={onCopyMarkdown}>
					Copy Markdown
				</button>
			</label>
		</div>

		<div class="w-full flex gap-2 items-center">
			<input
				class="input"
				id="gist"
				type="text"
				bind:value={gistURL}
				placeholder="Enter Gist URL" />
			<label for="gist">
				<button class="btn btn-primary btn-md flex-auto" on:click={loadGist}> Load Gist </button>
			</label>
		</div>
		{#if isNetlify}
			<div class="w-full flex items-center justify-center">
				<a class="link underline text-gray-500 text-sm" href="https://netlify.com">
					This site is powered by Netlify
				</a>
			</div>
		{/if}
	</div>
</Card>
