<script lang="ts">
  import { Button } from '$/components/ui/button';
  import * as Dialog from '$/components/ui/dialog';
  import { Input } from '$/components/ui/input';
  import { ApiError } from '$/util/api';
  import { login } from '$/util/auth';
  import { notify } from '$/util/notify';
  import {
    foldersStore,
    refreshSavedDiagrams,
    saveCurrentAsNew,
    saveDialogOpen
  } from '$/util/savedDiagrams';

  let name = $state('');
  let folderId = $state('');
  let saving = $state(false);

  $effect(() => {
    if ($saveDialogOpen) {
      name = '';
      folderId = '';
      void refreshSavedDiagrams().catch(() => {
        // Folder list is best-effort; saving will surface real errors.
      });
    }
  });

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) {
      return;
    }
    try {
      saving = true;
      await saveCurrentAsNew(trimmed, folderId || null);
      notify(`Saved "${trimmed}"`);
      $saveDialogOpen = false;
    } catch (error) {
      if (error instanceof ApiError && error.isUnauthorized) {
        notify('Please sign in to save.');
        login();
        return;
      }
      notify('Could not save diagram.');
      console.error(error);
    } finally {
      saving = false;
    }
  };
</script>

<Dialog.Root bind:open={$saveDialogOpen}>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>Save diagram</Dialog.Title>
      <Dialog.Description>Save this diagram to your account.</Dialog.Description>
    </Dialog.Header>
    <div class="flex flex-col gap-3">
      <label class="flex flex-col gap-1 text-sm">
        Name
        <Input
          bind:value={name}
          placeholder="My diagram"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              void save();
            }
          }} />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        Folder
        <select
          bind:value={folderId}
          class="h-9 rounded-md border border-border bg-background px-2 text-sm">
          <option value="">No folder</option>
          {#each $foldersStore as folder (folder.id)}
            <option value={folder.id}>{folder.name}</option>
          {/each}
        </select>
      </label>
      <div class="flex justify-end gap-2 pt-2">
        <Button variant="ghost" onclick={() => ($saveDialogOpen = false)}>Cancel</Button>
        <Button variant="accent" disabled={!name.trim() || saving} onclick={save}>Save</Button>
      </div>
    </div>
  </Dialog.Content>
</Dialog.Root>
