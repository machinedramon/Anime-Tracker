// src/lib/utils/api.ts
// Interface para anime
export interface AnimeSearchResult {
	mal_id: number;
	title: string;
	title_english: string | null;
	images: {
		jpg: {
			image_url: string;
			small_image_url: string;
			large_image_url: string;
		};
	};
	episodes: number | null;
	score: number | null;
	studios: Array<{ name: string }>;
	type: string; // TV, OVA, Movie, etc.
	synopsis: string;
	status?: string;
}

export interface AnimeSearchResponse {
	data: AnimeSearchResult[];
}

// Função para buscar animes por nome
export async function searchAnime(query: string): Promise<AnimeSearchResult[]> {
	try {
		// Adicione um pequeno atraso para não sobrecarregar a API
		await new Promise((resolve) => setTimeout(resolve, 300));

		const response = await fetch(
			`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10`
		);

		if (!response.ok) {
			throw new Error(`API respondeu com status ${response.status}`);
		}

		const data = (await response.json()) as AnimeSearchResponse;
		return data.data;
	} catch (error) {
		console.error('Erro ao buscar animes:', error);
		return [];
	}
}

// Função para buscar detalhes de um anime por ID
export async function getAnimeById(malId: number): Promise<AnimeSearchResult | null> {
	try {
		const response = await fetch(`https://api.jikan.moe/v4/anime/${malId}`);

		if (!response.ok) {
			throw new Error(`API respondeu com status ${response.status}`);
		}

		const data = (await response.json()) as { data: AnimeSearchResult };
		return data.data;
	} catch (error) {
		console.error(`Erro ao buscar anime ${malId}:`, error);
		return null;
	}
}
