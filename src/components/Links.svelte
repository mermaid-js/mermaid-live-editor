<script>
  import { Base64 } from 'js-base64';
  import moment from 'moment';
  import { codeStore } from '../code-store.js';

  const getBase64SVG = () => {
    const container = document.getElementById('container');
    const svg = container.innerHTML.replaceAll('<br>', '<br/>');
    return Base64.encode(svg);
  };

  const exportImage = (event, exporter) => {
    const canvas = document.createElement('canvas');
    const svg = document.querySelector('#container svg');
    const box = svg.getBoundingClientRect();
    canvas.width = box.width;
    canvas.height = box.height;
    if (imagemodeselected === 'width') {
      const ratio = box.height / box.width;
      canvas.width = userimagewidth;
      canvas.height = userimagewidth * ratio;
    } else if (imagemodeselected === 'height') {
      const ratio = box.width / box.height;
      canvas.width = userimageheight * ratio;
      canvas.height = userimageheight;
    }
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const image = new Image();
    image.onload = exporter(canvas, context, image);

    console.log('SVG', getBase64SVG());
    image.src = `data:image/svg+xml;base64,${getBase64SVG()}`;
    event.stopPropagation();
    event.preventDefault();
  };

  const downloadImage = (canvas, context, image) => {
    return () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const a = document.createElement('a');
      a.download = `mermaid-diagram-${moment().format('YYYYMMDDHHmmss')}.png`;
      a.href = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      a.click();
    };
  };

  const isClipboardAvailable = () => {
    return window.hasOwnProperty('ClipboardItem');
  };

  const clipboardCopy = (canvas, context, image) => {
    return () => {
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        try {
          navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
        } catch (error) {
          console.error(error);
        }
      });
    };
  };

  const onCopyClipboard = (event) => {
    exportImage(event, clipboardCopy);
  };

  const onDownloadPNG = (event) => {
    exportImage(event, downloadImage);
  };

  const onDownloadSVG = (event) => {
    console.log('event', event.target);
    event.target.href = `data:image/svg+xml;base64,${getBase64SVG()}`;
    event.target.download = `mermaid-diagram-${moment().format(
      'YYYYMMDDHHmmss'
    )}.svg`;
    console.log('event', event);
  };

  const onCopyMarkdown = (event) => {
    event.target.select();
    document.execCommand('Copy');
  };

  let url;
  let b64Code;
  let iUrl;
  let svgUrl;
  let mdCode;
  let imagemodeselected = 'auto';
  let userimagewidth = 1920;
  let userimageheight = 1080;

  const unsubscribe = codeStore.subscribe((state) => {
    b64Code = Base64.encodeURI(JSON.stringify(state));
    url = `${window.location.pathname.split('#')[0]}#/view/${b64Code}`;
    iUrl = `https://mermaid.ink/img/${b64Code}`;
    svgUrl = `https://mermaid.ink/svg/${b64Code}`;
    mdCode = `[![](${iUrl})](${window.location.protocol}//${window.location.host}${window.location.pathname}#/edit/${b64Code})`;
  });
</script>

<style>
  #links {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid lightgray;
  }
  #markdown {
    padding: 7px;
    font-family: monospace;
    font-size: 14px;
    width: 95%;
    margin: 1rem 0;
    border: 1px solid lightgray;
  }
  label[for='markdown'] {
    cursor: pointer;
    margin: 0 auto;
  }
  /*
    @media (prefers-color-scheme: dark) {
        label[for="markdown"] {
            color: #d8d8d8;
        }
    } */
  .button-style {
    background-color: #a2d9e2;
    color: #33a2c4;
    border-radius: 0.25rem;
    padding: 0.5rem;
    border: 1px solid #a2d9e2;
    margin: 0.25rem;
  }
  .button-style:hover {
    background-color: #fff;
    color: #33a2c4;
    border: 1px solid #33a2c4;
  }
  .button-style:focus {
    outline: none;
  }
  .link-style {
    text-decoration: none;
    color: #33a2c4;
  }
  #copy-section {
    padding-top: 1rem;
    text-align: center;
  }
</style>

<div id="links">
  {#if isClipboardAvailable()}
    <button class="button-style">
      <a class="link-style" href={url} download="" on:click={onCopyClipboard}>
        Copy Image
      </a>
    </button>
  {/if}
  <button class="button-style">
    <a class="link-style" href={url} download="" on:click={onDownloadPNG}>
      Download PNG
    </a>
  </button>
  <button class="button-style">
    <a class="link-style" href={url}>Link to view</a>
  </button>
  <button class="button-style">
    <a class="link-style" href={url} download="" on:click={onDownloadSVG}>
      Download SVG
    </a>
  </button>
  <button class="button-style">
    <a class="link-style" href={iUrl}>Link to Image</a>
  </button>
  <button class="button-style">
    <a class="link-style" href={svgUrl}>Link to SVG</a>
  </button>
  (markdown is base64 encoded for these urls)
</div>
<div id="copy-section">
  <label for="markdown" class="button-style">Copy Markdown</label>
  <br />
  <input id="markdown" type="text" value={mdCode} on:click={onCopyMarkdown} />
</div>
<p>
  <label>PNG size:</label><br />
  <input
    type="radio"
    value="auto"
    id="autosize"
    bind:group={imagemodeselected} />
  <label for="autosize">auto</label><br />
  <input
    type="radio"
    value="width"
    id="width-active"
    bind:group={imagemodeselected} />
  <label for="width">width</label>
  <input
    id="width"
    type="number"
    min="3"
    max="10000"
    bind:value={userimagewidth}
    disabled={imagemodeselected !== 'width'} /><br />
  <input
    type="radio"
    value="height"
    id="height-active"
    bind:group={imagemodeselected} />
  <label for="height">height</label>
  <input
    id="height"
    type="number"
    min="3"
    max="10000"
    bind:value={userimageheight}
    disabled={imagemodeselected !== 'height'} /><br />
</p>
