// src/routes/+layout.server.ts
import { initBadges } from '$lib/server/badges';

export async function load() {
	// Inicializa os badges no banco de dados
	await initBadges();

	return {};
}
