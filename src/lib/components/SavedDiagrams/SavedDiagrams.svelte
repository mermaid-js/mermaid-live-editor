<script lang="ts">
  import Card from '$/components/Card/Card.svelte';
  import { Button } from '$/components/ui/button';
  import { login, sessionStore } from '$/util/auth';
  import { notify, prompt } from '$/util/notify';
  import {
    activeDiagramId,
    createFolder,
    deleteDiagram,
    deleteFolder,
    diagramsStore,
    foldersStore,
    loadDiagram,
    refreshSavedDiagrams,
    renameDiagram,
    renameFolder,
    saveDialogOpen,
    type DiagramMeta,
    type Folder
  } from '$/util/savedDiagrams';
  import DiagramIcon from '~icons/material-symbols/account-tree-outline-rounded';
  import ExpandIcon from '~icons/material-symbols/chevron-right-rounded';
  import NewFolderIcon from '~icons/material-symbols/create-new-folder-outline-rounded';
  import TrashIcon from '~icons/material-symbols/delete-outline-rounded';
  import RenameIcon from '~icons/material-symbols/edit-outline-rounded';
  import FolderIcon from '~icons/material-symbols/folder-outline-rounded';
  import RefreshIcon from '~icons/material-symbols/refresh-rounded';
  import SaveIcon from '~icons/material-symbols/save-outline-rounded';

  let expanded = $state<Record<string, boolean>>({});
  const isOpen = (id: string): boolean => expanded[id] ?? true;
  const toggle = (id: string): void => {
    expanded[id] = !isOpen(id);
  };

  const foldersOf = (parentId: string | null): Folder[] =>
    $foldersStore.filter((folder) => folder.parentId === parentId);
  const diagramsOf = (folderId: string | null): DiagramMeta[] =>
    $diagramsStore.filter((diagram) => diagram.folderId === folderId);

  const run = (action: Promise<unknown>): void => {
    action.catch((error: unknown) => {
      notify('Something went wrong.');
      console.error(error);
    });
  };

  const newFolder = (parentId: string | null): void => {
    const name = window.prompt('New folder name')?.trim();
    if (name) {
      run(createFolder(name, parentId));
    }
  };

  const renameFolderUI = (folder: Folder): void => {
    const name = window.prompt('Rename folder', folder.name)?.trim();
    if (name && name !== folder.name) {
      run(renameFolder(folder.id, name));
    }
  };

  const deleteFolderUI = (folder: Folder): void => {
    if (prompt(`Delete folder "${folder.name}" and everything inside it?`)) {
      run(deleteFolder(folder.id));
    }
  };

  const renameDiagramUI = (diagram: DiagramMeta): void => {
    const name = window.prompt('Rename diagram', diagram.name)?.trim();
    if (name && name !== diagram.name) {
      run(renameDiagram(diagram.id, name));
    }
  };

  const deleteDiagramUI = (diagram: DiagramMeta): void => {
    if (prompt(`Delete diagram "${diagram.name}"?`)) {
      run(deleteDiagram(diagram.id));
    }
  };

  // Load the folder + diagram lists whenever the user becomes signed in.
  $effect(() => {
    if ($sessionStore) {
      run(refreshSavedDiagrams());
    }
  });
</script>

{#snippet diagramRow(diagram: DiagramMeta, depth: number)}
  <li class="flex items-center justify-between gap-1 rounded px-1 hover:bg-muted">
    <button
      class={[
        'flex min-w-0 flex-1 items-center gap-2 py-1 text-left',
        $activeDiagramId === diagram.id && 'text-accent'
      ]}
      style={`padding-left: ${depth * 1}rem`}
      title="Open diagram"
      onclick={() => run(loadDiagram(diagram.id))}>
      <DiagramIcon class="size-4 shrink-0" />
      <span class="truncate">{diagram.name}</span>
    </button>
    <div class="flex shrink-0 items-center">
      <Button size="icon" variant="ghost" title="Rename" onclick={() => renameDiagramUI(diagram)}>
        <RenameIcon class="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        class="hover:text-destructive"
        title="Delete"
        onclick={() => deleteDiagramUI(diagram)}>
        <TrashIcon class="size-4" />
      </Button>
    </div>
  </li>
{/snippet}

{#snippet folderNode(folder: Folder, depth: number)}
  <li>
    <div class="flex items-center justify-between gap-1 rounded px-1 hover:bg-muted">
      <button
        class="flex min-w-0 flex-1 items-center gap-1 py-1 text-left"
        style={`padding-left: ${depth * 1}rem`}
        onclick={() => toggle(folder.id)}>
        <ExpandIcon
          class={['size-4 shrink-0 transition-transform', isOpen(folder.id) && 'rotate-90']} />
        <FolderIcon class="size-4 shrink-0" />
        <span class="truncate font-medium">{folder.name}</span>
      </button>
      <div class="flex shrink-0 items-center">
        <Button
          size="icon"
          variant="ghost"
          title="New subfolder"
          onclick={() => newFolder(folder.id)}>
          <NewFolderIcon class="size-4" />
        </Button>
        <Button size="icon" variant="ghost" title="Rename" onclick={() => renameFolderUI(folder)}>
          <RenameIcon class="size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          class="hover:text-destructive"
          title="Delete"
          onclick={() => deleteFolderUI(folder)}>
          <TrashIcon class="size-4" />
        </Button>
      </div>
    </div>
    {#if isOpen(folder.id)}
      <ul>
        {#each foldersOf(folder.id) as child (child.id)}
          {@render folderNode(child, depth + 1)}
        {/each}
        {#each diagramsOf(folder.id) as diagram (diagram.id)}
          {@render diagramRow(diagram, depth + 1)}
        {/each}
      </ul>
    {/if}
  </li>
{/snippet}

<Card title="My Diagrams" isOpen isClosable={false}>
  {#snippet actions()}
    {#if $sessionStore}
      <div class="flex items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          title="Save current diagram"
          onclick={() => ($saveDialogOpen = true)}>
          <SaveIcon />
        </Button>
        <Button size="icon" variant="ghost" title="New folder" onclick={() => newFolder(null)}>
          <NewFolderIcon />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          title="Refresh"
          onclick={() => run(refreshSavedDiagrams())}>
          <RefreshIcon />
        </Button>
      </div>
    {/if}
  {/snippet}

  <div class="h-full overflow-auto p-2">
    {#if $sessionStore === undefined}
      <p class="m-2 text-center text-sm text-primary-foreground/50">Loading…</p>
    {:else if $sessionStore === null}
      <div class="m-2 flex flex-col items-center gap-3 text-center">
        <p>Sign in to save diagrams to your account and organise them into folders.</p>
        <Button variant="accent" size="sm" onclick={login}>Sign in</Button>
      </div>
    {:else}
      <ul class="flex flex-col">
        {#each foldersOf(null) as folder (folder.id)}
          {@render folderNode(folder, 0)}
        {/each}
        {#each diagramsOf(null) as diagram (diagram.id)}
          {@render diagramRow(diagram, 0)}
        {/each}
      </ul>
      {#if $foldersStore.length === 0 && $diagramsStore.length === 0}
        <p class="m-2 text-center text-sm text-primary-foreground/50">
          No saved diagrams yet.<br />Use Save to store the current diagram.
        </p>
      {/if}
    {/if}
  </div>
</Card>
