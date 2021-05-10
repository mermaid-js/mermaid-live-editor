<div class={`bg-white m-2 rounded overflow-hidden shadow flex flex-col ${$$props.class}`}>
	<div class="bg-blue-400 border-gray-400 p-2 flex-none">
		<slot name="title" />
	</div>
	<div class="flex-grow">
		<slot />
	</div>
</div>
