<!-- src/lib/components/EditModal.svelte -->
<script lang="ts">
	import type { Anime, NewAnime } from '$lib/server/db/schema';

	// biome-ignore lint/style/useConst: <explanation>
	let { anime, isNew = false, onSave, onDelete, onClose } = $props();

	// Clone do anime para editar
	// biome-ignore lint/style/useConst: <explanation>
	let editedAnime = $state({ ...anime });

	// Estado derivado para verificar se foram feitas alterações
	// biome-ignore lint/style/useConst: <explanation>
	let hasChanges = $derived(JSON.stringify(editedAnime) !== JSON.stringify(anime));

	// Status disponíveis
	const statuses = [
		{ id: 'watching', label: 'Assistindo' },
		{ id: 'completed', label: 'Completo' },
		{ id: 'dropped', label: 'Droppado' },
		{ id: 'paused', label: 'Pausado' },
		{ id: 'planned', label: 'Planejado' }
	];

	function handleSave() {
		// Garante que o anime tenha lastUpdated definido
		editedAnime.lastUpdated = new Date();
		onSave?.(editedAnime);
	}

	function handleDelete() {
		if (confirm('Tem certeza que deseja remover este anime do seu diário?')) {
			onDelete?.(anime as Anime);
		}
	}
</script>

<div
	class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
	onclick={onClose}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	role="dialog"
	tabindex="-1"
	aria-modal="true"
>
	<div
		class="animate-fadeIn w-full max-w-md overflow-hidden rounded-xl border border-indigo-500/30 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
		role="dialog"
		tabindex="-1"
	>
		<header
			class="relative flex items-center justify-between border-b border-indigo-500/20 px-6 py-4"
		>
			<div class="absolute -top-10 -left-10 h-20 w-20 rounded-full bg-indigo-600/20 blur-xl"></div>
			<h2 class="text-xl font-bold text-white">
				{isNew ? 'Adicionar Anime' : 'Editar Anime'}
			</h2>
			<button
				onclick={onClose}
				aria-label="Fechar"
				class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M18 6L6 18"></path>
					<path d="M6 6l12 12"></path>
				</svg>
			</button>
		</header>

		<div class="bg-gray-900/50 px-6 py-5">
			<div class="mb-5">
				<label for="status" class="mb-2 block text-sm font-semibold text-indigo-300">Status</label>
				<div class="relative">
					<select
						id="status"
						bind:value={editedAnime.status}
						class="w-full appearance-none rounded-lg border border-indigo-500/30 bg-gray-800 px-4 py-3 text-white shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
					>
						{#each statuses as status}
							<option value={status.id}>{status.label}</option>
						{/each}
					</select>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-indigo-300"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<polyline points="6 9 12 15 18 9"></polyline>
						</svg>
					</div>
				</div>
			</div>

			<div class="mb-5">
				<label for="current-episode" class="mb-2 block text-sm font-semibold text-indigo-300"
					>Episódio Atual</label
				>
				<div class="mb-2 flex items-center space-x-3">
					<div class="relative w-full max-w-[100px]">
						<input
							type="number"
							id="current-episode"
							bind:value={
								() => editedAnime.currentEpisode,
								(v) => {
									const value = Number(v);
									if (!isNaN(value)) {
										editedAnime.currentEpisode = Math.max(
											0,
											Math.min(value, editedAnime.totalEpisodes || Infinity)
										);
									}
								}
							}
							min="0"
							max={editedAnime.totalEpisodes || undefined}
							class="w-full rounded-lg border border-indigo-500/30 bg-gray-800 px-4 py-3 text-white shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
						/>
					</div>

					{#if editedAnime.totalEpisodes}
						<span class="font-medium text-indigo-300">
							de <span class="text-white">{editedAnime.totalEpisodes}</span>
						</span>
					{/if}
				</div>

				{#if editedAnime.totalEpisodes}
					<div class="relative pt-1">
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 ease-out"
								style={`width: ${(editedAnime.currentEpisode / editedAnime.totalEpisodes) * 100}%`}
							></div>
						</div>
						<input
							type="range"
							bind:value={editedAnime.currentEpisode}
							min="0"
							max={editedAnime.totalEpisodes}
							class="absolute inset-0 h-2 w-full cursor-pointer appearance-none bg-transparent opacity-0"
						/>
					</div>
				{/if}
			</div>

			<div class="mb-5">
				<label for="score" class="mb-2 block text-sm font-semibold text-indigo-300"
					>Nota Pessoal</label
				>
				<div class="relative">
					<input
						type="number"
						id="score"
						bind:value={editedAnime.personalScore}
						min="0"
						max="10"
						step="0.5"
						class="w-full rounded-lg border border-indigo-500/30 bg-gray-800 px-4 py-3 text-white shadow-inner focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
					/>
					<div
						class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-amber-400"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<polygon
								points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
							></polygon>
						</svg>
					</div>
				</div>
			</div>

			<div class="mb-5">
				<label for="comment" class="mb-2 block text-sm font-semibold text-indigo-300"
					>Comentário</label
				>
				<textarea
					id="comment"
					bind:value={editedAnime.comment}
					rows="3"
					placeholder="Suas impressões sobre o anime..."
					class="w-full rounded-lg border border-indigo-500/30 bg-gray-800 px-4 py-3 text-white shadow-inner placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
				></textarea>
			</div>

			<div class="mb-2">
				<label class="relative inline-flex cursor-pointer items-center">
					<input type="checkbox" bind:checked={editedAnime.isFavorite} class="peer sr-only" />
					<div
						class="peer h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 peer-focus:ring-2 peer-focus:ring-indigo-500/50 peer-focus:outline-none after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full"
					></div>
					<span class="ms-3 text-sm font-medium text-white">Marcar como favorito</span>
				</label>
			</div>
		</div>

		<footer class="flex justify-end border-t border-indigo-500/20 bg-gray-900/30 px-6 py-4">
			{#if !isNew}
				<button
					onclick={handleDelete}
					class="mr-3 rounded-lg bg-red-600/80 px-4 py-2 font-medium text-white shadow-sm transition-colors duration-150 hover:bg-red-700 focus:ring-2 focus:ring-red-500/50 focus:outline-none"
				>
					Remover
				</button>
			{/if}
			<button
				onclick={handleSave}
				disabled={!hasChanges && !isNew}
				class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-medium text-white shadow-sm transition-all duration-150 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-indigo-600 disabled:hover:to-purple-600"
			>
				Salvar
			</button>
		</footer>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out forwards;
	}
</style>
