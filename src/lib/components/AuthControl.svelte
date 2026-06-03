<script lang="ts">
  import { Button } from '$/components/ui/button';
  import { login, logout, sessionStore } from '$/util/auth';
  import { clearSavedDiagrams } from '$/util/savedDiagrams';
  import LoginIcon from '~icons/material-symbols/login-rounded';
  import LogoutIcon from '~icons/material-symbols/logout-rounded';

  const onLogout = async () => {
    await logout();
    clearSavedDiagrams();
  };
</script>

{#if $sessionStore}
  <div class="flex items-center gap-1">
    <span
      class="hidden max-w-32 truncate text-sm text-primary-foreground/70 lg:inline"
      title={$sessionStore.email}>
      {$sessionStore.displayName ?? $sessionStore.email}
    </span>
    <Button variant="ghost" size="icon" title="Sign out" onclick={onLogout}>
      <LogoutIcon />
    </Button>
  </div>
{:else if $sessionStore === null}
  <Button variant="ghost" size="sm" onclick={login}>
    <LoginIcon /> Sign in
  </Button>
{/if}
