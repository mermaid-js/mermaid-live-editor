<script>
	export let noPadding = false;
	let contentClass = 'padding';
	if (noPadding) {
		contentClass = '';
	}
</script>

<style>
	#tag {
		height: auto;
    margin: 0 8px 0 0;
    padding: 0 7px;
    font-size: 12px;
    line-height: 20px;
    white-space: nowrap;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    cursor: default;
		font-size: smaller;
		/* padding: 8px; */
		color: #52c41a;
    background: #f6ffed;
    border-color: #b7eb8f;
		margin-left: 8px;
	}
</style>

<div id="tag">
	<slot></slot>
</div>