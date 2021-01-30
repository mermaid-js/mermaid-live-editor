<script>
  import { codeStore } from '../code-store.js';
  import { codeErrorStore, configErrorStore } from '../error-store.js';
  import { onMount } from 'svelte';
  import mermaid from '@mermaid';

  const detectType = (text) => {
    text = text.replace(/^\s*%%.*\n/g, '\n');
    console.debug('Detecting diagram type based on the text ' + text);
    if (text.match(/^\s*sequenceDiagram/)) {
      return 'sequence';
    }

    if (text.match(/^\s*gantt/)) {
      return 'gantt';
    }

    if (text.match(/^\s*classDiagram/)) {
      return 'class';
    }

    if (text.match(/^\s*stateDiagram/)) {
      return 'state';
    }

    if (text.match(/^\s*gitGraph/)) {
      return 'git';
    }
    if (text.match(/^\s*flowchart/)) {
      return 'flowchart';
    }

    if (text.match(/^\s*info/)) {
      return 'info';
    }
    if (text.match(/^\s*pie/)) {
      return 'pie';
    }

    return 'flowchart';
  };

  // manual debounce
  let timeout;
  const saveStatistcs = (graphType) => {
    clearTimeout(timeout);
    // Only save statistcs after a 5 sec delay
    timeout = setTimeout(function () {
      console.log('ga:', 'send', 'event', 'render', graphType, graphType);
      ga('send', 'event', graphType, 'render', 'render');
    }, 5000);
  };

  let container;

  export let code = '';
  export let configClasses = '';
  export let codeClasses = '';

  onMount(async () => {
    const unsubscribe = codeStore.subscribe((state) => {
      try {
        if (container && state) {

          // Replacing special characters '<' and '>' with encoded '&lt;' and '&gt;'
          code = state.code.replace(/</g, '&lt;').replace(/>/g, '&gt;');

          container.innerHTML = code;
          saveStatistcs(detectType(code));
          delete container.dataset.processed;
          mermaid.initialize(Object.assign({}, state.mermaid));
          mermaid.init(undefined, container);
          if (code) mermaid.render('graph-div', code, insertSvg);
        }
      } catch (e) {
        console.log('view fail', e);
      }
    });
    const unsubscribeError = codeErrorStore.subscribe((_error) => {
      if (typeof _error === 'undefined') {
        codeClasses = '';
      } else {
        codeClasses = 'error';
        console.log('code error: ', _error);
      }
    });
    const unsubscribeConfigError = configErrorStore.subscribe((_error) => {
      if (typeof _error === 'undefined') {
        configClasses = '';
      } else {
        configClasses = 'error';
        console.log('conf error: ', _error);
      }
    });
  });

  let insertSvg = function (svgCode, bindFunctions) {};

</script>

<style>
  #view {
    border: 1px solor darkred;
    flex: 1;
  }
  #container {
    overflow-x: auto;
  }
  .error {
    opacity: 0.5;
  }
</style>

<div id="view" class="{codeClasses} {configClasses}">
  <div id="container" bind:this={container} />
</div>
