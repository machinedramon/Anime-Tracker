// src/routes/api/anime/update/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { checkAndUpdateBadges } from '$lib/server/badges';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const animeToUpdate = await request.json();

		// Corrigir o campo lastUpdated para ser um objeto Date
		if (typeof animeToUpdate.lastUpdated === 'string') {
			animeToUpdate.lastUpdated = new Date(animeToUpdate.lastUpdated);
		} else if (!(animeToUpdate.lastUpdated instanceof Date)) {
			animeToUpdate.lastUpdated = new Date(); // Fallback para data atual
		}

		// Atualizar o anime
		const [updatedAnime] = await db
			.update(schema.animes)
			.set(animeToUpdate)
			.where(eq(schema.animes.id, animeToUpdate.id))
			.returning();

		// Verificar e atualizar badges
		await checkAndUpdateBadges();

		return json({
			success: true,
			anime: updatedAnime
		});
	} catch (error) {
		console.error('Erro ao atualizar anime:', error);
		return json(
			{
				success: false,
				message: 'Erro ao atualizar anime.'
			},
			{ status: 500 }
		);
	}
}
