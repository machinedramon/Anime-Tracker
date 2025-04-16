// src/routes/diary/+page.server.ts
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { checkAndUpdateBadges } from '$lib/server/badges';

export async function load() {
	// Verificar e atualizar badges
	await checkAndUpdateBadges();

	// Buscar todos os animes do banco de dados
	const animes = await db.select().from(schema.animes);

	return { animes };
}
