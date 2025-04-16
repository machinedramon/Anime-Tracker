// src/routes/+page.server.ts
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { initBadges } from '$lib/server/badges';

export async function load() {
	// Inicializa os badges se necessário
	await initBadges();

	// Buscar todos os animes do banco de dados
	const animes = await db.select().from(schema.animes);

	// Buscar badges
	const badges = await db.select().from(schema.badges);

	return { animes, badges };
}
