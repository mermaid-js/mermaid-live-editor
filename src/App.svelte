<script>
 	import Router from 'svelte-spa-router'
  // Used for SSR. A falsy value is ignored by the Router.
	import Edit from './routes/Edit.svelte'
	import View from './routes/View.svelte'

	const routes = {
    // Exact path
    '/': Edit,

    // Using named parameters, with last being optional
    '/edit/:data': Edit,

    // Wildcard parameter
    '/view/:data': View,

    // Catch-all
    // This is optional, but if present it must be the last
    '*': Edit,
}
</script>

<style>
</style>
<Router {routes}/>
