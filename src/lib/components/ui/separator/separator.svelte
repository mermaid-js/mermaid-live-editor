<script lang="ts">
  import { cn } from '$lib/utils.js';
  import { Separator as SeparatorPrimitive } from 'bits-ui';

  let {
    ref = $bindable(null),
    class: className,
    orientation = 'horizontal',
    ...restProps
  }: SeparatorPrimitive.RootProps = $props();
</script>

<SeparatorPrimitive.Root
  bind:ref
  class={cn(
    'shrink-0 bg-border',
    orientation === 'horizontal' ? 'h-px w-full' : 'min-h-6 w-px',
    className
  )}
  {orientation}
  {...restProps} />
