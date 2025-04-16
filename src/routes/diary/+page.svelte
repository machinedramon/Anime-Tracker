<!-- src/routes/diary/+page.svelte -->
<script lang="ts">
	import AnimeCard from '$lib/components/AnimeCard.svelte';
	import StatusTabs from '$lib/components/StatusTabs.svelte';
	import EditModal from '$lib/components/EditModal.svelte';
	import type { Anime } from '$lib/server/db/schema';

	// biome-ignore lint/style/useConst: <explanation>
	let { data } = $props();

	let animes = $state<Anime[]>(data.animes || []);
	let activeStatus = $state('watching');
	let showEditModal = $state(false);
	let selectedAnime = $state<Anime | null>(null);
	// biome-ignore lint/style/useConst: <explanation>
	let sortOption = $state('lastUpdated');

	// Filtra animes por status ativo
	// biome-ignore lint/style/useConst: <explanation>
	let filteredAnimes = $derived(animes.filter((anime) => anime.status === activeStatus));

	// Ordena animes conforme a opção selecionada
	// biome-ignore lint/style/useConst: <explanation>
	let sortedAnimes = $derived(
		[...filteredAnimes].sort((a, b) => {
			if (sortOption === 'lastUpdated') {
				return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
			}
			if (sortOption === 'title') {
				return a.title.localeCompare(b.title);
			}
			if (sortOption === 'personalScore') {
				const scoreA = a.personalScore || 0;
				const scoreB = b.personalScore || 0;
				return scoreB - scoreA;
			}
			if (sortOption === 'progress') {
				const progressA = a.totalEpisodes ? (a.currentEpisode || 0) / a.totalEpisodes : 0;
				const progressB = b.totalEpisodes ? (b.currentEpisode || 0) / b.totalEpisodes : 0;
				return progressB - progressA;
			}
			return 0;
		})
	);

	function openEditModal(anime: Anime) {
		selectedAnime = anime;
		showEditModal = true;
	}

	async function handleSave(updatedAnime: Anime) {
		try {
			const response = await fetch('/api/anime/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(updatedAnime)
			});

			if (response.ok) {
				const result = await response.json();

				// Atualizar o anime na lista local
				const index = animes.findIndex((a) => a.id === result.anime.id);
				if (index !== -1) {
					animes[index] = result.anime;
				}

				showEditModal = false;
			}
		} catch (error) {
			console.error('Erro ao salvar anime:', error);
			alert('Erro ao salvar as alterações.');
		}
	}

	async function handleDelete(animeToDelete: Anime) {
		try {
			const response = await fetch(`/api/anime/delete?id=${animeToDelete.id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				// Remover o anime da lista local
				animes = animes.filter((a) => a.id !== animeToDelete.id);
				showEditModal = false;
			}
		} catch (error) {
			console.error('Erro ao excluir anime:', error);
			alert('Erro ao excluir o anime.');
		}
	}

	function handleStatusChange(newStatus: string) {
		activeStatus = newStatus;
	}
</script>

<svelte:head>
	<title>Meu Diário | Anime Tracker</title>
</svelte:head>

<section>
	<h1 class="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Meu Diário</h1>

	<StatusTabs {activeStatus} onStatusChange={handleStatusChange} />

	<div class="mb-4 flex items-center">
		<label for="sort" class="mr-2 text-gray-700 dark:text-gray-300">Ordenar por:</label>
		<select
			id="sort"
			bind:value={sortOption}
			class="rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
		>
			<option value="lastUpdated">Últimos atualizados</option>
			<option value="title">Título</option>
			<option value="personalScore">Nota</option>
			<option value="progress">Progresso</option>
		</select>
	</div>

	<div>
		{#if sortedAnimes.length > 0}
			{#each sortedAnimes as anime}
				<AnimeCard {anime} onEdit={openEditModal} />
			{/each}
		{:else}
			<p
				class="rounded-lg bg-white p-8 text-center text-gray-600 shadow dark:bg-gray-800 dark:text-gray-400"
			>
				Nenhum anime encontrado com status "{activeStatus}".
			</p>
		{/if}
	</div>
</section>

{#if showEditModal && selectedAnime}
	<EditModal
		anime={selectedAnime}
		onSave={handleSave}
		onDelete={handleDelete}
		onClose={() => (showEditModal = false)}
	/>
{/if}
