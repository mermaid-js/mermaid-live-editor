<script lang="ts">
  import View from '$/components/View.svelte';
  import { createLivePreviewSubscriber, getLivePreviewSession } from '$/util/livePreview';
  import { deserializeState } from '$/util/serde';
  import { replaceInputState } from '$/util/state.svelte';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';

  onMount(() => {
    void initHandler();
    const sessionId = getLivePreviewSession(window.location.search);
    if (!sessionId) {
      return;
    }

    const subscriber = createLivePreviewSubscriber(sessionId, (serialized) => {
      try {
        replaceInputState(deserializeState(serialized));
      } catch (error) {
        console.error('Unable to load live preview state', error);
      }
    });
    return () => subscriber?.close();
  });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<View shouldShowGrid={false} />
