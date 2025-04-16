<!-- src/routes/search/+page.svelte -->
<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import type { AnimeSearchResult } from '$lib/utils/api';
	import { searchAnime } from '$lib/utils/api';
	import type { NewAnime } from '$lib/server/db/schema';
	import { onMount } from 'svelte';

	// Estado reativo com Svelte 5 runes
	let selectedAnime = $state<AnimeSearchResult | null>(null);
	let showEditModal = $state(false);
	let newAnimeEntry = $state<NewAnime | null>(null);
	let isLoading = $state(false);

	// Estados para os resultados
	let initialAnimes = $state<AnimeSearchResult[]>([]);
	let isLoadingInitial = $state(true);
	let currentPage = $state(1);
	let totalPages = $state(0);
	// biome-ignore lint/style/useConst: <explanation>
	let itemsPerPage = $state(12);
	let category = $state('all');
	let sortBy = $state('score');
	let notification = $state({ show: false, message: '', type: '' });

	// Para controlar os filtros
	// biome-ignore lint/style/useConst: <explanation>
	let searchQuery = $state('');

	// Skeletons para carregamento
	// biome-ignore lint/style/useConst: <explanation>
	let skeletonArray = $derived(Array(itemsPerPage).fill(null));

	// Derived values
	// biome-ignore lint/style/useConst: <explanation>
	let filteredAnimes = $derived(
		category === 'all'
			? initialAnimes
			: initialAnimes.filter((anime) => anime.type?.toLowerCase() === category.toLowerCase())
	);

	// Efeito colateral
	$effect(() => {
		// Resetar anime selecionado quando mudar de página ou categoria
		if (currentPage || category) {
			selectedAnime = null;
			showEditModal = false;
		}
	});

	// Função para gerar items de paginação
	function generatePaginationItems(current: number, total: number) {
		if (total <= 7) {
			return Array.from({ length: total }, (_, i) => ({
				type: 'number',
				value: i + 1
			}));
		}

		const items = [];

		// Primeira página
		items.push({ type: 'number', value: 1 });

		// Elipses se necessário
		if (current > 3) {
			items.push({ type: 'ellipsis' });
		}

		// Páginas ao redor da atual
		const start = Math.max(2, current - 1);
		const end = Math.min(total - 1, current + 1);

		for (let i = start; i <= end; i++) {
			items.push({ type: 'number', value: i });
		}

		// Elipses no final se necessário
		if (current < total - 2) {
			items.push({ type: 'ellipsis' });
		}

		// Última página
		if (total > 1) {
			items.push({ type: 'number', value: total });
		}

		return items;
	}

	// Função para trocar de página
	function changePage(page: number) {
		if (page < 1 || page > totalPages) return;

		window.scrollTo({ top: 0, behavior: 'smooth' });
		currentPage = page;
		fetchAnimes();
	}

	// Função para trocar de categoria
	function changeCategory(newCategory: string) {
		if (category === newCategory) return;

		category = newCategory;
		currentPage = 1;
		fetchAnimes();
	}

	// Função para trocar a ordenação
	function changeSortBy(newSortBy: string) {
		if (sortBy === newSortBy) return;

		sortBy = newSortBy;
		fetchAnimes();
	}

	// Função para selecionar um anime
	function handleSelect(anime: AnimeSearchResult) {
		selectedAnime = anime;
		window.scrollTo({ top: 0, behavior: 'smooth' });

		// Preparar objeto para adicionar ao diário
		newAnimeEntry = {
			malId: anime.mal_id,
			title: anime.title,
			imageUrl: anime.images?.jpg.image_url || '',
			totalEpisodes: anime.episodes || null,
			currentEpisode: 0,
			status: 'planned',
			personalScore: null,
			comment: null,
			isFavorite: false,
			lastUpdated: new Date()
		};
	}

	// Função para salvar anime no diário
	async function handleSave(animeToSave: NewAnime) {
		try {
			isLoading = true;
			const response = await fetch('/api/anime/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(animeToSave)
			});

			if (response.ok) {
				const result = await response.json();
				if (result.success) {
					showSuccess('Anime adicionado ao seu diário!');
					showEditModal = false;
					selectedAnime = null;
				} else {
					showError(result.message || 'Erro ao adicionar anime.');
				}
			} else {
				const error = await response.json();
				showError(error.message || 'Erro ao adicionar anime ao diário.');
			}
		} catch (error) {
			console.error('Erro ao adicionar anime:', error);
			showError('Erro ao adicionar anime ao diário.');
		} finally {
			isLoading = false;
		}
	}

	// Função para mostrar notificação de sucesso
	function showSuccess(message: string) {
		notification = { show: true, message, type: 'success' };
		setTimeout(() => {
			notification = { ...notification, show: false };
		}, 3000);
	}

	// Função para mostrar notificação de erro
	function showError(message: string) {
		notification = { show: true, message, type: 'error' };
		setTimeout(() => {
			notification = { ...notification, show: false };
		}, 3000);
	}

	// Função para buscar animes na API
	async function fetchAnimes() {
		try {
			isLoadingInitial = true;

			// Se houver uma query de busca, usar searchAnime
			if (searchQuery.trim()) {
				const results = await searchAnime(searchQuery);
				initialAnimes = results;
				totalPages = Math.ceil(results.length / itemsPerPage);
			} else {
				// Caso contrário, buscar animes populares
				// Você pode implementar uma função específica para isso
				// ou usar a API de top animes
				const response = await fetch(
					`https://api.jikan.moe/v4/top/anime?page=${currentPage}&limit=${itemsPerPage}`
				);

				if (!response.ok) {
					throw new Error(`API respondeu com status ${response.status}`);
				}

				const data = await response.json();
				initialAnimes = data.data;
				totalPages = data.pagination?.last_visible_page || 1;
			}
		} catch (error) {
			console.error('Erro ao carregar animes:', error);
			showError('Falha ao carregar animes. Tente novamente.');
			initialAnimes = [];
		} finally {
			isLoadingInitial = false;
		}
	}

	// Inicializar dados ao montar o componente
	onMount(() => {
		fetchAnimes();
	});
