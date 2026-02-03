<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { env } from '$/util/env';
  import type { Snippet } from 'svelte';

  interface Props {
    closeBanner: Snippet;
  }

  let { closeBanner }: Props = $props();

  interface VariantConfig {
    bannerCopy: string;
    buttonCopy: string;
    campaign: 'variant_a' | 'variant_b' | 'variant_c';
  }

  const variants: VariantConfig[] = [
    {
      bannerCopy: 'Use code NEWYEAR for 10% off Mermaid Advanced Editor (limited time)',
      buttonCopy: 'Try now',
      campaign: 'variant_a'
    },
    {
      bannerCopy: 'Limited time: 10% off Mermaid Advanced Editor with code NEWYEAR',
      buttonCopy: 'Claim discount',
      campaign: 'variant_b'
    },
    {
      bannerCopy: 'Try Mermaid Advanced Editor — get 10% off with code NEWYEAR',
      buttonCopy: 'Get started',
      campaign: 'variant_c'
    }
  ];

  // Determine UTM source based on deployment domain
  const getUtmSource = (): string => {
    const domain = env.domain;
    if (domain === 'mermaid.ai') {
      return 'mermaid_ai_live';
    }
    return 'mermaid_live_editor';
  };

  // Randomly select a variant on component mount
  const getRandomVariant = (): VariantConfig => {
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
  };

  const selectedVariant = getRandomVariant();
  const utmSource = getUtmSource();

  const buildUrl = (variant: VariantConfig): string => {
    const params = new URLSearchParams({
      utm_medium: 'banner_ad',
      utm_campaign: variant.campaign,
      utm_source: utmSource
    });
    return `https://mermaid.ai/?${params.toString()}`;
  };
</script>

<div class="flex w-full items-center bg-[#E0095F] p-1.5" role="banner">
  <div class="grid grow">
    <a
      href={buildUrl(selectedVariant)}
      target="_blank"
      class="col-start-1 row-start-1 flex items-center justify-center gap-4 no-underline">
      <span class="text-base tracking-wider text-white">{selectedVariant.bannerCopy}</span>
      <Button
        class="shrink-0 rounded-md bg-[#1E1A2E] px-3 py-1.5 text-base font-semibold tracking-wide text-white hover:bg-[#261A56]">
        {selectedVariant.buttonCopy}
      </Button>
    </a>
  </div>
  {@render closeBanner()}
</div>
