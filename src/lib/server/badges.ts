// src/lib/server/badges.ts
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

// Função para inicializar os badges se eles não existirem
export async function initBadges() {
	const existingBadges = await db.select().from(schema.badges);

	if (existingBadges.length === 0) {
		// Inicializa os badges padrão
		await db.insert(schema.badges).values([
			{
				name: 'beginner',
				description: 'Começou a jornada: Adicione 5 animes em "Assistindo"',
				achieved: false
			},
			{
				name: 'marathoner',
				description: 'Maratonista: Complete 10 animes',
				achieved: false
			},
			{
				name: 'critic',
				description: 'Crítico exigente: Drope 3 animes',
				achieved: false
			}
		]);
	}
}

// Função para verificar e atualizar as conquistas com base no estado atual
export async function checkAndUpdateBadges() {
	// Verificar dados para badges
	const watchingCountResult = await db
		.select({ count: sql`count(*)` })
		.from(schema.animes)
		.where(eq(schema.animes.status, 'watching'));

	const completedCountResult = await db
		.select({ count: sql`count(*)` })
		.from(schema.animes)
		.where(eq(schema.animes.status, 'completed'));

	const droppedCountResult = await db
		.select({ count: sql`count(*)` })
		.from(schema.animes)
		.where(eq(schema.animes.status, 'dropped'));

	const watchingCount = Number(watchingCountResult[0]?.count || 0);
	const completedCount = Number(completedCountResult[0]?.count || 0);
	const droppedCount = Number(droppedCountResult[0]?.count || 0);

	// Atualiza badges baseado em contagens
	if (watchingCount >= 5) {
		await db
			.update(schema.badges)
			.set({
				achieved: true,
				achievedAt: new Date()
			})
			.where(eq(schema.badges.name, 'beginner'));
	}

	if (completedCount >= 10) {
		await db
			.update(schema.badges)
			.set({
				achieved: true,
				achievedAt: new Date()
			})
			.where(eq(schema.badges.name, 'marathoner'));
	}

	if (droppedCount >= 3) {
		await db
			.update(schema.badges)
			.set({
				achieved: true,
				achievedAt: new Date()
			})
			.where(eq(schema.badges.name, 'critic'));
	}
}

// Função para obter todas as badges
export async function getAllBadges() {
	return db.select().from(schema.badges);
}