</script>

<svelte:head>
	<title>Buscar Animes | Anime Tracker</title>
</svelte:head>

<!-- Neon background elements -->
<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	<div
		class="animate-pulse-slow absolute top-20 -left-40 h-96 w-96 rounded-full bg-blue-500/20 blur-[120px]"
	></div>
	<div
		class="animate-pulse-slow animation-delay-1000 absolute top-60 -right-20 h-80 w-80 rounded-full bg-purple-500/20 blur-[100px]"
	></div>
	<div
		class="animate-pulse-slow animation-delay-2000 absolute -bottom-20 left-1/4 h-72 w-72 rounded-full bg-pink-500/20 blur-[80px]"
	></div>
</div>

<section class="relative z-10">
	<div class="relative mb-8">
		<h1
			class="mb-2 bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-4xl font-bold text-transparent"
		>
			Buscar Animes
		</h1>
		<p class="text-gray-400">Descubra novos animes e adicione-os ao seu diário pessoal</p>
		<div class="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-500/10 blur-xl"></div>
	</div>

	<div class="mb-6">
		<SearchBar onSelect={handleSelect} />
	</div>

	<!-- Anime Details - Selected Anime -->
	{#if selectedAnime && !showEditModal}
		<div
			class="animate-fadeIn relative mb-8 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 shadow-xl backdrop-blur-sm"
		>
			<div class="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
			<div
				class="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"
			></div>
			<div
				class="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"
			></div>

			<!-- Glow effect on hover -->
			<div
				class="pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-indigo-500/30"
			></div>
			<div
				class="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-500/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			></div>

			<div class="relative z-10 p-6">
				<div class="flex flex-col gap-6 md:flex-row">
					<div class="md:w-1/4">
						<div class="group relative overflow-hidden rounded-lg shadow-xl">
							<div
								class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-25 blur transition duration-1000 group-hover:opacity-70 group-hover:duration-300"
							></div>
							<div class="relative overflow-hidden rounded-lg bg-gray-900">
								<img
									src={selectedAnime.images?.jpg.image_url || 'https://via.placeholder.com/225x318'}
									alt={selectedAnime.title}
									class="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							</div>

							{#if selectedAnime.score}
								<div
									class="absolute top-2 right-2 flex items-center justify-center rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="#FBBF24"
										class="mr-1 h-4 w-4"
									>
										<path
											fill-rule="evenodd"
											d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
											clip-rule="evenodd"
										/>
									</svg>
									<span class="text-sm font-bold text-amber-400">{selectedAnime.score}</span>
								</div>
							{/if}
						</div>

						<div class="mt-4 flex justify-center">
							<button
								onclick={() => (showEditModal = true)}
								class="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
								disabled={isLoading}
							>
								<span class="relative z-10">
									{#if isLoading}
										<div class="flex items-center justify-center">
											<div
												class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
											></div>
											<span>Carregando...</span>
										</div>
									{:else}
										<div class="flex items-center justify-center">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												class="mr-1.5 h-4 w-4"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M12 6v6m0 0v6m0-6h6m-6 0H6"
												/>
											</svg>
											<span>Adicionar ao Diário</span>
										</div>
									{/if}
								</span>
								<div
									class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 blur transition duration-300 group-hover:opacity-70"
								></div>
							</button>
						</div>
					</div>

					<div class="flex-1">
						<h2 class="mb-2 text-2xl font-bold text-white">
							{selectedAnime.title}
						</h2>
						{#if selectedAnime.title_english && selectedAnime.title_english !== selectedAnime.title}
							<h3 class="mb-4 text-xl text-gray-400 italic">
								{selectedAnime.title_english}
							</h3>
						{/if}

						<div class="mb-4 flex flex-wrap gap-2">
							<span class="group relative inline-flex overflow-hidden rounded-full">
								<span
									class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-indigo-700/20"
								></span>
								<span class="relative px-3 py-1 text-sm font-medium text-indigo-400">
									{selectedAnime.type || 'N/A'}
								</span>
							</span>

							<span class="group relative inline-flex overflow-hidden rounded-full">
								<span
									class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-700/20"
								></span>
								<span class="relative px-3 py-1 text-sm font-medium text-purple-400">
									{selectedAnime.episodes || '?'} episódios
								</span>
							</span>

							<span class="group relative inline-flex overflow-hidden rounded-full">
								<span
									class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-gray-700/70 to-gray-800/70"
								></span>
								<span class="relative px-3 py-1 text-sm font-medium text-gray-300">
									{selectedAnime.status || 'Desconhecido'}
								</span>
							</span>
						</div>

						{#if selectedAnime.studios && selectedAnime.studios.length > 0}
							<p class="mb-4 font-medium text-indigo-400">
								Estúdio: {selectedAnime.studios[0].name}
							</p>
						{/if}

						{#if selectedAnime.synopsis}
							<div
								class="relative mb-6 rounded-lg border border-gray-700/50 bg-gray-800/30 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-indigo-500/20"
							>
								<h4 class="mb-2 text-lg font-medium text-white">Sinopse</h4>
								<p class="leading-relaxed text-gray-300">{selectedAnime.synopsis}</p>
								<div
									class="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition duration-1000 group-hover:opacity-30"
								></div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}

	{#if !selectedAnime || showEditModal}
		<!-- Filtros -->
		<div
			class="group relative mb-6 overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm"
		>
			<div
				class="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-0 blur-lg transition duration-300 group-hover:opacity-100"
			></div>
			<div class="relative z-10">
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div class="flex flex-wrap gap-2">
						<button
							class={`group relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${category === 'all' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
							onclick={() => changeCategory('all')}
						>
							{#if category === 'all'}
								<div
									class="animate-pulse-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"
								></div>
							{/if}
							<span class="relative z-10">Todos</span>
						</button>

						<button
							class={`group relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${category === 'TV' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
							onclick={() => changeCategory('TV')}
						>
							{#if category === 'TV'}
								<div
									class="animate-pulse-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"
								></div>
							{/if}
							<span class="relative z-10">TV</span>
						</button>

						<button
							class={`group relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${category === 'Movie' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
							onclick={() => changeCategory('Movie')}
						>
							{#if category === 'Movie'}
								<div
									class="animate-pulse-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"
								></div>
							{/if}
							<span class="relative z-10">Filmes</span>
						</button>

						<button
							class={`group relative rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${category === 'OVA' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
							onclick={() => changeCategory('OVA')}
						>
							{#if category === 'OVA'}
								<div
									class="animate-pulse-slow absolute -inset-0.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"
								></div>
							{/if}
							<span class="relative z-10">OVAs</span>
						</button>
					</div>

					<div class="flex items-center gap-2">
						<span class="text-sm text-gray-400">Ordenar:</span>
						<div class="relative">
							<select
								value={sortBy}
								onchange={(e) => changeSortBy((e.target as HTMLSelectElement).value)}
								class="appearance-none rounded-lg border border-gray-700 bg-gray-800/80 px-3 py-1.5 pr-8 text-sm text-white shadow-sm backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
							>
								<option value="score">Nota</option>
								<option value="title">Título</option>
								<option value="popularity">Popularidade</option>
								<option value="newest">Mais recentes</option>
							</select>
							<div
								class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M19 9l-7 7-7-7"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Grid de Animes -->
		<div>
			<h2
				class="mb-4 inline-block bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent"
			>
				{#if category === 'all'}
					Animes Populares
				{:else if category === 'TV'}
					Séries de TV Populares
				{:else if category === 'Movie'}
					Filmes Populares
				{:else if category === 'OVA'}
					OVAs Populares
				{/if}
			</h2>

			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#if isLoadingInitial}
					{#each skeletonArray as _, i}
						<div
							class="group relative animate-pulse overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 shadow-lg backdrop-blur-sm"
						>
							<div class="aspect-[3/4] bg-gray-700/60"></div>
							<div
								class="absolute inset-0 bg-gradient-to-t from-indigo-600/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100"
							></div>
						</div>
					{/each}
				{:else}
					{#each filteredAnimes as anime (anime.mal_id)}
						<button
							type="button"
							class="group relative w-full cursor-pointer overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
							onclick={() => handleSelect(anime)}
							onkeydown={(e) => e.key === 'Enter' && handleSelect(anime)}
						>
							<div class="relative aspect-[3/4] overflow-hidden">
								<img
									src={anime.images?.jpg.image_url || 'https://via.placeholder.com/225x318'}
									alt={anime.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
									loading="lazy"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent opacity-80"
								></div>
								<div
									class="absolute inset-0 bg-gradient-to-t from-indigo-600/20 via-purple-600/10 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100"
								></div>

								{#if anime.score}
									<div
										class="absolute top-2 right-2 flex items-center justify-center rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="#FBBF24"
											class="mr-1 h-3 w-3"
										>
											<path
												fill-rule="evenodd"
												d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
												clip-rule="evenodd"
											/>
										</svg>
										<span class="text-xs font-bold text-amber-400">{anime.score}</span>
									</div>
								{/if}

								<div class="absolute right-0 bottom-0 left-0 p-3">
									<h3 class="mb-1 line-clamp-2 text-base font-bold text-white">{anime.title}</h3>
									<div class="flex flex-wrap gap-1">
										<span class="rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs text-indigo-300"
											>{anime.type || 'N/A'}</span
										>
										{#if anime.episodes}
											<span class="rounded-full bg-gray-800/80 px-2 py-0.5 text-xs text-gray-300">
												{anime.episodes} episódios
											</span>
										{/if}
									</div>
									{#if anime.studios?.length}
										<p class="mt-1 text-xs text-gray-400">{anime.studios[0].name}</p>
									{/if}
								</div>
							</div>

							<!-- Neon border effect on hover -->
							<div
								class="pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 group-hover:border-indigo-500/30"
							></div>
							<div
								class="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 opacity-0 blur-lg transition-all duration-500 group-hover:from-indigo-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 group-hover:opacity-100"
							></div>
						</button>
					{/each}
				{/if}
			</div>

			<!-- Paginação -->
			{#if filteredAnimes.length > 0 && !isLoadingInitial && totalPages > 1}
				<div class="mt-8 flex justify-center">
					<div
						class="flex items-center space-x-1 rounded-lg border border-gray-700/50 bg-gray-800/40 p-1 backdrop-blur-sm"
					>
						<button
							onclick={() => changePage(currentPage - 1)}
							disabled={currentPage === 1}
							aria-label="Página anterior"
							class="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>

						{#each generatePaginationItems(currentPage, totalPages) as item}
							{#if item.type === 'ellipsis'}
								<span class="px-1 text-gray-500">...</span>
							{:else}
								<button
									onclick={() => changePage(item.value as number)}
									class={`group relative min-w-[36px] overflow-hidden rounded-md px-3 py-1.5 text-sm font-medium transition-all ${currentPage === item.value ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}
								>
									{#if currentPage === item.value}
										<div
											class="animate-pulse-slow absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur"
										></div>
									{/if}
									<span class="relative z-10">{item.value}</span>
								</button>
							{/if}
						{/each}

						<button
							onclick={() => changePage(currentPage + 1)}
							disabled={currentPage === totalPages}
							aria-label="Próxima página"
							class="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-gray-400"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</section>

<!-- Notificação Toast -->
{#if notification.show}
	<div class="animate-slideInUp fixed right-4 bottom-4 z-50">
		<div
			class={`group relative rounded-lg px-4 py-3 shadow-lg ${notification.type === 'success' ? 'bg-green-600/90' : 'bg-red-600/90'} overflow-hidden text-white backdrop-blur-sm`}
		>
			<div
				class="absolute -inset-1 bg-gradient-to-r ${notification.type === 'success'
					? 'from-green-400 to-green-600'
					: 'from-red-400 to-red-600'} opacity-30 blur transition duration-1000 group-hover:opacity-50"
			></div>
			<div class="relative flex items-center">
				{#if notification.type === 'success'}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				{:else}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						class="mr-2 h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				{/if}
				<span>{notification.message}</span>
			</div>
		</div>
	</div>
{/if}

{#if showEditModal && newAnimeEntry}
	<EditModal
		anime={newAnimeEntry}
		isNew={true}
		onSave={handleSave}
		onClose={() => (showEditModal = false)}
		onDelete={() => {}}
	/>
{/if}

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
		animation: fadeIn 0.3s ease-out forwards;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-slideInUp {
		animation: slideInUp 0.3s ease-out forwards;
	}

	@keyframes pulse-slow {
		0%,
		100% {
			opacity: 0.7;
		}
		50% {
			opacity: 0.3;
		}
	}

	.animate-pulse-slow {
		animation: pulse-slow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.animation-delay-1000 {
		animation-delay: 1s;
	}

	.animation-delay-2000 {
		animation-delay: 2s;
	}
</style>
