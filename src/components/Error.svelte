<script>
  export let classes = '';
  export let errorText = '';
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

<div id="error" class={classes}>{errorText}</div>
