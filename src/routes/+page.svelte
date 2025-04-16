<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import type { Anime } from '$lib/server/db/schema';
	import type { Badge } from '$lib/server/db/schema';

	// biome-ignore lint/style/useConst: <explanation>
	let { data } = $props();

	// biome-ignore lint/style/useConst: <explanation>
	let animes = $state<Anime[]>(data.animes || []);
	// biome-ignore lint/style/useConst: <explanation>
	let badges = $state<Badge[]>(data.badges || []);
	// biome-ignore lint/style/useConst: <explanation>
	let selectedTab = $state('stats');

	// Dados do usuário (mockados para exemplo)
	const userData = {
		username: 'AnimeEnthusiast',
		joinDate: new Date('2024-01-15'),
		avatarUrl: null
	};

	// Cálculos de estatísticas
	// Total de animes
	// biome-ignore lint/style/useConst: <explanation>
	let totalAnimes = $derived(animes.length);
	// Total de episódios assistidos
	// biome-ignore lint/style/useConst: <explanation>
	let watchedEpisodes = $derived(
		animes.reduce((sum, anime) => sum + (anime.currentEpisode || 0), 0)
	);
	// Tempo total (estimado em minutos, assumindo 24 minutos por episódio)
	// biome-ignore lint/style/useConst: <explanation>
	let watchTimeMinutes = $derived(watchedEpisodes * 24);
	// Média de avaliação
	// biome-ignore lint/style/useConst: <explanation>
	let ratedAnimes = $derived(animes.filter((anime) => anime.personalScore !== null));
	// biome-ignore lint/style/useConst: <explanation>
	let averageScore = $derived(
		ratedAnimes.length > 0
			? ratedAnimes.reduce((sum, anime) => sum + (anime.personalScore || 0), 0) / ratedAnimes.length
			: 0
	);
	// Contagem por status
	// biome-ignore lint/style/useConst: <explanation>
	let statusCounts = $derived({
		watching: animes.filter((a) => a.status === 'watching').length,
		completed: animes.filter((a) => a.status === 'completed').length,
		dropped: animes.filter((a) => a.status === 'dropped').length,
		paused: animes.filter((a) => a.status === 'paused').length,
		planned: animes.filter((a) => a.status === 'planned').length
	});
	// Favoritos
	// biome-ignore lint/style/useConst: <explanation>
	let favorites = $derived(animes.filter((anime) => anime.isFavorite));
	// Total de conquistas
	// biome-ignore lint/style/useConst: <explanation>
	let achievedBadges = $derived(badges.filter((badge) => badge.achieved));

	// Formatações
	function formatTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}d ${hours % 24}h`;
		}
		return `${hours}h ${minutes % 60}m`;
	}

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}
</script>

<svelte:head>
	<title>Perfil | Anime Tracker</title>
</svelte:head>

<section>
	<div
		class="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl"
	>
		<div class="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"></div>
		<div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"></div>
		<div class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"></div>

		<div class="relative z-10 p-6 md:p-8">
			<div class="flex flex-col items-center gap-6 md:flex-row">
				<!-- Avatar -->
				{#if userData.avatarUrl}
					<img
						src={userData.avatarUrl}
						alt={userData.username}
						class="h-24 w-24 rounded-full border-4 border-indigo-500/30 object-cover shadow-lg"
					/>
				{:else}
					<div
						class="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white shadow-lg"
					>
						{getInitials(userData.username)}
					</div>
				{/if}

				<!-- User Info -->
				<div class="text-center md:text-left">
					<h1 class="text-3xl font-bold text-white">{userData.username}</h1>
					<p class="mt-1 text-gray-400">
						Otaku desde {userData.joinDate.toLocaleDateString()}
					</p>
					<div class="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
						<div class="rounded-full bg-indigo-900/50 px-3 py-1 text-sm text-indigo-300">
							<span class="font-semibold">{totalAnimes}</span> animes
						</div>
						<div class="rounded-full bg-purple-900/50 px-3 py-1 text-sm text-purple-300">
							<span class="font-semibold">{achievedBadges.length}</span> conquistas
						</div>
						<div class="rounded-full bg-blue-900/50 px-3 py-1 text-sm text-blue-300">
							<span class="font-semibold">{watchedEpisodes}</span> episódios
						</div>
					</div>
				</div>

				<div class="ml-auto hidden md:block">
					<button
						class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
					>
						Editar Perfil
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6">
		<div class="border-b border-gray-700/50">
			<div class="flex space-x-2 overflow-x-auto">
				<button
					class={`px-4 py-2 font-medium transition-all ${selectedTab === 'stats' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (selectedTab = 'stats')}
				>
					Estatísticas
				</button>
				<button
					class={`px-4 py-2 font-medium transition-all ${selectedTab === 'achievements' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (selectedTab = 'achievements')}
				>
					Conquistas
				</button>
				<button
					class={`px-4 py-2 font-medium transition-all ${selectedTab === 'favorites' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (selectedTab = 'favorites')}
				>
					Favoritos
				</button>
				<button
					class={`px-4 py-2 font-medium transition-all ${selectedTab === 'settings' ? 'border-b-2 border-indigo-500 text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (selectedTab = 'settings')}
				>
					Configurações
				</button>
			</div>
		</div>
	</div>

	<!-- Tab Content -->
	{#if selectedTab === 'stats'}
		<div class="animate-fadeIn space-y-6">
			<!-- Estatísticas Principais -->
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div
					class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-lg"
				>
					<div class="mb-2 text-sm font-medium text-gray-400">Total de Animes</div>
					<div class="flex items-baseline">
						<div class="text-3xl font-bold text-white">{totalAnimes}</div>
					</div>
				</div>

				<div
					class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-lg"
				>
					<div class="mb-2 text-sm font-medium text-gray-400">Episódios Assistidos</div>
					<div class="flex items-baseline">
						<div class="text-3xl font-bold text-white">{watchedEpisodes}</div>
					</div>
				</div>

				<div
					class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-lg"
				>
					<div class="mb-2 text-sm font-medium text-gray-400">Tempo Assistindo</div>
					<div class="flex items-baseline">
						<div class="text-3xl font-bold text-white">{formatTime(watchTimeMinutes)}</div>
					</div>
				</div>

				<div
					class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-lg"
				>
					<div class="mb-2 text-sm font-medium text-gray-400">Nota Média</div>
					<div class="flex items-center">
						<div class="text-3xl font-bold text-white">{averageScore.toFixed(1)}</div>
						<div class="ml-2 text-amber-400">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-6 w-6"
							>
								<path
									fill-rule="evenodd"
									d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					</div>
				</div>
			</div>

			<!-- Distribuição por Status -->
			<div
				class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg"
			>
				<h3 class="mb-4 text-lg font-semibold text-white">Distribuição por Status</h3>

				<div class="grid gap-3">
					<div>
						<div class="mb-1 flex justify-between">
							<span class="text-sm font-medium text-blue-400">Assistindo</span>
							<span class="text-sm text-gray-400">{statusCounts.watching} animes</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
								style={`width: ${totalAnimes ? (statusCounts.watching / totalAnimes) * 100 : 0}%`}
							></div>
						</div>
					</div>

					<div>
						<div class="mb-1 flex justify-between">
							<span class="text-sm font-medium text-green-400">Completados</span>
							<span class="text-sm text-gray-400">{statusCounts.completed} animes</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
								style={`width: ${totalAnimes ? (statusCounts.completed / totalAnimes) * 100 : 0}%`}
							></div>
						</div>
					</div>

					<div>
						<div class="mb-1 flex justify-between">
							<span class="text-sm font-medium text-red-400">Droppados</span>
							<span class="text-sm text-gray-400">{statusCounts.dropped} animes</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600"
								style={`width: ${totalAnimes ? (statusCounts.dropped / totalAnimes) * 100 : 0}%`}
							></div>
						</div>
					</div>

					<div>
						<div class="mb-1 flex justify-between">
							<span class="text-sm font-medium text-yellow-400">Pausados</span>
							<span class="text-sm text-gray-400">{statusCounts.paused} animes</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600"
								style={`width: ${totalAnimes ? (statusCounts.paused / totalAnimes) * 100 : 0}%`}
							></div>
						</div>
					</div>

					<div>
						<div class="mb-1 flex justify-between">
							<span class="text-sm font-medium text-gray-400">Planejados</span>
							<span class="text-sm text-gray-400">{statusCounts.planned} animes</span>
						</div>
						<div class="h-2 w-full overflow-hidden rounded-full bg-gray-700">
							<div
								class="h-full rounded-full bg-gradient-to-r from-gray-500 to-gray-600"
								style={`width: ${totalAnimes ? (statusCounts.planned / totalAnimes) * 100 : 0}%`}
							></div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{:else if selectedTab === 'achievements'}
		<div class="animate-fadeIn space-y-4">
			<h2 class="mb-4 text-xl font-bold text-white">Minhas Conquistas</h2>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each badges as badge}
					<div
						class={`relative overflow-hidden rounded-xl bg-gradient-to-br ${badge.achieved ? 'border-indigo-500/30 from-gray-800 to-gray-900' : 'border-gray-700/30 from-gray-800/50 to-gray-900/50'} border p-5 shadow-lg transition-all hover:shadow-xl`}
					>
						{#if badge.achieved}
							<div
								class="absolute -top-6 -right-6 h-12 w-12 rotate-45 bg-gradient-to-r from-indigo-500 to-purple-500"
							></div>
						{/if}

						<div class="flex">
							<div
								class={`mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${badge.achieved ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-700'}`}
							>
								{#if badge.name === 'beginner'}
									<span class="text-2xl">🚀</span>
								{:else if badge.name === 'marathoner'}
									<span class="text-2xl">🏃</span>
								{:else if badge.name === 'critic'}
									<span class="text-2xl">🎭</span>
								{/if}
							</div>

							<div class={badge.achieved ? '' : 'opacity-50'}>
								<h3 class="font-bold text-white">
									{badge.description.split(':')[0]}
								</h3>
								<p class="mt-1 text-sm text-gray-400">
									{badge.description.split(':')[1]}
								</p>
								{#if badge.achieved && badge.achievedAt}
									<p class="mt-2 text-xs text-indigo-400">
										Conquistado em {new Date(badge.achievedAt).toLocaleDateString()}
									</p>
								{/if}
							</div>

							{#if badge.achieved}
								<div
									class="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clip-rule="evenodd"
										/>
									</svg>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if selectedTab === 'favorites'}
		<div class="animate-fadeIn space-y-4">
			<h2 class="mb-4 text-xl font-bold text-white">Meus Favoritos</h2>

			{#if favorites.length > 0}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{#each favorites as anime}
						<div
							class="group relative overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-lg transition-all duration-300 hover:border-indigo-500/30"
						>
							<div class="relative h-48 overflow-hidden">
								<img
									src={anime.imageUrl || 'https://via.placeholder.com/300x400'}
									alt={anime.title}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"
								></div>
								<div class="absolute top-2 right-2">
									<div
										class="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/80 text-white shadow-lg"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="currentColor"
											class="h-5 w-5"
										>
											<path
												d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
											/>
										</svg>
									</div>
								</div>
								<div class="absolute right-0 bottom-0 left-0 p-3">
									<h3 class="truncate text-base font-bold text-white">{anime.title}</h3>
									{#if anime.personalScore}
										<div class="mt-1 flex items-center">
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
											<span class="text-sm font-medium text-amber-400"
												>{anime.personalScore}/10</span
											>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="rounded-xl bg-gray-800 p-8 text-center">
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
							d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
						/>
					</svg>
					<p class="mt-4 text-gray-400">Você ainda não marcou nenhum anime como favorito</p>
					<button
						class="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-colors hover:bg-indigo-700"
					>
						Explorar Animes
					</button>
				</div>
			{/if}
		</div>
	{:else if selectedTab === 'settings'}
		<div class="animate-fadeIn space-y-6">
			<div
				class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg"
			>
				<h3 class="mb-4 text-lg font-semibold text-white">Configurações de Perfil</h3>

				<div class="space-y-4">
					<div>
						<label for="username" class="block text-sm font-medium text-gray-300"
							>Nome de Usuário</label
						>
						<input
							type="text"
							id="username"
							value={userData.username}
							class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
						/>
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-300">Email</label>
						<input
							type="email"
							id="email"
							value="usuario@exemplo.com"
							class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900 p-2.5 text-white placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
						/>
					</div>

					<div>
						<label for="avatar" class="block text-sm font-medium text-gray-300">Avatar</label>
						<div class="mt-1 flex items-center">
							{#if userData.avatarUrl}
								<img
									src={userData.avatarUrl}
									alt="Avatar"
									class="h-12 w-12 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-lg font-bold text-white"
								>
									{getInitials(userData.username)}
								</div>
							{/if}
							<button
								class="ml-4 rounded-lg bg-gray-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-600"
							>
								Alterar
							</button>
						</div>
					</div>

					<div class="pt-4">
						<button
							class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none"
						>
							Salvar Alterações
						</button>
					</div>
				</div>
			</div>

			<div
				class="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-gray-800 to-gray-900 p-6 shadow-lg"
			>
				<h3 class="mb-4 text-lg font-semibold text-white">Preferências</h3>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-gray-300">Notificações por Email</span>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" class="peer sr-only" checked />
							<div
								class="h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
							></div>
						</label>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-300">Modo Escuro</span>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" class="peer sr-only" checked />
							<div
								class="h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
							></div>
						</label>
					</div>

					<div class="flex items-center justify-between">
						<span class="text-gray-300">Perfil Público</span>
						<label class="relative inline-flex cursor-pointer items-center">
							<input type="checkbox" class="peer sr-only" />
							<div
								class="h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
							></div>
						</label>
					</div>
				</div>
			</div>
		</div>
	{/if}
</section>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.3s ease-out forwards;
	}
</style>
