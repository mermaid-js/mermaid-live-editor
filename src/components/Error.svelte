<script>
  export let classes = '';
  export let errorStore;
  let error;
  errorStore.subscribe((_error) => {
    if (_error) {
      error = _error.toString();
    } else {
      error = false;
    }
  });
</script>

<style>
  #error {
    background: darkred;
    color: white;
    flex: 1;
    padding: 10px;
  }
  .invisible {
    display: none;
  }
  .visible {
    display: block;
  }
</style>

{#if error}
  <div id="error" class={classes}>{error}</div>
{/if}
