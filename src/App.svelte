<script>
	import Router from "svelte-spa-router";
	// Used for SSR. A falsy value is ignored by the Router.
	import Edit from "./routes/Edit.svelte";
	import View from "./routes/View.svelte";

	const routes = {
		// Exact path
		"/": Edit,

		// Using named parameters, with last being optional
		"/edit/:data": Edit,

		// Wildcard parameter
		"/view/:data": View,

		// Catch-all
		// This is optional, but if present it must be the last
		"*": Edit,
	};
</script>

<style>

</style>

<svelte:head>
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
		rel="stylesheet" />
</svelte:head>
<Router {routes} />
