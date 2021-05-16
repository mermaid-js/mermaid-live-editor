<div class={`bg-white rounded overflow-hidden shadow m-2 flex-grow flex flex-col ${$$props.class}`}>
	<div class="bg-blue-400 border-gray-400 p-2 flex-none">
		<slot name="title" />
	</div>
	<div class="flex-grow overflow-auto">
		<slot />
	</div>
</div>
