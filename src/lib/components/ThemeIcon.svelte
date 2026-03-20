<script lang="ts">
  import { diagramThemeId } from '$lib/themes/theme-store';
  import { cubicInOut } from 'svelte/easing';
  import { type TransitionConfig } from 'svelte/transition';
  import ArchitectureIcon from '~icons/material-symbols/draw-outline-rounded';
  import GlassIcon from '~icons/material-symbols/kid-star-outline';
  import NeonIcon from '~icons/material-symbols/bolt-rounded';
  import SunIcon from '~icons/material-symbols/light-mode-outline-rounded';

  const spin = (
    node: Element,
    { duration = 400, easing = cubicInOut, clockWise = true } = {}
  ): TransitionConfig => {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const transform = style.transform === 'none' ? '' : style.transform;
    return {
      duration,
      easing,
      css: (t, u) => `
        transform: ${transform} rotate(${u * 90 * (clockWise ? 1 : -1)}deg);
        opacity: ${opacity * t}
      `
    };
  };

  const iconMap: Record<string, typeof SunIcon> = {
    default: SunIcon,
    glassmorphism: GlassIcon,
    blueprint: ArchitectureIcon,
    neon: NeonIcon
  };
</script>

<div class="inline-grid">
  {#key $diagramThemeId}
    {@const Icon = iconMap[$diagramThemeId] ?? SunIcon}
    <div
      in:spin={{ clockWise: true }}
      out:spin={{ clockWise: false }}
      class="col-start-1 row-start-1">
      <Icon />
    </div>
  {/key}
</div>
