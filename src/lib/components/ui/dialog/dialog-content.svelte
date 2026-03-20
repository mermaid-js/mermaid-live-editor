<script lang="ts">
  import { cn, type WithoutChildrenOrChild } from '$lib/utils.js';
  import { Dialog as DialogPrimitive } from 'bits-ui';
  import X from 'lucide-svelte/icons/x';
  import type { Snippet } from 'svelte';
  import * as Dialog from './index.js';

  let {
    ref = $bindable(null),
    class: className,
    portalProps,
    children,
    ...restProps
  }: WithoutChildrenOrChild<DialogPrimitive.ContentProps> & {
    portalProps?: DialogPrimitive.PortalProps;
    children: Snippet;
  } = $props();
</script>

<Dialog.Portal {...portalProps}>
  <Dialog.Overlay />
  <DialogPrimitive.Content
    bind:ref
    class={cn(
      'bg-background data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg',
      className
    )}
    {...restProps}>
    {@render children?.()}
    <DialogPrimitive.Close
      class="ring-offset-background focus:ring-ring data-[state=open]:text-muted-foreground absolute top-4 right-4 cursor-pointer rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
      <X class="size-4" />
      <span class="sr-only">Close</span>
    </DialogPrimitive.Close>
  </DialogPrimitive.Content>
</Dialog.Portal>
