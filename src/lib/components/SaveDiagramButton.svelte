<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { ApiError } from '$/util/api';
  import { login, sessionStore } from '$/util/auth';
  import { notify } from '$/util/notify';
  import {
    activeDiagramId,
    diagramsStore,
    saveActiveDiagram,
    saveDialogOpen
  } from '$/util/savedDiagrams';
  import SaveIcon from '~icons/material-symbols/save-outline-rounded';

  let saving = $state(false);

  const handleClick = async () => {
    if (!$sessionStore) {
      login();
      return;
    }
    if (!$activeDiagramId) {
      $saveDialogOpen = true;
      return;
    }
    try {
      saving = true;
      await saveActiveDiagram();
      const name = $diagramsStore.find((d) => d.id === $activeDiagramId)?.name;
      notify(`Saved "${name ?? 'diagram'}"`);
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

<Button variant="accent" size="sm" disabled={saving} onclick={handleClick}>
  <SaveIcon />
  {$activeDiagramId ? 'Save' : 'Save diagram'}
</Button>
