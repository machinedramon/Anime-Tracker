<!-- src/lib/components/StatusTabs.svelte -->
<script lang="ts">
	// biome-ignore lint/style/useConst: <explanation>
	let { activeStatus = 'watching', onStatusChange } = $props();

	const statuses = [
		{
			id: 'watching',
			label: 'Assistindo',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5C4 4.67157 4.67157 4 5.5 4H18.5C19.3284 4 20 4.67157 20 5.5V18.5C20 19.3284 19.3284 20 18.5 20H5.5C4.67157 20 4 19.3284 4 18.5V5.5ZM5.5 5C5.22386 5 5 5.22386 5 5.5V18.5C5 18.7761 5.22386 19 5.5 19H18.5C18.7761 19 19 18.7761 19 18.5V5.5C19 5.22386 18.7761 5 18.5 5H5.5Z" fill="currentColor"></path><path d="M9 8.5C9 8.22386 9.22386 8 9.5 8H16.5C16.7761 8 17 8.22386 17 8.5V15.5C17 15.7761 16.7761 16 16.5 16H9.5C9.22386 16 9 15.7761 9 15.5V8.5Z" fill="currentColor"></path><path d="M7 8.5C7 7.67157 7.67157 7 8.5 7H15.5C16.3284 7 17 7.67157 17 8.5V15.5C17 16.3284 16.3284 17 15.5 17H8.5C7.67157 17 7 16.3284 7 15.5V8.5ZM8.5 8C8.22386 8 8 8.22386 8 8.5V15.5C8 15.7761 8.22386 16 8.5 16H15.5C15.7761 16 16 15.7761 16 15.5V8.5C16 8.22386 15.7761 8 15.5 8H8.5Z" fill="currentColor"></path></svg>`
		},
		{
			id: 'completed',
			label: 'Completo',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" /></svg>`
		},
		{
			id: 'dropped',
			label: 'Droppado',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" /></svg>`
		},
		{
			id: 'paused',
			label: 'Pausado',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clip-rule="evenodd" /></svg>`
		},
		{
			id: 'planned',
			label: 'Planejado',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clip-rule="evenodd" /></svg>`
		}
	];

	// Cores personalizadas para cada status
	const statusColors = {
		watching: {
			active: 'from-blue-600 to-blue-800',
			inactive: 'from-blue-500/20 to-blue-700/20 hover:from-blue-500/30 hover:to-blue-700/30'
		},
		completed: {
			active: 'from-green-600 to-green-800',
			inactive: 'from-green-500/20 to-green-700/20 hover:from-green-500/30 hover:to-green-700/30'
		},
		dropped: {
			active: 'from-red-600 to-red-800',
			inactive: 'from-red-500/20 to-red-700/20 hover:from-red-500/30 hover:to-red-700/30'
		},
		paused: {
			active: 'from-yellow-600 to-yellow-800',
			inactive:
				'from-yellow-500/20 to-yellow-700/20 hover:from-yellow-500/30 hover:to-yellow-700/30'
		},
		planned: {
			active: 'from-gray-600 to-gray-800',
			inactive: 'from-gray-500/20 to-gray-700/20 hover:from-gray-500/30 hover:to-gray-700/30'
		}
	};

	function setStatus(status: string) {
		onStatusChange?.(status);
	}
</script>

<div class="relative mb-8">
	<!-- Glow Effect Background -->
	{#if activeStatus === 'watching'}
		<div class="absolute -inset-4 -z-10 rounded-full bg-blue-600/20 blur-xl"></div>
	{:else if activeStatus === 'completed'}
		<div class="absolute -inset-4 -z-10 rounded-full bg-green-600/20 blur-xl"></div>
	{:else if activeStatus === 'dropped'}
		<div class="absolute -inset-4 -z-10 rounded-full bg-red-600/20 blur-xl"></div>
	{:else if activeStatus === 'paused'}
		<div class="absolute -inset-4 -z-10 rounded-full bg-yellow-600/20 blur-xl"></div>
	{:else if activeStatus === 'planned'}
		<div class="absolute -inset-4 -z-10 rounded-full bg-gray-600/20 blur-xl"></div>
	{/if}

	<div
		class="flex flex-wrap gap-2 rounded-xl border border-gray-700/50 bg-gray-800/50 p-1.5 shadow-xl backdrop-blur-sm"
	>
		{#each statuses as status}
			<button
				class={`flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
					activeStatus === status.id
						? `bg-gradient-to-br ${statusColors[status.id as keyof typeof statusColors].active} text-white shadow-md`
						: `bg-gradient-to-br ${statusColors[status.id as keyof typeof statusColors].inactive} text-gray-300`
				}`}
				onclick={() => setStatus(status.id)}
			>
				<span class="mr-2">{@html status.icon}</span>
				{status.label}
			</button>
		{/each}
	</div>

	<!-- Indicator Line -->
	<div
		class="mt-4 hidden h-0.5 rounded-full bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 sm:block"
	></div>
</div>
