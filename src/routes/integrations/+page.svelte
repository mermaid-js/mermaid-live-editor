<script lang="ts">
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { Button } from '$/components/ui/button';
  import { Input } from '$/components/ui/input';
  import { api, ApiError } from '$/util/api';
  import { loadSession, sessionStore } from '$/util/auth';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import ArrowBackIcon from '~icons/material-symbols/arrow-back-rounded';
  import EntraIcon from '~icons/material-symbols/key-outline-rounded';

  interface EntraConfigView {
    tenantId: string;
    clientId: string;
    redirectUri: string;
    clientSecretSet: boolean;
    source: 'db' | 'env' | null;
  }

  let loading = $state(true);
  let saving = $state(false);
  let loadError = $state<string | null>(null);

  let tenantId = $state('');
  let clientId = $state('');
  let redirectUri = $state('');
  let clientSecret = $state('');
  let clientSecretSet = $state(false);
  let source = $state<'db' | 'env' | null>(null);

  const isAdmin = $derived($sessionStore?.isAdmin === true);

  const applyConfig = (config: EntraConfigView) => {
    tenantId = config.tenantId;
    clientId = config.clientId;
    redirectUri = config.redirectUri;
    clientSecretSet = config.clientSecretSet;
    source = config.source;
  };

  onMount(async () => {
    if ($sessionStore === undefined) {
      await loadSession();
    }
    if ($sessionStore === null) {
      await goto(`${base}/`);
      return;
    }
    if ($sessionStore?.isAdmin) {
      try {
        applyConfig(await api.get<EntraConfigView>('/integrations/entra'));
      } catch (error) {
        loadError = error instanceof ApiError ? error.message : 'Failed to load configuration';
      }
    }
    loading = false;
  });

  const save = async (event: SubmitEvent) => {
    event.preventDefault();
    saving = true;
    try {
      const body: Record<string, string> = { tenantId, clientId, redirectUri };
      if (clientSecret.trim()) {
        body.clientSecret = clientSecret.trim();
      }
      applyConfig(await api.patch<EntraConfigView>('/integrations/entra', body));
      clientSecret = '';
      toast.success('Entra ID SSO settings saved');
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save settings');
    } finally {
      saving = false;
    }
  };
</script>

<svelte:head>
  <title>Integrations</title>
</svelte:head>

<div class="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6 sm:p-10">
  <div class="flex flex-col gap-1">
    <a
      href={`${base}/edit`}
      class="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-accent">
      <ArrowBackIcon class="size-4" /> Back to editor
    </a>
    <h1 class="text-2xl font-semibold text-accent">Integrations</h1>
    <p class="text-sm text-muted-foreground">
      Connect and configure external services for this deployment.
    </p>
  </div>

  {#if loading}
    <p class="text-muted-foreground">Loading…</p>
  {:else if !isAdmin}
    <div class="rounded-md border-2 border-border-dark p-6">
      <p class="font-medium">Admin access required</p>
      <p class="text-sm text-muted-foreground">
        Only administrators can manage integrations. Ask a deployment administrator if you need
        access.
      </p>
    </div>
  {:else}
    <section class="flex flex-col gap-4 rounded-md border-2 border-border-dark p-6">
      <div class="flex items-center gap-2">
        <EntraIcon class="size-6" />
        <div>
          <h2 class="text-lg font-semibold">Microsoft Entra ID SSO</h2>
          <p class="text-sm text-muted-foreground">
            Single sign-on for saving diagrams to this server.
          </p>
        </div>
      </div>

      {#if loadError}
        <p class="rounded bg-destructive/10 p-2 text-sm text-destructive">{loadError}</p>
      {/if}

      {#if source === 'env'}
        <p class="rounded bg-muted p-2 text-sm text-muted-foreground">
          Currently using values from environment variables (bootstrap). Saving here stores the
          configuration in the database, which then takes precedence.
        </p>
      {/if}

      <form class="flex flex-col gap-4" onsubmit={save}>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Directory (tenant) ID</span>
          <Input
            bind:value={tenantId}
            required
            placeholder="00000000-0000-0000-0000-000000000000" />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Application (client) ID</span>
          <Input
            bind:value={clientId}
            required
            placeholder="00000000-0000-0000-0000-000000000000" />
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Client secret</span>
          <Input
            bind:value={clientSecret}
            type="password"
            autocomplete="off"
            placeholder={clientSecretSet
              ? '•••••• (leave blank to keep current)'
              : 'Enter client secret'} />
          <span class="text-xs text-muted-foreground">
            {clientSecretSet
              ? 'A secret is stored. Leave blank to keep it; enter a new value to replace it.'
              : 'No secret stored yet — required to enable sign-in.'}
          </span>
        </label>

        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Redirect URI</span>
          <Input
            bind:value={redirectUri}
            type="url"
            required
            placeholder="https://example.com/api/auth/callback" />
          <span class="text-xs text-muted-foreground">
            Must exactly match the redirect URI registered on the Entra app registration.
          </span>
        </label>

        <div class="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </section>
  {/if}
</div>
