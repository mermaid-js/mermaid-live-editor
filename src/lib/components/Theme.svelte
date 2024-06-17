<script lang="ts">
  import { setTheme, themeStore } from '$lib/util/theme';

  const themes = [
    '🌝 light',
    '🌚 dark',
    '🧁 cupcake',
    '🐝 bumblebee',
    '✳️ emerald',
    '🏢 corporate',
    '🌃 synthwave',
    '👴 retro',
    '🤖 cyberpunk',
    '🌸 valentine',
    '🎃 halloween',
    '🌷 garden',
    '🌲 forest',
    '🐟 aqua',
    '👓 lofi',
    '🖍 pastel',
    '🧚‍♀️ fantasy',
    '📝 wireframe',
    '🏴 black',
    '💎 luxury',
    '🧛‍♂️ dracula'
  ];
</script>

<div class="dropdown hidden lg:block">
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div tabindex="0" class="btn btn-ghost">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      class="inline-block h-6 w-6 stroke-current md:mr-2"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
    <span class="hidden md:inline">Theme</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1792 1792"
      class="ml-1 inline-block h-4 w-4 fill-current"
      ><path
        d="M1395 736q0 13-10 23l-466 466q-10 10-23 10t-23-10l-466-466q-10-10-10-23t10-23l50-50q10-10 23-10t23 10l393 393 393-393q10-10 23-10t23 10l50 50q10 10 10 23z" /></svg>
  </div>
  <div
    class="dropdown-content top-px mt-14 h-96 w-56 overflow-y-auto bg-base-200 text-base-content shadow-2xl">
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <ul tabindex="0" class="menu compact p-4">
      {#each themes as theme}
        <li class:bordered={$themeStore.theme !== undefined && theme.includes($themeStore.theme)}>
          <span
            role="menuitem"
            tabindex="0"
            class="btn btn-ghost justify-start"
            on:click={() => setTheme(theme)}
            on:keypress={() => setTheme(theme)}>{theme}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
