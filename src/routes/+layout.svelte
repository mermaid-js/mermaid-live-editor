<script lang="ts">
  import '../app.postcss';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { loadingStateStore } from '$lib/util/loading';
  import { setTheme, themeStore } from '$lib/util/theme';
  import { toggleDarkTheme } from '$lib/util/state';
  import { initHandler } from '$lib/util/util';

  // This can be removed once https://github.com/sveltejs/kit/issues/1612 is fixed.
  // Then move it into src and vite will bundle it automatically.
  onMount(() => {
    window.addEventListener('hashchange', () => {
      void initHandler();
    });
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${base}/service-worker.js`, {
          scope: `${base}/`
        })
        .then(function (registration) {
          console.log('Registration successful, scope is:', registration.scope);
        })
        .catch(function (error) {
          console.log('Service worker registration failed, error:', error);
        });
    }

    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if ($themeStore.theme === undefined) {
      setTheme(isDarkMode ? 'dark' : 'light');
    }

    themeStore.subscribe(({ theme, isDark }) => {
      if (theme) {
        document.querySelectorAll('html')[0].dataset.theme = theme;
        toggleDarkTheme(isDark);
      }
    });
  });
</script>

<main class="h-screen text-primary-content">
  <slot />
</main>

{#if $loadingStateStore.loading}
  <div
    class="absolute left-0 top-0 z-50 flex h-screen w-screen justify-center bg-gray-600 align-middle opacity-50">
    <div class="my-auto text-4xl font-bold text-indigo-100">
      <div class="loader mx-auto" />
      <div>{$loadingStateStore.message}</div>
    </div>
  </div>
{/if}

<style>
  .loader {
    border: 0.45em solid #f3f3f3;
    border-radius: 50%;
    border-top: 0.45em solid #6365f1;
    width: 3em;
    height: 3em;
    -webkit-animation: spin 2s linear infinite; /* Safari */
    animation: spin 2s linear infinite;
  }

  /* Safari */
  @-webkit-keyframes spin {
    0% {
      -webkit-transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(360deg);
    }
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
