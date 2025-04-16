<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import type { Anime } from '$lib/server/db/schema';
	import type { Badge } from '$lib/server/db/schema';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';

	// biome-ignore lint/style/useConst: <explanation>
	let { data, form } = $props();

	// biome-ignore lint/style/useConst: <explanation>
	let badges = $state<Badge[]>(data.badges || []);
	// biome-ignore lint/style/useConst: <explanation>
	let animes = $state<Anime[]>(data.animes || []);

	// Perfil do usuário
	// biome-ignore lint/style/useConst: <explanation>
	let userProfile = $state(
		data.userProfile || {
			username: 'AnimeEnthusiast',
			email: 'user@example.com',
			theme: 'dark',
			notificationsEnabled: false,
			watchingNotifications: true,
			reminderTime: '18:00',
			avatarUrl: null,
			joinDate: new Date().toISOString()
		}
	);

	// Estados da UI
	// biome-ignore lint/style/useConst: <explanation>
	let activeTab = $state('stats'); // 'stats', 'achievements', 'settings'
	let notificationsSupported = $state(false);
	let notification = $state({ show: false, type: '', message: '' });
	// biome-ignore lint/style/useConst: <explanation>
	let isUpdatingProfile = $state(false);
	let isSubscribing = $state(false);
	let swRegistration = $state<ServiceWorkerRegistration | null>(null);

	// Estatísticas para exibição
	// biome-ignore lint/style/useConst: <explanation>
	let watchingCount = $derived(animes.filter((a) => a.status === 'watching').length);
	// biome-ignore lint/style/useConst: <explanation>
	let completedCount = $derived(animes.filter((a) => a.status === 'completed').length);
	// biome-ignore lint/style/useConst: <explanation>
	let droppedCount = $derived(animes.filter((a) => a.status === 'dropped').length);
	// biome-ignore lint/style/useConst: <explanation>
	let pausedCount = $derived(animes.filter((a) => a.status === 'paused').length);
	// biome-ignore lint/style/useConst: <explanation>
	let plannedCount = $derived(animes.filter((a) => a.status === 'planned').length);

	// Total assistido
	// biome-ignore lint/style/useConst: <explanation>
	let totalWatchedEpisodes = $derived(
		animes.reduce((sum, anime) => sum + (anime.currentEpisode || 0), 0)
	);

	// Tempo aproximado assistido (24 min por episódio)
	// biome-ignore lint/style/useConst: <explanation>
	let totalWatchTimeInMinutes = $derived(totalWatchedEpisodes * 24);

	// Descobrir o anime com maior nota
	// biome-ignore lint/style/useConst: <explanation>
	let topRatedAnime = $derived(
		animes.reduce(
			(top, current) => {
				if (
					!top ||
					(current.personalScore &&
						(!top.personalScore || current.personalScore > top.personalScore))
				) {
					return current;
				}
				return top;
			},
			null as Anime | null
		)
	);

	// Dados para o gráfico de distribuição
	// biome-ignore lint/style/useConst: <explanation>
	let chartData = $derived(
		[
			{ label: 'Assistindo', value: watchingCount, color: '#6366f1' }, // indigo-500
			{ label: 'Completos', value: completedCount, color: '#10b981' }, // emerald-500
			{ label: 'Droppados', value: droppedCount, color: '#ef4444' }, // red-500
			{ label: 'Pausados', value: pausedCount, color: '#f59e0b' }, // amber-500
			{ label: 'Planejados', value: plannedCount, color: '#6b7280' } // gray-500
		].filter((item) => item.value > 0)
	);

	// biome-ignore lint/style/useConst: <explanation>
	let totalAnimes = $derived(animes.length);
	// biome-ignore lint/style/useConst: <explanation>
	let totalChartValues = $derived(chartData.reduce((sum: number, item) => sum + item.value, 0));

	// Função auxiliar para calcular o ângulo inicial no gráfico
	function getStartAngle(index: number): number {
		return chartData
			.slice(0, index)
			.reduce((sum: number, item) => sum + (item.value / totalChartValues) * 360, 0);
	}

	// Função para formatar o tempo em formato legível
	function formatWatchTime(minutes: number): string {
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);

		if (days > 0) {
			return `${days}d ${hours % 24}h ${minutes % 60}m`;
		}
		return `${hours}h ${minutes % 60}m`;
	}

	// Função para mostrar notificação
	function showNotification(type: string, message: string, duration = 3000) {
		notification = { show: true, type, message };
		setTimeout(() => {
			notification = { ...notification, show: false };
		}, duration);
	}

	// Função para verificar se as notificações são suportadas
	async function checkNotificationsSupport() {
		notificationsSupported = 'serviceWorker' in navigator && 'PushManager' in window;

		if (notificationsSupported) {
			try {
				// Verificar registro do service worker
				swRegistration =
					(await navigator.serviceWorker.getRegistration('/service-worker.js')) || null;

				// Se não estiver registrado, registre-o
				if (!swRegistration) {
					swRegistration = await navigator.serviceWorker.register('/service-worker.js');
				}

				// Verificar se já está inscrito
				const subscription = await swRegistration.pushManager.getSubscription();
				if (subscription && userProfile.notificationsEnabled) {
					// Já está inscrito
					console.log('Notificações já estão ativas');
				}
			} catch (error) {
				console.error('Erro ao inicializar service worker:', error);
				notificationsSupported = false;
			}
		}
	}

	// Funções para gerenciar notificações push
	async function subscribeToNotifications() {
		if (!notificationsSupported || !swRegistration) {
			showNotification('error', 'Notificações não são suportadas neste navegador');
			return;
		}

		try {
			isSubscribing = true;

			// Verificar permissão
			const permission = await Notification.requestPermission();
			if (permission !== 'granted') {
				showNotification('error', 'Permissão de notificação negada');
				return;
			}

			// Obter a chave pública VAPID do servidor
			const vapidResponse = await fetch('/api/notifications/vapid-key');
			if (!vapidResponse.ok) {
				throw new Error('Falha ao obter chave VAPID');
			}

			const { publicKey } = await vapidResponse.json();

			// Converter a chave base64 para Uint8Array
			const applicationServerKey = urlBase64ToUint8Array(publicKey);

			// Inscrever-se
			const subscription = await swRegistration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey
			});

			// Enviar a inscrição para o servidor
			const form = new FormData();
			form.append('enabled', 'true');
			form.append('subscription', JSON.stringify(subscription));

			// Usar a action do servidor
			const response = await fetch('?/updateNotifications', {
				method: 'POST',
				body: form
			});

			const result = await response.json();

			if (result.success) {
				userProfile.notificationsEnabled = true;
				showNotification('success', 'Notificações ativadas com sucesso');
			} else {
				throw new Error(result.message || 'Falha ao ativar notificações');
			}
		} catch (error) {
			console.error('Erro ao ativar notificações:', error);
			showNotification('error', 'Falha ao ativar notificações');
		} finally {
			isSubscribing = false;
		}
	}

	async function unsubscribeFromNotifications() {
		if (!notificationsSupported || !swRegistration) return;

		try {
			isSubscribing = true;

			// Obter a inscrição atual
			const subscription = await swRegistration.pushManager.getSubscription();

			// Cancelar a inscrição
			if (subscription) {
				await subscription.unsubscribe();
			}

			// Notificar o servidor
			const form = new FormData();
			form.append('enabled', 'false');

			// Usar a action do servidor
			const response = await fetch('?/updateNotifications', {
				method: 'POST',
				body: form
			});

			const result = await response.json();

			if (result.success) {
				userProfile.notificationsEnabled = false;
				showNotification('success', 'Notificações desativadas com sucesso');
			} else {
				throw new Error(result.message || 'Falha ao desativar notificações');
			}
		} catch (error) {
			console.error('Erro ao desativar notificações:', error);
			showNotification('error', 'Falha ao desativar notificações');
		} finally {
			isSubscribing = false;
		}
	}

	// Função para formatar iniciais do nome
	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase();
	}

	// Helper para converter base64 para Uint8Array (para chave VAPID)
	function urlBase64ToUint8Array(base64String: string) {
		const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);

		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}

		return outputArray;
	}

	// Observar atualizações do formulário
	$effect(() => {
		if (form?.success) {
			showNotification('success', form.message || 'Perfil atualizado com sucesso!');
		} else if (form?.success === false) {
			showNotification('error', form.message || 'Falha ao atualizar perfil');
		}
	});

	// Inicialização
	onMount(() => {
		checkNotificationsSupport();
	});
