<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { C } from '$/constants';
  import { MCBaseURL } from '$/util/util';
  import { onDestroy, type Snippet } from 'svelte';
  import { fade } from 'svelte/transition';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  interface Taglines {
    label: string;
    url: {
      path: string;
      params: Record<string, string>;
    };
  }

  const commonParams = { utm_source: C.utmSource, utm_medium: 'banner_ad' } as const;

  const randomTagLines: Taglines[] = [
    {
      label: 'Customize your layout and design in Mermaid Chart’s whiteboard!',
      url: {
        path: '/whiteboard',
        params: { utm_campaign: 'whiteboard' }
      }
    },
    {
      label: 'Customize your layout and design in Mermaid Chart’s visual editor!',
      url: {
        path: '/whiteboard',
        params: { utm_campaign: 'visual_editor' }
      }
    },
    {
      label: 'Customize your layout and design with Mermaid Chart’s GUI!',
      url: {
        path: '/whiteboard',
        params: { utm_campaign: 'GUI' }
      }
    },
    {
      label: 'Customize your layout and design in Mermaid Chart!',
      url: {
        path: '/whiteboard',
        params: { utm_campaign: 'visual_editor_whiteboard_gui' }
      }
    }
  ];

  let taglines: Taglines[] = [
    {
      label: 'Replace ChatGPT Pro, Mermaid.live, and Lucid Chart with Mermaid Chart',
      url: {
        path: '/mermaid-ai',
        params: { utm_campaign: 'aibundle' }
      }
    },
    {
      label: 'Diagram live with teammates in Mermaid Chart',
      url: {
        path: '/landing',
        params: { utm_campaign: 'team_collaboration' }
      }
    }
  ];
  let selectedHeadlineIndex = getSessionHeadlineIndex();

  let currentBannerSet = [...taglines, randomTagLines[selectedHeadlineIndex]];

  let index = Math.floor(Math.random() * currentBannerSet.length);
  let currentTagline = $state(currentBannerSet[index]);

  const interval = setInterval(() => {
    if (shouldAnimate) {
      index = (index + 1) % currentBannerSet.length;
      currentTagline = currentBannerSet[index];
    }
  }, 5000);

  function getSessionHeadlineIndex(): number {
    const storedIndex = sessionStorage.getItem('mermaidBannerIndex');

    if (storedIndex === null) {
      const newIndex = Math.floor(Math.random() * randomTagLines.length);
      sessionStorage.setItem('mermaidBannerIndex', newIndex.toString());
      return newIndex;
    }

    return Number.parseInt(storedIndex, 10);
  }

  onDestroy(() => {
    clearInterval(interval);
  });

  let shouldAnimate = $state(true);
</script>

<div
  class="flex w-full items-center bg-[#E0095F] p-1.5"
  role="banner"
  onmouseenter={() => (shouldAnimate = false)}
  onmouseleave={() => (shouldAnimate = true)}>
  <div class="grid grow">
    {#key currentTagline}
      <a
        href="{MCBaseURL}{currentTagline.url.path}?{new URLSearchParams({
          ...commonParams,
          ...currentTagline.url.params
        }).toString()}"
        target="_blank"
        class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline"
        in:fade={{ delay: 800 }}
        out:fade={{ duration: 1000 }}>
        <span class="text-sm tracking-wider text-white">{currentTagline.label}</span>
        <Button
          class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-sm font-semibold tracking-wide text-white hover:bg-[#261A56]">
          Try now
        </Button>
      </a>
    {/key}
  </div>
  {@render closeBanner()}
</div>
