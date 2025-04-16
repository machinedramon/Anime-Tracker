<!-- src/lib/components/SearchBar.svelte -->
<script lang="ts">
	import { searchAnime } from '$lib/utils/api';
	import type { AnimeSearchResult } from '$lib/utils/api';

	// biome-ignore lint/style/useConst: <explanation>
	let { initialQuery = '', onSelect } = $props();

	// biome-ignore lint/style/useConst: <explanation>
	let query = $state(initialQuery);
	let results = $state<AnimeSearchResult[]>([]);
	let loading = $state(false);
	let showResults = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;
	let inputElement: HTMLInputElement;
	let focused = $state(false);

	$effect(() => {
		// Esconde resultados quando clicar fora
		if (typeof window !== 'undefined') {
			function handleClickOutside(event: MouseEvent) {
				if (inputElement && !inputElement.contains(event.target as Node)) {
					showResults = false;
					focused = false;
				}
			}

			window.addEventListener('click', handleClickOutside);

			return () => {
				window.removeEventListener('click', handleClickOutside);
			};
		}
	});

	// Pesquisa com debounce
	function handleInput() {
		showResults = true;

		clearTimeout(debounceTimer);

		if (query.trim().length < 2) {
			results = [];
			return;
		}

		debounceTimer = setTimeout(async () => {
			loading = true;
			results = await searchAnime(query);
			loading = false;
		}, 300);
	}

	function handleSelect(anime: AnimeSearchResult) {
		onSelect?.(anime);
		showResults = false;
		focused = false;
	}

	function handleFocus() {
		focused = true;
		if (query.trim().length >= 2) showResults = true;
	}
</script>

<div class="relative w-full">
	<div class={`relative transition-all duration-300 ${focused ? 'scale-[1.02]' : 'scale-100'}`}>
		<div class="relative">
			<input
				type="text"
				bind:this={inputElement}
				bind:value={query}
				oninput={handleInput}
				onfocus={handleFocus}
				placeholder="Buscar animes..."
				class="w-full rounded-xl border-2 border-gray-700 bg-gray-800 py-3 pr-4 pl-12 text-white shadow-lg transition-all duration-300 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
			/>

			<div class="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-6 w-6"
				>
					<path
						fill-rule="evenodd"
						d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>

			{#if loading}
				<div class="absolute top-1/2 right-3 -translate-y-1/2">
					<div
						class="h-5 w-5 animate-spin rounded-full border-2 border-gray-500 border-t-indigo-500"
					></div>
				</div>
			{/if}
		</div>

		{#if query.trim().length > 0}
			<button
				class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-300"
				onclick={() => {
					query = '';
					results = [];
				}}
				aria-label="Limpar pesquisa"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-5 w-5"
				>
					<path
						fill-rule="evenodd"
						d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
						clip-rule="evenodd"
					/>
				</svg>
			</button>
		{/if}
	</div>

	{#if showResults && results.length > 0}
		<div
			class="animate-fadeIn absolute top-full right-0 left-0 z-10 mt-2 max-h-[400px] overflow-y-auto rounded-xl border border-gray-700 bg-gray-800 shadow-xl backdrop-blur-sm"
		>
			{#each results as anime, i}
				<button
					type="button"
					class={`flex w-full cursor-pointer p-3 text-left transition-colors hover:bg-gray-700 ${i !== results.length - 1 ? 'border-b border-gray-700' : ''}`}
					onclick={() => handleSelect(anime)}
					onkeydown={(e) => e.key === 'Enter' && handleSelect(anime)}
				>
					<div class="mr-3 h-[70px] w-[50px] overflow-hidden rounded-md bg-gray-700">
						<img
							src={anime.images.jpg.small_image_url || 'https://via.placeholder.com/50x70'}
							alt={anime.title}
							class="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
							loading="lazy"
						/>
					</div>
					<div class="min-w-0 flex-1">
						<h4 class="mb-1 truncate font-medium text-white">
							{anime.title}
						</h4>
						<div class="mb-1 flex flex-wrap gap-2">
							<span class="rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs text-indigo-300"
								>{anime.type || 'N/A'}</span
							>
							<span class="rounded-full bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
								{anime.episodes || '?'} episódios
							</span>
							{#if anime.score}
								<span
									class="flex items-center space-x-1 rounded-full bg-amber-900/30 px-2 py-0.5 text-xs text-amber-300"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="h-3 w-3"
									>
										<path
											fill-rule="evenodd"
											d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
											clip-rule="evenodd"
										/>
									</svg>
									<span>{anime.score}</span>
								</span>
							{/if}
						</div>
						{#if anime.studios && anime.studios.length > 0}
							<p class="text-xs text-indigo-400">{anime.studios[0].name}</p>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{:else if showResults && query.trim().length >= 2 && !loading}
		<div
			class="animate-fadeIn absolute top-full right-0 left-0 z-10 mt-2 rounded-xl border border-gray-700 bg-gray-800 p-6 text-center shadow-xl backdrop-blur-sm"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="mx-auto h-12 w-12 text-gray-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
				/>
			</svg>
			<p class="mt-2 text-gray-400">
				Nenhum resultado encontrado para <span class="text-indigo-400">"{query}"</span>
			</p>
		</div>
	{/if}
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out forwards;
	}
</style>
