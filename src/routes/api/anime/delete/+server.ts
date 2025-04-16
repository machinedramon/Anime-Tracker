// src/routes/api/anime/delete/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { checkAndUpdateBadges } from '$lib/server/badges';
import { eq } from 'drizzle-orm';

export async function DELETE({ url }) {
	try {
		const id = Number(url.searchParams.get('id'));

		if (!id) {
			return json(
				{
					success: false,
					message: 'ID inválido'
				},
				{ status: 400 }
			);
		}

		// Excluir o anime
		await db.delete(schema.animes).where(eq(schema.animes.id, id));

		// Verificar e atualizar badges
		await checkAndUpdateBadges();

		return json({
			success: true
		});
	} catch (error) {
		console.error('Erro ao excluir anime:', error);
		return json(
			{
				success: false,
				message: 'Erro ao excluir anime.'
			},
			{ status: 500 }
		);
	}
}
