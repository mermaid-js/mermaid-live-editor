<script>
import { onMount } from 'svelte';
import { updateCodeStore } from '../code-store.js';
import Editor from '../components/Editor.svelte';
import Config from '../components/Config.svelte';
import View from '../components/View.svelte';
import Card from '../components/Card.svelte';
import Tag from '../components/Tag.svelte';
import Links from '../components/Links.svelte';
import { fromUrl } from '../code-store.js';
// import pkg from '@mermaid-js/mermaid/package.json'
import pkg from '@mermaid/package.json'

export let mermaidVersion = pkg.version

onMount(async () => {
	ga('send', 'pageview');
	ga('send', 'event', 'version', mermaidVersion, mermaidVersion);
	fromUrl(params.data);
});

	// export let code = '';
	// export let classes = '';

	// export let error = {};
	// export let token = '';
	// export let expected = '';
	export let params = {};

	function loadFlowChart(){
		loadSampleDiagram('FlowChart');
	}
	function loadSequenceDiagram(){
		loadSampleDiagram('SequenceDiagram');
	}
	function loadClassDiagram(){
		loadSampleDiagram('ClassDiagram');
	}
	function loadStateDiagram(){
		loadSampleDiagram('StateDiagram');
	}
	function loadGanttChart(){
		loadSampleDiagram('GanttChart');
	}
	function loadPieChart(){
		loadSampleDiagram('PieChart');
	}
	function loadERDiagram(){
		loadSampleDiagram('ERDiagram');
	}

    function loadSampleDiagram(diagramType){
		let code =''
		switch(diagramType){
			case 'FlowChart' :
			code = `graph TD
	A[Christmas] -->|Get money| B(Go shopping)
	B --> C{Let me think}
	C -->|One| D[Laptop]
	C -->|Two| E[iPhone]
	C -->|Three| F[fa:fa-car Car]
					`;
			break;

			case 'SequenceDiagram' :
			code = `sequenceDiagram
	Alice->>+John: Hello John, how are you?
	Alice->>+John: John, can you hear me?
	John-->>-Alice: Hi Alice, I can hear you!
	John-->>-Alice: I feel great!
					`;
			break;

			case 'ClassDiagram' :
			code = `classDiagram
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
					`;
			break;

			case 'StateDiagram' :
			code = `stateDiagram
	[*] --> Still
	Still --> [*]

	Still --> Moving
	Moving --> Still
	Moving --> Crash
	Crash --> [*]
					`;
			break;

			case 'GanttChart' :
			code = `gantt
	title A Gantt Diagram
	dateFormat  YYYY-MM-DD
	section Section
	A task           :a1, 2014-01-01, 30d
	Another task     :after a1  , 20d
	section Another
	Task in sec      :2014-01-12  , 12d
	another task      : 24d
					`;
			break;

		case 'PieChart' :
			code = `pie title Pets adopted by volunteers
	"Dogs" : 386
	"Cats" : 85
	"Rats" : 15
					`;
			break;
		case 'ERDiagram' :
			code = `erDiagram
        CUSTOMER }|..|{ DELIVERY-ADDRESS : has
        CUSTOMER ||--o{ ORDER : places
        CUSTOMER ||--o{ INVOICE : "liable for"
        DELIVERY-ADDRESS ||--o{ ORDER : receives
        INVOICE ||--|{ ORDER : covers
        ORDER ||--|{ ORDER-ITEM : includes
        PRODUCT-CATEGORY ||--|{ PRODUCT : contains
        PRODUCT ||--o{ ORDER-ITEM : "ordered in"
					`;
			break;
		}

		let newState = { code, mermaid: { theme: 'default' }, updateEditor:true };
		updateCodeStore(newState);

	}

</script>

<style>
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
	#app-title {
		border-bottom:  1px solid lightgrey;
		padding-bottom: 32px;
		margin-bottom: 32px;
		font-size: 28px;
		font-weight: 400;
		margin-top: 0;
	}

	#power {
		width: 100%;
    display: flex;
    justify-content: flex-end;
		align-items: center;
	}

	#sampleLoader {
		padding-bottom: 10px;
		padding-left:10px;

	}
	.botton-container{
		margin-top:5px;
	}

</style>
<div>
	<h1 id="app-title">Mermaid Live Editor</h1>
	<div id="editor-root">
		<div id="col1">
			<Card title="Code" noPadding="true">
			<div id="sampleLoader">Load sample diagram :<br/>
				<div class="botton-container">
				<button on:click={loadFlowChart}>Flow Chart</button>
				<button on:click={loadSequenceDiagram}>Sequence Diagram</button>
				<button on:click={loadClassDiagram}>Class Diagram</button>
				<button on:click={loadStateDiagram}>State Diagram</button>
				<button on:click={loadGanttChart}>Gantt Chart</button>
				<button on:click={loadPieChart}>Pie Chart </button>
				<button on:click={loadERDiagram}>ER Diagram </button>
			</div>
			</div>
				<Editor data={params.data}/>
			</Card>
			<Card title="Mermaid Configuration" ><Config /></Card>
			<Card title='Links'>
				<ul className='marketing-links'>
					<li>
						<a href='https://mermaid-js.github.io/mermaid' target='_blank'>
							Mermaid Documentation
						</a>
					</li>
					<li>
						<a href='https://github.com/mermaid-js/mermaid' target='_blank'>
							Mermaid on GitHub
						</a>
					</li>
					<li>
						<a
							href='https://github.com/mermaid-js/mermaid-live-editor'
							target='_blank'
						>
							Live Editor on GitHub
						</a>
					</li>
					<li>
						<a
							href='https://github.com/mermaid-js/mermaid.cli'
							target='_blank'
						>
							Mermaid CLI
						</a>
					</li>
				</ul>
			</Card>
		</div>
		<div id="col2">
			<Card title="Preview"><View /></Card>
			<Card title="Actions"><Links /></Card>
			<div id="power">
				Powered by mermaid <Tag color='green'>{mermaidVersion}</Tag>
			</div>
		</div>
	</div>
</div>