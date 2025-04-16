<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '../app.css';
	import { themeStore, toggleTheme, initTheme } from '$lib/stores/theme.svelte';
	import { page } from '$app/stores';

	// biome-ignore lint/style/useConst: <explanation>
	let { children } = $props();

	// Estados locais
	let isMenuOpen = $state(false);

	// Inicializar o tema ao carregar o componente
	initTheme();

	// Verificar rota atual para navegação
	$effect(() => {
		// Fechar menu móvel ao navegar
		isMenuOpen = false;
	});

	// Determinar a rota ativa
	function isActive(path: string): boolean {
		return $page.url.pathname === path;
	}
</script>

<div
	class="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 dark:from-gray-900 dark:to-gray-950 dark:text-gray-100"
>
	<div
		class="pointer-events-none fixed inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"
	></div>

	<header
		class="sticky top-0 z-40 border-b border-gray-800/50 bg-gray-900/80 shadow-lg backdrop-blur-lg"
	>
		<div class="container mx-auto px-4 py-3">
			<div class="flex items-center justify-between">
				<!-- Logo -->
				<a href="/" class="flex items-center space-x-2">
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6 text-white"
							viewBox="0 0 24 24"
							fill="none"
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
					<div
						class="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-xl font-bold text-transparent dark:from-indigo-300 dark:to-purple-300"
					>
						Anime Tracker
					</div>
				</a>

				<!-- Desktop Navigation -->
				<nav class="hidden md:block">
					<ul class="flex space-x-1">
						<li>
							<a
								href="/"
								class={`flex items-center space-x-1 rounded-lg px-4 py-2 font-medium transition-all duration-200
									${
										isActive('/')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								<span>Dashboard</span>
							</a>
						</li>
						<li>
							<a
								href="/search"
								class={`flex items-center space-x-1 rounded-lg px-4 py-2 font-medium transition-all duration-200
									${
										isActive('/search')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span>Buscar</span>
							</a>
						</li>
						<li>
							<a
								href="/diary"
								class={`flex items-center space-x-1 rounded-lg px-4 py-2 font-medium transition-all duration-200
									${
										isActive('/diary')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
								<span>Meu Diário</span>
							</a>
						</li>
						<li>
							<a
								href="/profile"
								class={`flex items-center space-x-1 rounded-lg px-4 py-2 font-medium transition-all duration-200
									${
										isActive('/profile')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-4 w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>Perfil</span>
							</a>
						</li>
					</ul>
				</nav>

				<div class="flex items-center space-x-3">
					<!-- Theme Toggle -->
					<button
						onclick={toggleTheme}
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-all duration-300 hover:bg-indigo-600 hover:text-white"
						aria-label="Alternar tema"
					>
						{#if themeStore.current === 'dark'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
								/>
							</svg>
						{/if}
					</button>

					<!-- Mobile Menu Button -->
					<button
						class="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-300 transition-all duration-300 hover:bg-indigo-600 hover:text-white md:hidden"
						aria-label="Abrir menu"
						onclick={() => (isMenuOpen = !isMenuOpen)}
					>
						{#if isMenuOpen}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						{:else}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							</svg>
						{/if}
					</button>
				</div>
			</div>
		</div>
	</header>

	<!-- Mobile Navigation Menu -->
	{#if isMenuOpen}
		<div
			class="animate-fadeIn fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm md:hidden"
			onclick={() => (isMenuOpen = false)}
			onkeydown={(e) => e.key === 'Escape' && (isMenuOpen = false)}
			role="dialog"
			tabindex="-1"
			aria-label="Menu móvel"
		>
			<div
				class="animate-slideIn absolute top-[61px] right-0 h-screen w-64 bg-gray-900 p-4 shadow-lg"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.stopPropagation()}
				role="menu"
				tabindex="0"
			>
				<nav>
					<ul class="space-y-1">
						<li>
							<a
								href="/"
								class={`flex items-center space-x-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200
									${
										isActive('/')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
									/>
								</svg>
								<span>Dashboard</span>
							</a>
						</li>
						<li>
							<a
								href="/search"
								class={`flex items-center space-x-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200
									${
										isActive('/search')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
									/>
								</svg>
								<span>Buscar</span>
							</a>
						</li>
						<li>
							<a
								href="/diary"
								class={`flex items-center space-x-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200
									${
										isActive('/diary')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
									/>
								</svg>
								<span>Meu Diário</span>
							</a>
						</li>
						<li>
							<a
								href="/profile"
								class={`flex items-center space-x-2 rounded-lg px-4 py-2.5 font-medium transition-all duration-200
									${
										isActive('/profile')
											? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
											: 'text-gray-300 hover:bg-gray-800 hover:text-white'
									}`}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
									/>
								</svg>
								<span>Perfil</span>
							</a>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	{/if}

	<main class="relative z-10 container mx-auto flex-1 px-4 py-8">
		{@render children()}
	</main>

	<footer class="border-t border-gray-800/30 bg-gray-900/30 py-6 backdrop-blur-sm">
		<div class="container mx-auto px-4">
			<div class="flex flex-col items-center justify-between gap-4 md:flex-row">
				<div class="text-center md:text-left">
					<div class="flex items-center justify-center space-x-2 md:justify-start">
						<div
							class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-600 to-purple-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4 text-white"
								viewBox="0 0 24 24"
								fill="none"
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
						<span class="text-sm font-medium text-gray-400">Anime Tracker</span>
					</div>
					<p class="mt-1 text-xs text-gray-500">&copy; 2025 Todos os direitos reservados</p>
				</div>

				<div class="flex space-x-4">
					<a
						href="https://twitter.com/animetracker"
						class="text-gray-500 transition-colors hover:text-indigo-400"
						aria-label="Visite nossa página no Twitter"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
							></path>
						</svg>
					</a>
					<a
						href="https://instagram.com/animetracker"
						class="text-gray-500 transition-colors hover:text-indigo-400"
						aria-label="Visite nossa página no Instagram"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
							/>
						</svg>
					</a>
					<a
						href="https://facebook.com/animetracker"
						class="text-gray-500 transition-colors hover:text-indigo-400"
						aria-label="Visite nossa página no Facebook"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-5 w-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 0.2s ease-out forwards;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
		}
		to {
			transform: translateX(0);
		}
	}

	.animate-slideIn {
		animation: slideIn 0.3s ease-out forwards;
	}
</style>
