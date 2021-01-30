<script>
  import { onMount } from 'svelte';
  import { codeStore, updateCode, updateCodeStore } from '../code-store.js';
  import Editor from '../components/Editor.svelte';
  import Config from '../components/Config.svelte';
  import View from '../components/View.svelte';
  import Card from '../components/Card.svelte';
  import Tag from '../components/Tag.svelte';
  import Links from '../components/Links.svelte';
  import { fromUrl } from '../code-store.js';
  import pkg from '@mermaid/package.json';
  import moment from 'moment';
  export let mermaidVersion = pkg.version;
  let historyList = [];
  onMount(async () => {
    ga('send', 'pageview');
    ga('send', 'event', 'version', mermaidVersion, mermaidVersion);

    const historyListKey = '_mermaid_history_';
    historyList = JSON.parse(localStorage.getItem(historyListKey) || '[]');
    let hisCode =
      historyList.length > 0 ? historyList[historyList.length - 1] : null;

    if (params.data) {
      fromUrl(params.data);
    } else if (hisCode) {
      updateCodeStore({
        code: hisCode.code,
        mermaid: {},
        updateEditor: true,
      });
    } else {
      loadSampleDiagram('Flow Chart');
    }

    let code = null;
    codeStore.subscribe((state) => {
      code = (state && state.code) || code;
    });

    setInterval(() => {
      if (code != hisCode) {
        //save history
        historyList.unshift({
          time: new Date().toISOString(),
          code: (hisCode = code),
        });
        if (historyList.length > 10) {
          historyList.pop();
        }
        localStorage.setItem(historyListKey, JSON.stringify(historyList));
      }
      historyList = historyList; //triggered update
    }, 1 * 60 * 1000);
  });

  export let params = {};
  const samples = {
    'Flow Chart': `graph TD
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[fa:fa-car Car]`,
    'Sequence Diagram': `sequenceDiagram
    Alice->>+John: Hello John, how are you?
    Alice->>+John: John, can you hear me?
    John-->>-Alice: Hi Alice, I can hear you!
    John-->>-Alice: I feel great!
            `,
    'Class Diagram': `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }
            `,
    'State Diagram': `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]
            `,
    'Gantt Chart': `gantt
    title A Gantt Diagram
    dateFormat  YYYY-MM-DD
    section Section
    A task           :a1, 2014-01-01, 30d
    Another task     :after a1  , 20d
    section Another
    Task in sec      :2014-01-12  , 12d
    another task      : 24d
            `,
    'Pie Chart': `pie title Pets adopted by volunteers
    "Dogs" : 386
    "Cats" : 85
    "Rats" : 15
            `,
    'ER Diagram': `erDiagram
          CUSTOMER }|..|{ DELIVERY-ADDRESS : has
          CUSTOMER ||--o{ ORDER : places
          CUSTOMER ||--o{ INVOICE : "liable for"
          DELIVERY-ADDRESS ||--o{ ORDER : receives
          INVOICE ||--|{ ORDER : covers
          ORDER ||--|{ ORDER-ITEM : includes
          PRODUCT-CATEGORY ||--|{ PRODUCT : contains
          PRODUCT ||--o{ ORDER-ITEM : "ordered in"
            `,
  };

  function loadSampleDiagram(diagramType) {
    toUpdateCodeStore(samples[diagramType]);
  }

  function toUpdateCodeStore(code) {
    if (!code) return;
    updateCode(code, true);
  }

  function relativeTime(t) {
    return `${moment(t).fromNow()} (${new Date(t).toLocaleString()})`;
  }
</script>

<style>
  #body {
    font-family: 'Roboto', sans-serif;
    background-color: #fcfbfc;
  }
  #editor-root {
    display: flex;
    height: 100%;
  }
  #col1 {
    width: 35%;
  }
  #col2 {
    width: 65%;
    padding-left: 32px;
  }
  #link-root {
    display: flex;
    height: fit-content;
  }
  #link-col1 {
    width: 50%;
  }
  #link-col2 {
    width: 50%;
    padding-left: 32px;
  }
  #app-title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    color: #1e60ab;
    opacity: 0.8;
  }
  #title-container {
    width: fit-content;
    margin: 0 auto 8px;
  }
  #power {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    height: 4rem;
  }
  #sampleLoader {
    padding-left: 10px;
    border-bottom: 1px solid lightgray;
  }
  #historyLoaderSubTitle {
    display: inline-block;
    color: #33a2c4;
    font-size: small;
    font-style: italic;
  }
  .button-container {
    display: flex;
    align-items: center;
    flex-direction: row;
    flex-wrap: wrap;
  }
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
</style>

<div id="body">
  <div id="title-container">
    <h1 id="app-title">Mermaid Live Editor</h1>
  </div>
  <div id="sampleLoader">
    <div class="button-container">
      <span id="sampleLoaderTitle"><strong>Diagram presets:</strong></span>
      {#each Object.keys(samples) as diagramType, i}
        <button
          class="button-style"
          on:click={(e) => loadSampleDiagram(diagramType)}>
          {diagramType}
        </button>
      {/each}
    </div>
  </div>
  <div id="editor-root">
    <div id="col1">
      <Card title="Code" noPadding="true">
        <Editor data={params.data} />
      </Card>
      <Card title="Mermaid Configuration">
        <Config />
      </Card>
    </div>
    <div id="col2">
      <Card title="Preview">
        <View />
      </Card>
      <div id="link-root">
        <div id="link-col1">
          <Card title="Editing history">
            <span id="historyLoaderSubTitle">Automatically saves once every
              minute, up to 10 records.</span>
            <br />
            <div id="historyList" class="button-container">
              {#if historyList.length > 0}
                {#each historyList as item, i}
                  <button
                    class="button-style"
                    on:click={(e) => toUpdateCodeStore(item.code)}>
                    {relativeTime(item.time)}
                  </button>
                {/each}
              {:else}No records.{/if}
            </div>
          </Card>
          <Card title="Links">
            <div class="button-container">
              <button class="button-style">
                <a
                  href="https://mermaid-js.github.io/mermaid"
                  target="_blank"
                  class="link-style">
                  Mermaid Documentation
                </a>
              </button>
              <button class="button-style">
                <a
                  href="https://github.com/mermaid-js/mermaid"
                  target="_blank"
                  class="link-style">
                  Mermaid on GitHub
                </a>
              </button>
              <button class="button-style">
                <a
                  href="https://github.com/mermaid-js/mermaid-live-editor"
                  target="_blank"
                  class="link-style">
                  Live Editor on GitHub
                </a>
              </button>
              <button class="button-style">
                <a
                  href="https://github.com/mermaid-js/mermaid-cli"
                  target="_blank"
                  class="link-style">
                  Mermaid CLI
                </a>
              </button>
            </div>
          </Card>
        </div>
        <div id="link-col2">
          <Card title="Actions">
            <Links />
          </Card>
        </div>
      </div>
    </div>
  </div>
  <div id="power">
    Powered by mermaid
    <Tag color="green">{mermaidVersion}</Tag>
  </div>
</div>
