<script lang="ts">
  import View from '$/components/View.svelte';
  import { createLivePreviewSubscriber, getLivePreviewSession } from '$/util/livePreview';
  import { PanZoomState, type NormalizedViewport } from '$/util/panZoom';
  import { loadState } from '$/util/state.svelte';
  import { initHandler } from '$/util/util';
  import { onMount } from 'svelte';

  const panZoomState = new PanZoomState();
  let isLivePreview = $state(false);
  let normalizedViewport = $state.raw<NormalizedViewport>();

  onMount(() => {
    const sessionId = getLivePreviewSession(window.location.search);
    isLivePreview = sessionId !== undefined;
    void initHandler();
    if (!sessionId) {
      return;
    }

    const subscriber = createLivePreviewSubscriber(sessionId, (serialized, viewport) => {
      normalizedViewport = viewport;
      loadState(serialized, { sanitize: false });
    });
    return () => subscriber?.close();
  });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<View
  {isLivePreview}
  {normalizedViewport}
  {panZoomState}
  shouldShowGrid={false}
  updatePanZoomState={false} />
