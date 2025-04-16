<!--
    @component
    
    Imports the FontAwesome CSS file.

    Needed, since the `@sveltejs/adapter-node` plugin doesn't seem to support
    lazy-importing CSS, even though `@sveltejs/adapter-vercel` is fine with it!

    However, making a `.svelte` file that imports the CSS file, and then
    lazy-loading the `.svelte` file works.
-->
<script lang="ts">
  import '@fortawesome/fontawesome-free/css/all.css';
</script>
