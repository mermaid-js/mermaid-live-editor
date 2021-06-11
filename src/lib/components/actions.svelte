<script lang="ts">
	import Card from '$lib/components/card/card.svelte';
	import type { State } from '$lib/types';
	import { base64State, codeStore } from '$lib/util/state';
	import { toBase64 } from 'js-base64';
	import moment from 'moment';

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

	const onCopyMarkdown = (event: Event) => {
		event.target.select();
		document.execCommand('Copy');
	};

	let iUrl: string;
	let svgUrl: string;
	let mdCode: string;
	let imagemodeselected = 'auto';
	let userimagesize = 1080;

	codeStore.subscribe((state: State) => {
		const stateCopy = JSON.parse(JSON.stringify(state));
		if (typeof stateCopy.mermaid === 'string') {
			stateCopy.mermaid = JSON.parse(stateCopy.mermaid);
		}
		const b64Code = toBase64(JSON.stringify(stateCopy), true);
		iUrl = `https://mermaid.ink/img/${b64Code}`;
		svgUrl = `https://mermaid.ink/svg/${b64Code}`;
		mdCode = `[![](${iUrl})](${window.location.protocol}//${window.location.host}${window.location.pathname}#${window.location.hash})`;
	});
</script>

<Card title="Actions" isOpen={false}>
	<div class="flex flex-wrap gap-2 m-2">
		{#if isClipboardAvailable()}
			<button class="action-btn w-full" on:click={onCopyClipboard}
				><i class="far fa-copy" /> Copy Image to clipboard
			</button>
		{/if}
		<button class="action-btn flex-auto" on:click={onDownloadPNG}>
			<i class="fas fa-download" /> PNG
		</button>
		<button class="action-btn flex-auto" on:click={onDownloadSVG}>
			<i class="fas fa-download" /> SVG
		</button>
		<button class="action-btn flex-auto">
			<a target="_blank" href={iUrl}><i class="fas fa-external-link-alt" /> PNG</a>
		</button>
		<button class="action-btn flex-auto">
			<a target="_blank" href={svgUrl}><i class="fas fa-external-link-alt" /> SVG</a>
		</button>

		<div class="flex gap-2 items-center">
			PNG size
			<input type="radio" value="auto" id="autosize" bind:group={imagemodeselected} />
			<label for="autosize">Auto</label>
			<input type="radio" value="width" id="width-active" bind:group={imagemodeselected} />
			<label for="width">Width</label>
			<input type="radio" value="height" id="height-active" bind:group={imagemodeselected} />
			<label for="height">Height</label>
			{#if imagemodeselected !== 'auto'}
				<input id="height" type="number" min="3" max="10000" bind:value={userimagesize} />
			{/if}
		</div>

		<div class="w-full flex gap-2 items-center">
			<label for="markdown">Copy Markdown</label>
			<input class="flex-1" id="markdown" type="text" value={mdCode} on:click={onCopyMarkdown} />
		</div>
	</div>
</Card>
