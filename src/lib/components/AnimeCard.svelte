<!-- src/lib/components/AnimeCard.svelte -->
<script lang="ts">
	// biome-ignore lint/style/useConst: <explanation>
	let { anime, onEdit } = $props();

	// Formatar data de última atualização
	const formattedDate = $derived(new Date(anime.lastUpdated).toLocaleDateString());

	// Mapeamento de status para texto em português
	const statusMap = {
		watching: 'Assistindo',
		completed: 'Completo',
		dropped: 'Droppado',
		paused: 'Pausado',
		planned: 'Planejado'
	};

	// Mapeamento de status para cores do Tailwind
	const statusColorMap = {
		watching: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
		completed: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
		dropped: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
		paused: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white',
		planned: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
	};

	// Calcular progresso percentual
	const progressPercent = $derived(
		anime.totalEpisodes ? Math.round((anime.currentEpisode / anime.totalEpisodes) * 100) : 0
	);
</script>

<div
	class="group relative mb-6 overflow-hidden rounded-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg transition-all duration-300 hover:border-indigo-500/30"
>
	{#if anime.isFavorite}
		<div
			class="absolute -top-6 -right-6 h-12 w-12 rotate-45 bg-gradient-to-r from-pink-500 to-purple-500"
		></div>
	{/if}

	<div class="flex flex-col md:flex-row">
		<div class="relative overflow-hidden md:w-[120px]">
			<div
				class="absolute inset-0 z-10 bg-gradient-to-t from-gray-900 to-transparent opacity-50"
			></div>
			<img
				src={anime.imageUrl || 'https://via.placeholder.com/120x180'}
				alt={anime.title}
				class="h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-110 md:w-[120px]"
			/>
			{#if anime.isFavorite}
				<div class="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="#fff"
						class="h-6 w-6 drop-shadow-lg"
					>
						<path
							d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
						/>
					</svg>
				</div>
			{/if}

			<div
				class="absolute right-0 bottom-0 left-0 z-20 flex items-center justify-between bg-gradient-to-t from-gray-900 px-2 pt-6 pb-2"
			>
				<span
					class={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusColorMap[anime.status as keyof typeof statusColorMap]}`}
				>
					{statusMap[anime.status as keyof typeof statusMap]}
				</span>

				{#if anime.personalScore}
					<div class="flex items-center space-x-1">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="#FBBF24"
							class="h-3 w-3"
						>
							<path
								fill-rule="evenodd"
								d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
								clip-rule="evenodd"
							/>
						</svg>
						<span class="text-xs font-bold text-amber-400">{anime.personalScore}</span>
					</div>
				{/if}
			</div>
		</div>

		<div class="flex flex-1 flex-col p-4">
			<div class="mb-2 flex items-center justify-between">
				<h3 class="line-clamp-1 text-lg font-bold text-white">{anime.title}</h3>
			</div>

			<div class="mb-3 flex flex-wrap items-center text-xs">
				<div class="flex items-center space-x-1 text-gray-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							fill-rule="evenodd"
							d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
							clip-rule="evenodd"
						/>
					</svg>
					<span class="font-medium text-indigo-300"
						>{anime.currentEpisode ?? 0}/{anime.totalEpisodes ?? '?'}</span
					>
				</div>
			</div>

			{#if anime.totalEpisodes && anime.currentEpisode > 0}
				<div class="mb-3">
					<div class="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
						<div
							class="absolute h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
							style={`width: ${progressPercent}%`}
						></div>
					</div>
					<div class="mt-1 flex justify-between text-xs">
						<span class="text-gray-400">Progresso</span>
						<span class="font-medium text-indigo-300">{progressPercent}%</span>
					</div>
				</div>
			{/if}

			{#if anime.comment}
				<p class="mb-3 line-clamp-2 text-sm text-gray-300 italic">
					{anime.comment}
				</p>
			{/if}

			<div class="mt-auto flex items-center justify-between">
				<span class="text-xs text-gray-500">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="mr-1 inline h-3 w-3"
					>
						<path
							fill-rule="evenodd"
							d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
							clip-rule="evenodd"
						/>
					</svg>
					{formattedDate}
				</span>
				<button
					onclick={() => onEdit?.(anime)}
					class="inline-flex items-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none active:scale-95"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="mr-1 h-3 w-3"
					>
						<path
							d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8.8a.75.75 0 00.933.933l.8-.81a5.25 5.25 0 002.214-1.32L17.5 6.33l3.712 3.712-7.5 7.5.817.817c.314.315.692.548 1.103.698.793.295 1.64.295 2.432 0 .411-.15.79-.383 1.103-.698l7.5-7.5a2.625 2.625 0 000-3.712z"
						/>
					</svg>
					Editar
				</button>
			</div>
		</div>
	</div>
</div>
