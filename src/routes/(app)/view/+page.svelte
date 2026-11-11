<script lang="ts">
  import View from '#lib/components/View.svelte';
  import { createLivePreviewSubscriber, getLivePreviewSession } from '#lib/util/livePreview.js';
  import { PanZoomState, type NormalizedViewport } from '#lib/util/panZoom.js';
  import { loadState } from '#lib/util/state.svelte.js';
  import { initHandler } from '#lib/util/util.js';
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
      // Skipping sanitizeConfig is safe: BroadcastChannel only delivers same-origin messages,
      // and the editor already sanitized this state when it loaded it. Re-sanitizing would
      // re-prompt on every keystroke if the user chose to keep an unsafe config.
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
