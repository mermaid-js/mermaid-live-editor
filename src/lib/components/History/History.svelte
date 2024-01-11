<script lang="ts">
  import Card from '$lib/components/Card/Card.svelte';
  import { inputStateStore, getStateString } from '$lib/util/state';
  import {
    addHistoryEntry,
    historyModeStore,
    clearHistoryData,
    getPreviousState,
    historyStore,
    loaderHistoryStore,
    restoreHistory
  } from './history';
  import { notify, prompt } from '$lib/util/notify';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import dayjs from 'dayjs';
  import dayjsRelativeTime from 'dayjs/plugin/relativeTime';
  import type { HistoryEntry, HistoryType, State, Tab } from '$lib/types';
  import { logEvent } from '$lib/util/stats';

  dayjs.extend(dayjsRelativeTime);

  const HISTORY_SAVE_INTERVAL = 60000;

  const tabSelectHandler = (message: CustomEvent<Tab>) => {
    historyModeStore.set(message.detail.id as HistoryType);
  };
  let tabs: Tab[] = [
    {
      id: 'manual',
      title: 'Saved',
      icon: 'far fa-bookmark'
    },
    {
      id: 'auto',
      title: 'Timeline',
      icon: 'fas fa-history'
    }
  ];

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
    input.addEventListener('change', ({ target }: Event) => {
      const file = (target as HTMLInputElement)?.files?.[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const data: HistoryEntry[] = JSON.parse(e.target?.result as string);
        restoreHistory(data);
      };
      reader.readAsText(file);
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

  const relativeTime = (time: number) => {
    const t = new Date(time);
    return `${new Date(t).toLocaleString()} (${dayjs(t).fromNow()})`;
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
          icon: 'fab fa-git-alt'
        },
        ...tabs
      ];
      historyModeStore.set('loader');
    }
  });

  let isOpen = false;
</script>

<Card on:select={tabSelectHandler} bind:isOpen {tabs} title="History">
  <div slot="actions">
    <button
      id="uploadHistory"
      class="btn btn-secondary btn-xs w-12"
      on:click|stopPropagation={() => uploadHistory()}
      title="Upload history"><i class="fa fa-upload" /></button>
    {#if $historyStore.length > 0}
      <button
        id="downloadHistory"
        class="btn btn-secondary btn-xs w-12"
        on:click|stopPropagation={() => downloadHistory()}
        title="Download history"><i class="fa fa-download" /></button>
    {/if}
    |
    <button
      id="saveHistory"
      class="btn btn-success btn-xs w-12"
      on:click|stopPropagation={() => saveHistory()}
      title="Save current state"><i class="far fa-save" /></button>
    {#if $historyModeStore !== 'loader'}
      <button
        id="clearHistory"
        class="btn btn-error btn-xs w-12"
        on:click|stopPropagation={() => clearHistory()}
        title="Delete all saved states"><i class="fas fa-trash-alt" /></button>
    {/if}
  </div>
  <ul class="h-56 space-y-2 overflow-auto p-2" id="historyList">
    {#if $historyStore.length > 0}
      {#each $historyStore as { id, state, time, name, url, type }}
        <li class="flex-col rounded p-2 shadow">
          <div class="flex">
            <div class="flex-1">
              <div class="flex flex-col text-base-content">
                {#if url}
                  <a
                    href={url}
                    target="_blank"
                    title="Open revision in new tab"
                    class="text-blue-500 hover:underline">{name}</a>
                {:else}
                  <span>{name}</span>
                {/if}
                <span class="text-sm text-gray-400">{relativeTime(time)}</span>
              </div>
            </div>
            <div class="flex content-center gap-2">
              <button class="btn btn-success" on:click={() => restoreHistoryItem(state)}
                ><i class="fas fa-undo mr-1" />Restore</button>
              {#if type !== 'loader'}
                <button class="btn btn-error" on:click={() => clearHistory(id)}
                  ><i class="fas fa-trash-alt mr-1" />Delete</button>
              {/if}
            </div>
          </div>
        </li>
      {/each}
    {:else}
      <div class="m-2">
        No items in History<br />
        Click the Save button to save current state and restore it later.<br />
        Timeline will automatically be saved every minute.
      </div>
    {/if}
  </ul>
</Card>
