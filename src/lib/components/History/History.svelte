<script lang="ts">
  import Card from '$lib/components/Card/Card.svelte';
  import type { HistoryEntry, HistoryType, State, Tab } from '$lib/types';
  import { notify, prompt } from '$lib/util/notify';
  import { getStateString, inputStateStore } from '$lib/util/state';
  import { logEvent } from '$lib/util/stats';
  import dayjs from 'dayjs';
  import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import BookmarkIcon from '~icons/material-symbols/bookmark-outline-rounded';
  import TrashAltIcon from '~icons/material-symbols/delete-outline-rounded';
  import DownloadIcon from '~icons/material-symbols/download-rounded';
  import SaveIcon from '~icons/material-symbols/save-outline-rounded';
  import UndoIcon from '~icons/material-symbols/settings-backup-restore-rounded';
  import UploadIcon from '~icons/material-symbols/upload-rounded';
  import HistoryIcon from '~icons/mdi/clock-outline';
  import GitAltIcon from '~icons/mdi/git';
  import { Button } from '../ui/button';
  import { Separator } from '../ui/separator';
  import {
    addHistoryEntry,
    clearHistoryData,
    getPreviousState,
    historyModeStore,
    historyStore,
    loaderHistoryStore,
    restoreHistory
  } from './history';

  dayjs.extend(dayjsRelativeTime);

  const HISTORY_SAVE_INTERVAL = 60_000;

  const tabSelectHandler = (tab: Tab) => {
    historyModeStore.set(tab.id as HistoryType);
  };

  let tabs: Tab[] = $state([
    {
      id: 'manual',
      title: 'Saved',
      icon: BookmarkIcon
    },
    {
      id: 'auto',
      title: 'Timeline',
      icon: HistoryIcon
    }
  ]);

  const downloadHistory = () => {
    const data = get(historyStore);
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-history-${dayjs().format('YYYY-MM-DD-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logEvent('history', {
      action: 'download'
    });
  };

  const uploadHistory = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', async ({ target }: Event) => {
      const file = (target as HTMLInputElement)?.files?.[0];
      if (!file) {
        return;
      }
      const data: HistoryEntry[] = JSON.parse(await file.text());
      restoreHistory(data);
    });
    input.click();
  };

  const saveHistory = (auto = false) => {
    const currentState: string = getStateString();
    const previousState: string = getPreviousState(auto);
    if (previousState !== currentState) {
      addHistoryEntry({
        state: $inputStateStore,
        time: Date.now(),
        type: auto ? 'auto' : 'manual'
      });
    } else if (!auto) {
      notify('State already saved.');
    }
  };

  const clearHistory = (id?: string): void => {
    if (!id && !prompt('Clear all saved items?')) {
      return;
    }
    clearHistoryData(id);
  };

  const restoreHistoryItem = (state: State): void => {
    inputStateStore.set({ ...state, updateDiagram: true });
  };

  onMount(() => {
    historyModeStore.set('manual');
    setInterval(() => {
      saveHistory(true);
    }, HISTORY_SAVE_INTERVAL);
  });

  loaderHistoryStore.subscribe((entries) => {
    if (entries.length > 0 && tabs.length === 2) {
      tabs = [
        {
          id: 'loader',
          title: 'Revisions',
          icon: GitAltIcon
        },
        ...tabs
      ];
      historyModeStore.set('loader');
    }
  });
</script>

<Card onselect={tabSelectHandler} isOpen isClosable={false} {tabs}>
  {#snippet actions()}
    <div class="flex items-center gap-2">
      <Button
        size="icon"
        variant="ghost"
        id="uploadHistory"
        onclick={uploadHistory}
        title="Upload history"><UploadIcon /></Button>
      {#if $historyStore.length > 0}
        <Button
          id="downloadHistory"
          size="icon"
          variant="ghost"
          onclick={downloadHistory}
          title="Download history"><DownloadIcon /></Button>
      {/if}
      <Separator orientation="vertical" />
      <Button
        id="saveHistory"
        size="icon"
        variant="ghost"
        onclick={() => saveHistory()}
        title="Save current state"><SaveIcon /></Button>
      {#if $historyModeStore !== 'loader'}
        <Button
          id="clearHistory"
          size="icon"
          variant="ghost"
          class="hover:text-destructive"
          onclick={() => clearHistory()}
          title="Delete all saved states"><TrashAltIcon /></Button>
      {/if}
    </div>
  {/snippet}
  <ul class="flex h-full min-w-fit flex-col gap-2 overflow-auto p-2" id="historyList">
    {#if $historyStore.length > 0}
      {#each $historyStore as { id, state, time, name, url, type } (id)}
        <li class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex flex-col">
              {#if url}
                <a
                  href={url}
                  target="_blank"
                  title="Open revision in new tab"
                  class="text-blue-500 hover:underline">{name}</a>
              {:else}
                <span class="whitespace-nowrap">{name}</span>
              {/if}
              <span class="text-xs whitespace-nowrap text-primary-foreground/30">
                {new Date(time).toLocaleString()}
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm whitespace-nowrap text-primary-foreground/50">
                {dayjs(time).fromNow()}
              </span>
              <Button size="icon" variant="ghost" onclick={() => restoreHistoryItem(state)}>
                <UndoIcon />
              </Button>
              {#if type !== 'loader'}
                <Button
                  size="icon"
                  variant="ghost"
                  class="hover:text-destructive"
                  onclick={() => clearHistory(id)}>
                  <TrashAltIcon />
                </Button>
              {/if}
            </div>
          </div>
          <Separator />
        </li>
      {/each}
    {:else}
      <div class="m-2 text-center">
        No items in History<br />
        Click the Save button to save current state and restore it later.<br />
        Timeline will automatically be saved every minute.
      </div>
    {/if}
  </ul>
</Card>
