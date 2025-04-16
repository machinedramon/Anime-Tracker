// src/lib/stores/theme.svelte.ts
// Criamos um objeto com o valor inicial
export const themeStore = $state({
	current: 'dark' as 'dark' | 'light'
});

// Uma função para inicializar o tema - será chamada no +layout.svelte
export function initTheme() {
	if (typeof localStorage !== 'undefined') {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme === 'dark' || storedTheme === 'light') {
			themeStore.current = storedTheme as 'dark' | 'light';
		}
	}

	// Aqui é seguro usar $effect porque será chamado dentro do componente
	$effect(() => {
		if (typeof document !== 'undefined' && typeof localStorage !== 'undefined') {
			document.documentElement.setAttribute('data-theme', themeStore.current);
			localStorage.setItem('theme', themeStore.current);
		}
	});
}

// Função para alternar entre temas
export function toggleTheme() {
	themeStore.current = themeStore.current === 'dark' ? 'light' : 'dark';
}
