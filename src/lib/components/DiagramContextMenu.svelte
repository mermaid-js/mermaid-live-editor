<script lang="ts">
  import { TID } from '#lib/constants.js';
  import { copyPNG, downloadPNG, downloadSVG, isClipboardAvailable } from '#lib/util/export.js';
  import { notify } from '#lib/util/notify.js';
  import type { PanZoomState } from '#lib/util/panZoom.js';
  import { urls, validatedState } from '#lib/util/state.svelte.js';
  import { logEvent } from '#lib/util/stats.js';
  import { copyToClipboard } from '#lib/util/util.js';
  import * as ContextMenu from '#lib/components/ui/context-menu/index.js';
  import type { Component, Snippet } from 'svelte';
  import CodeIcon from '~icons/custom/code';
  import CopyIcon from '~icons/material-symbols/content-copy-outline-rounded';
  import DownloadIcon from '~icons/material-symbols/download';
  import LinkIcon from '~icons/material-symbols/link-rounded';
  import MarkdownIcon from '~icons/material-symbols/markdown-outline-rounded';
  import ResetIcon from '~icons/material-symbols/screenshot-frame-2';

  let { children, panZoomState }: { children: Snippet; panZoomState: PanZoomState } = $props();

  const run = (item: MenuItem) => async () => {
    try {
      await item.action();
      logEvent('contextMenu', { action: item.event });
      if (item.success) notify(item.success);
    } catch (error) {
      console.error(error);
      notify('Something went wrong');
    }
  };

  interface MenuItem {
    action: () => unknown;
    disabled?: boolean;
    event: string;
    hidden?: boolean;
    icon: Component;
    label: string;
    success?: string;
    testId: string;
  }

  const hasError = $derived(validatedState.current.error !== undefined);

  const items: MenuItem[][] = $derived([
    [
      {
        action: copyPNG,
        disabled: hasError,
        event: 'copyImage',
        hidden: !isClipboardAvailable(),
        icon: CopyIcon,
        label: 'Copy Diagram to Clipboard',
        success: 'Diagram copied to clipboard',
        testId: TID.contextMenuCopyImage
      },
      {
        action: () => copyToClipboard(window.location.href),
        event: 'copyLink',
        icon: LinkIcon,
        label: 'Copy Share Link to Clipboard',
        success: 'Share link copied to clipboard',
        testId: TID.contextMenuCopyLink
      },
      {
        action: () => copyToClipboard(validatedState.current.code),
        event: 'copyCode',
        icon: CodeIcon,
        label: 'Copy Mermaid Code',
        success: 'Mermaid code copied to clipboard',
        testId: TID.contextMenuCopyCode
      },
      {
        action: () => copyToClipboard(urls.current.mdCode),
        event: 'copyMarkdown',
        hidden: !urls.current.mdCode,
        icon: MarkdownIcon,
        label: 'Copy Markdown Image',
        success: 'Markdown copied to clipboard',
        testId: TID.contextMenuCopyMarkdown
      }
    ],
    [
      {
        action: downloadPNG,
        disabled: hasError,
        event: 'downloadPNG',
        icon: DownloadIcon,
        label: 'Download PNG',
        testId: TID.contextMenuDownloadPNG
      },
      {
        action: downloadSVG,
        disabled: hasError,
        event: 'downloadSVG',
        icon: DownloadIcon,
        label: 'Download SVG',
        testId: TID.contextMenuDownloadSVG
      }
    ],
    [
      {
        action: () => panZoomState.reset(),
        event: 'resetView',
        icon: ResetIcon,
        label: 'Reset View',
        testId: TID.contextMenuResetView
      }
    ]
  ]);
</script>

<ContextMenu.Root
  onOpenChange={(open) => {
    if (open) logEvent('contextMenu', { action: 'open' });
  }}>
  <ContextMenu.Trigger class="h-full w-full" data-testid={TID.diagramContextMenuTrigger}>
    {@render children()}
  </ContextMenu.Trigger>
  <ContextMenu.Content class="min-w-56">
    {#each items as group, index (index)}
      {#if index > 0}
        <ContextMenu.Separator />
      {/if}
      {#each group.filter((item) => !item.hidden) as item (item.label)}
        <ContextMenu.Item data-testid={item.testId} disabled={item.disabled} onSelect={run(item)}>
          <item.icon />
          {item.label}
        </ContextMenu.Item>
      {/each}
    {/each}
  </ContextMenu.Content>
</ContextMenu.Root>
