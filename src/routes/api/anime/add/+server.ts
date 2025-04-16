// src/routes/api/anime/add/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { checkAndUpdateBadges } from '$lib/server/badges';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const newAnime = await request.json();

		// Corrigir o campo lastUpdated para ser um objeto Date
		if (typeof newAnime.lastUpdated === 'string') {
			newAnime.lastUpdated = new Date(newAnime.lastUpdated);
		} else if (!(newAnime.lastUpdated instanceof Date)) {
			newAnime.lastUpdated = new Date(); // Fallback para data atual
		}

		// Verificar se o anime já existe no banco
		const existingAnime = await db
			.select()
			.from(schema.animes)
			.where(eq(schema.animes.malId, newAnime.malId))
			.limit(1);

		if (existingAnime.length > 0) {
			return json(
				{
					success: false,
					message: 'Este anime já está no seu diário.'
				},
				{ status: 400 }
			);
		}

		// Inserir o novo anime
		const [insertedAnime] = await db.insert(schema.animes).values(newAnime).returning();

		// Verificar e atualizar badges
		await checkAndUpdateBadges();

		return json(
			{
				success: true,
				anime: insertedAnime
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Erro ao adicionar anime:', error);
		return json(
			{
				success: false,
				message: 'Erro ao adicionar anime ao diário.'
			},
			{ status: 500 }
		);
	}
}