</script>

<svelte:head>
	<title>Perfil | Anime Tracker</title>
</svelte:head>

<!-- Neon background elements -->
<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
	<div
		class="animate-pulse-slow absolute top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]"
	></div>
	<div
		class="animate-pulse-slow animation-delay-1000 absolute -top-20 -right-20 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px]"
	></div>
	<div
		class="animate-pulse-slow animation-delay-2000 absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-blue-500/10 blur-[80px]"
	></div>
</div>

<section class="relative z-10">
	<!-- Perfil Header -->
	<div
		class="relative mb-8 overflow-hidden rounded-2xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl"
	>
		<div class="absolute inset-0 bg-gradient-to-r from-indigo-600/5 to-purple-600/5"></div>
		<div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl"></div>
		<div class="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl"></div>

		<div class="relative z-10 p-6 md:p-8">
			<div class="flex flex-col items-center gap-6 md:flex-row">
				<!-- Avatar -->
				{#if userProfile.avatarUrl}
					<img
						src={userProfile.avatarUrl}
						alt={userProfile.username}
						class="h-24 w-24 rounded-full border-4 border-indigo-500/30 object-cover shadow-lg transition-all duration-300 group-hover:border-indigo-500/50"
					/>
				{:else}
					<div class="group relative">
						<div
							class="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-30 blur transition duration-1000 group-hover:opacity-70"
						></div>
						<div
							class="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-2xl font-bold text-white"
						>
							{getInitials(userProfile.username)}
						</div>
					</div>
				{/if}

				<!-- User Info -->
				<div class="text-center md:text-left">
					<h1
						class="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-3xl font-bold text-transparent"
					>
						{userProfile.username}
					</h1>
					<p class="mt-1 text-gray-400">
						Otaku desde {new Date(userProfile.joinDate).toLocaleDateString()}
					</p>
					<div class="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
						<div class="group relative inline-flex overflow-hidden rounded-full">
							<span
								class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600/20 to-indigo-700/20"
							></span>
							<span class="relative px-3 py-1 text-sm font-medium text-indigo-300">
								<span class="font-semibold">{totalAnimes}</span> animes
							</span>
						</div>

						<div class="group relative inline-flex overflow-hidden rounded-full">
							<span
								class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-purple-700/20"
							></span>
							<span class="relative px-3 py-1 text-sm font-medium text-purple-300">
								<span class="font-semibold">{badges.filter((b) => b.achieved).length}</span> conquistas
							</span>
						</div>

						<div class="group relative inline-flex overflow-hidden rounded-full">
							<span
								class="animate-pulse-slow absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-blue-700/20"
							></span>
							<span class="relative px-3 py-1 text-sm font-medium text-blue-300">
								<span class="font-semibold">{totalWatchedEpisodes}</span> episódios
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Tabs -->
	<div class="mb-6">
		<div class="border-b border-gray-700/50">
			<div class="flex space-x-2 overflow-x-auto">
				<button
					class={`relative px-4 py-2 font-medium transition-all ${activeTab === 'stats' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (activeTab = 'stats')}
				>
					<span>Estatísticas</span>
					{#if activeTab === 'stats'}
						<span
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
						></span>
					{/if}
				</button>

				<button
					class={`relative px-4 py-2 font-medium transition-all ${activeTab === 'achievements' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (activeTab = 'achievements')}
				>
					<span>Conquistas</span>
					{#if activeTab === 'achievements'}
						<span
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
						></span>
					{/if}
				</button>

				<button
					class={`relative px-4 py-2 font-medium transition-all ${activeTab === 'settings' ? 'text-white' : 'text-gray-400 hover:text-gray-300'}`}
					onclick={() => (activeTab = 'settings')}
				>
					<span>Configurações</span>
					{#if activeTab === 'settings'}
						<span
							class="absolute right-0 bottom-0 left-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
						></span>
					{/if}
				</button>
			</div>
		</div>
	</div>

	<!-- Tab Content -->
	{#if activeTab === 'stats'}
		<div class="animate-fadeIn space-y-8">
			<!-- Stats Cards Row -->
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<!-- Total Animes -->
				<div
					class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
				>
					<div
						class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
					></div>
					<div class="relative z-10">
						<div class="flex items-start justify-between">
							<div>
								<h3 class="mb-1 text-sm font-medium text-gray-400">Total de Animes</h3>
								<p class="text-3xl font-bold text-white">{totalAnimes}</p>
							</div>
							<div class="rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<!-- Episódios Assistidos -->
				<div
					class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
				>
					<div
						class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
					></div>
					<div class="relative z-10">
						<div class="flex items-start justify-between">
							<div>
								<h3 class="mb-1 text-sm font-medium text-gray-400">Episódios Assistidos</h3>
								<p class="text-3xl font-bold text-white">{totalWatchedEpisodes}</p>
							</div>
							<div class="rounded-lg bg-blue-500/20 p-2 text-blue-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<!-- Tempo Assistindo -->
				<div
					class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
				>
					<div
						class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
					></div>
					<div class="relative z-10">
						<div class="flex items-start justify-between">
							<div>
								<h3 class="mb-1 text-sm font-medium text-gray-400">Tempo Assistindo</h3>
								<p class="text-3xl font-bold text-white">
									{formatWatchTime(totalWatchTimeInMinutes)}
								</p>
							</div>
							<div class="rounded-lg bg-purple-500/20 p-2 text-purple-300">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
						</div>
					</div>
				</div>

				<!-- Anime Favorito -->
				{#if topRatedAnime}
					<div
						class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
					>
						<div
							class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
						></div>
						<div class="relative z-10">
							<div class="flex items-start justify-between">
								<div>
									<h3 class="mb-1 text-sm font-medium text-gray-400">Anime Favorito</h3>
									<p class="line-clamp-1 text-lg font-medium text-white">{topRatedAnime.title}</p>
									<div class="mt-1 flex items-center">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="#FBBF24"
											class="mr-1 h-5 w-5"
										>
											<path
												fill-rule="evenodd"
												d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
												clip-rule="evenodd"
											/>
										</svg>
										<span class="font-bold text-amber-400">{topRatedAnime.personalScore}/10</span>
									</div>
								</div>
								<div class="rounded-lg bg-amber-500/20 p-2 text-amber-300">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-6 w-6"
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
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>

			<!-- Status Distribution Chart -->
			{#if chartData.length > 0}
				<div
					class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
				>
					<div
						class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
					></div>

					<div class="relative z-10">
						<h2
							class="mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-xl font-bold text-transparent"
						>
							Distribuição por Status
						</h2>

						<div class="flex flex-wrap gap-8">
							<div class="flex w-full justify-center md:w-1/2">
								<svg viewBox="0 0 100 100" class="h-64 w-64">
									<filter id="glow">
										<feGaussianBlur stdDeviation="3.5" result="blur" />
										<feComposite in="SourceGraphic" in2="blur" operator="over" />
									</filter>

									<!-- Donut hole -->
									<circle cx="50" cy="50" r="20" fill="#1f2937" />

									{#each chartData as segment, i}
										{@const startAngle = getStartAngle(i)}
										{@const endAngle = startAngle + (segment.value / totalChartValues) * 360}
										{@const startRad = ((startAngle - 90) * Math.PI) / 180}
										{@const endRad = ((endAngle - 90) * Math.PI) / 180}
										{@const x1 = 50 + 40 * Math.cos(startRad)}
										{@const y1 = 50 + 40 * Math.sin(startRad)}
										{@const x2 = 50 + 40 * Math.cos(endRad)}
										{@const y2 = 50 + 40 * Math.sin(endRad)}
										{@const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0}
										{@const midAngleRad =
											((startAngle + (endAngle - startAngle) / 2 - 90) * Math.PI) / 180}
										{@const labelX = 50 + 28 * Math.cos(midAngleRad)}
										{@const labelY = 50 + 28 * Math.sin(midAngleRad)}

										<g>
											<!-- Segment -->
											<path
												d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
												fill={segment.color}
												stroke="#1f2937"
												stroke-width="1"
												class="transition-all duration-300 hover:opacity-90 hover:filter"
												style="filter: url(#glow);"
											/>

											<!-- Percentage label inside segment (if segment is large enough) -->
											{#if endAngle - startAngle > 30}
												<text
													x={labelX}
													y={labelY}
													text-anchor="middle"
													dominant-baseline="middle"
													fill="white"
													font-size="9"
													font-weight="bold"
												>
													{Math.round((segment.value / totalChartValues) * 100)}%
												</text>
											{/if}
										</g>
									{/each}
								</svg>
							</div>

							<div class="flex w-full flex-col justify-center md:w-1/3">
								{#each chartData as segment}
									<div class="mb-3">
										<div class="mb-1 flex items-center">
											<span
												class="mr-2 inline-block h-4 w-4 rounded"
												style="background-color: {segment.color}"
											></span>
											<span class="font-medium text-white">{segment.label}</span>
										</div>
										<div class="flex justify-between text-sm">
											<span class="text-gray-400">{segment.value} animes</span>
											<span class="font-medium text-gray-300"
												>{Math.round((segment.value / totalChartValues) * 100)}%</span
											>
										</div>
										<div class="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-700">
											<div
												class="h-full rounded-full"
												style={`width: ${(segment.value / totalChartValues) * 100}%; background-color: ${segment.color}`}
											></div>
										</div>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	{:else if activeTab === 'achievements'}
		<div class="animate-fadeIn">
			<h2
				class="mb-6 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-xl font-bold text-transparent"
			>
				Minhas Conquistas
			</h2>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each badges as badge}
					<div
						class="group relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30"
					>
						<div
							class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/0 to-purple-500/0 opacity-0 blur transition-all duration-500 group-hover:from-indigo-500/10 group-hover:to-purple-500/10 group-hover:opacity-100"
						></div>

						{#if badge.achieved}
							<div
								class="absolute -top-6 -right-6 h-12 w-12 rotate-45 bg-gradient-to-r from-indigo-500 to-purple-500"
							></div>
						{/if}

						<div class="relative z-10 flex">
							<div
								class={`mr-4 flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${badge.achieved ? 'bg-gradient-to-br from-indigo-600 to-purple-600' : 'bg-gray-700'}`}
							>
								{#if badge.name === 'beginner'}
									<span class="drop-shadow-glow text-2xl filter">🚀</span>
								{:else if badge.name === 'marathoner'}
									<span class="drop-shadow-glow text-2xl filter">🏃</span>
								{:else if badge.name === 'critic'}
									<span class="drop-shadow-glow text-2xl filter">🎭</span>
								{/if}
							</div>

							<div class={badge.achieved ? '' : 'opacity-50'}>
								<h4 class="font-bold text-white">
									{badge.description.split(':')[0]}
								</h4>
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
										aria-label="Badge achieved indicator"
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
	{:else if activeTab === 'settings'}
		<div class="animate-fadeIn space-y-6">
			<!-- Perfil Settings -->
			<div
				class="relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 shadow-lg backdrop-blur-sm transition-all duration-300"
			>
				<div
					class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur"
				></div>
				<div class="relative z-10">
					<h3
						class="mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-lg font-bold text-transparent"
					>
						Configurações de Perfil
					</h3>

					<form method="POST" action="?/updateProfile" use:enhance>
						<div class="space-y-4">
							<div>
								<label for="username" class="block text-sm font-medium text-gray-300"
									>Nome de Usuário</label
								>
								<input
									type="text"
									id="username"
									name="username"
									value={userProfile.username}
									class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900/70 p-2.5 text-white placeholder-gray-400 shadow-sm backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
								/>
							</div>

							<div>
								<label for="email" class="block text-sm font-medium text-gray-300">Email</label>
								<input
									type="email"
									id="email"
									name="email"
									value={userProfile.email}
									class="mt-1 block w-full rounded-lg border border-gray-700 bg-gray-900/70 p-2.5 text-white placeholder-gray-400 shadow-sm backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
								/>
							</div>

							<div>
								<label for="avatar" class="block text-sm font-medium text-gray-300">Avatar</label>
								<div class="mt-1 flex items-center">
									{#if userProfile.avatarUrl}
										<img
											src={userProfile.avatarUrl}
											alt="Avatar"
											class="h-12 w-12 rounded-full object-cover"
										/>
									{:else}
										<div
											class="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-lg font-bold text-white"
										>
											{getInitials(userProfile.username)}
										</div>
									{/if}
									<button
										type="button"
										class="group relative ml-4 inline-flex items-center overflow-hidden rounded-lg px-3 py-1.5"
									>
										<span
											class="absolute inset-0 bg-gradient-to-r from-indigo-600/70 to-purple-600/70 transition-all duration-300 group-hover:from-indigo-600 group-hover:to-purple-600"
										></span>
										<span class="relative text-xs font-medium text-white">Alterar</span>
									</button>
								</div>
							</div>

							<div class="pt-4">
								<button
									type="submit"
									disabled={isUpdatingProfile}
									class="group relative inline-flex items-center overflow-hidden rounded-lg px-4 py-2"
								>
									<span
										class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover:from-indigo-700 group-hover:to-purple-700"
									></span>
									<span class="relative text-sm font-medium text-white">
										{#if isUpdatingProfile}
											<span class="flex items-center">
												<svg
													class="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
													xmlns="http://www.w3.org/2000/svg"
													fill="none"
													viewBox="0 0 24 24"
												>
													<circle
														class="opacity-25"
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														stroke-width="4"
													></circle>
													<path
														class="opacity-75"
														fill="currentColor"
														d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
													></path>
												</svg>
												Salvando...
											</span>
										{:else}
											Salvar Alterações
										{/if}
									</span>
								</button>
							</div>
						</div>
					</form>
				</div>
			</div>

			<!-- Notification Settings -->
			<div
				class="relative overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 shadow-lg backdrop-blur-sm transition-all duration-300"
			>
				<div
					class="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 blur"
				></div>
				<div class="relative z-10">
					<h3
						class="mb-4 bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-lg font-bold text-transparent"
					>
						Configurações de Notificações
					</h3>

					{#if notificationsSupported}
						<div class="mb-4 flex items-center justify-between">
							<span class="text-gray-300">Notificações Push</span>
							<button
								type="button"
								onclick={userProfile.notificationsEnabled
									? unsubscribeFromNotifications
									: subscribeToNotifications}
								disabled={isSubscribing}
								aria-label={userProfile.notificationsEnabled
									? 'Desativar notificações push'
									: 'Ativar notificações push'}
								class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:outline-none"
								class:bg-gray-700={!userProfile.notificationsEnabled}
								class:bg-indigo-600={userProfile.notificationsEnabled}
							>
								<span
									class="pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
									class:translate-x-5={userProfile.notificationsEnabled}
									class:translate-x-0={!userProfile.notificationsEnabled}
								>
									<span
										class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
										class:opacity-0={userProfile.notificationsEnabled}
										class:opacity-100={!userProfile.notificationsEnabled}
									>
										<svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
											<path
												d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
												stroke="currentColor"
												stroke-width="2"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									</span>
									<span
										class="absolute inset-0 flex h-full w-full items-center justify-center transition-opacity"
										class:opacity-100={userProfile.notificationsEnabled}
										class:opacity-0={!userProfile.notificationsEnabled}
									>
										<svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
											<path
												d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z"
											/>
										</svg>
									</span>
								</span>
							</button>
						</div>

						{#if userProfile.notificationsEnabled}
							<form method="POST" action="?/updateProfile">
								<input type="hidden" name="username" value={userProfile.username} />
								<input type="hidden" name="email" value={userProfile.email} />
								<input type="hidden" name="theme" value={userProfile.theme} />
								<input type="hidden" name="notificationsEnabled" value="true" />

								<div class="space-y-4">
									<div class="flex items-center justify-between">
										<span class="text-gray-300">Lembretes de Animes em Andamento</span>
										<label class="relative inline-flex cursor-pointer items-center">
											<input
												type="checkbox"
												name="watchingNotifications"
												checked={userProfile.watchingNotifications}
												class="peer sr-only"
											/>
											<div
												class="h-6 w-11 rounded-full bg-gray-700 peer-checked:bg-indigo-600 peer-focus:ring-2 peer-focus:ring-indigo-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full"
											></div>
										</label>
									</div>

									<div>
										<label for="reminderTime" class="mb-1 block text-sm font-medium text-gray-300"
											>Horário do Lembrete</label
										>
										<input
											type="time"
											id="reminderTime"
											name="reminderTime"
											value={userProfile.reminderTime}
											class="w-full rounded-lg border border-gray-700 bg-gray-900/70 p-2.5 text-white backdrop-blur-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
										/>
									</div>

									<div>
										<button
											type="submit"
											class="group relative inline-flex items-center overflow-hidden rounded-lg px-4 py-2"
										>
											<span
												class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300 group-hover:from-indigo-700 group-hover:to-purple-700"
											></span>
											<span class="relative text-sm font-medium text-white"
												>Salvar Preferências</span
											>
										</button>
									</div>
								</div>
							</form>
						{/if}
					{:else}
						<div class="rounded-lg border border-red-700/30 bg-red-900/20 p-4">
							<p class="text-red-400">Seu navegador não suporta notificações push.</p>
						</div>
					{/if}
				</div>
			</div>
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

	.filter.drop-shadow-glow {
		filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.5));
	}
</style>
