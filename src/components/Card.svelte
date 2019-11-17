<script>
	export let title = '';
	export let noPadding = false;
	let contentClass = 'padding';
	if (noPadding) {
		contentClass = '';
	}
</script>

<style>
	#card {
		border: 1px solid lightgray;
		margin-bottom: 16px;
	}
	#title {
		border-bottom: 1px solid lightgray;
	}
	#content {
		padding-top: 16px;
	}
	.padding {
		padding: 16px;
	}
</style>

<div id="card">
	<div id="title" class="padding">{title}</div>
	<div id="content" class="{contentClass}">
		<slot></slot>
	</div>
</div>