// src/routes/profile/+page.server.ts
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

export async function load() {
	try {
		// Buscar todos os animes do banco de dados
		const animes = await db.select().from(schema.animes);

		// Buscar badges
		const badges = await db.select().from(schema.badges);

		// Buscar perfil do usuário (assumindo que temos apenas um usuário por agora)
		// Em uma implementação real, isso seria baseado em autenticação
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let userProfile;
		const profiles = await db.select().from(schema.userProfiles).limit(1);

		if (profiles.length === 0) {
			// Criar um perfil padrão se não existir
			const [newProfile] = await db
				.insert(schema.userProfiles)
				.values({
					username: 'AnimeEnthusiast',
					email: 'user@example.com',
					joinDate: new Date(),
					theme: 'dark',
					notificationsEnabled: false
				})
				.returning();

			userProfile = newProfile;
		} else {
			userProfile = profiles[0];
		}

		return {
			animes,
			badges,
			userProfile,
			notificationsSupported: true // Frontend checará se realmente são suportadas
		};
	} catch (error) {
		console.error('Erro ao carregar dados do perfil:', error);
		return {
			animes: [],
			badges: [],
			userProfile: null,
			error: 'Falha ao carregar dados do perfil'
		};
	}
}

// Action para salvar atualizações de perfil
export const actions = {
	updateProfile: async ({ request }) => {
		try {
			const formData = await request.formData();
			const profileData = Object.fromEntries(formData);

			// Obter ID do perfil atual
			// Em uma implementação real, isso viria da sessão autenticada
			const profiles = await db.select().from(schema.userProfiles).limit(1);
			if (profiles.length === 0) {
				return { success: false, message: 'Perfil não encontrado' };
			}

			const profileId = profiles[0].id;

			// Converter valores de string para tipos apropriados
			const theme = profileData.theme as string;
			if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
				throw new Error('Invalid theme value');
			}

			const updatedProfile = {
				username: profileData.username as string,
				email: profileData.email as string,
				theme: theme as 'light' | 'dark' | 'system',
				notificationsEnabled: profileData.notificationsEnabled === 'true',
				watchingNotifications: profileData.watchingNotifications === 'true',
				reminderTime: profileData.reminderTime as string
			};

			// Atualizar perfil
			await db
				.update(schema.userProfiles)
				.set(updatedProfile)
				.where(eq(schema.userProfiles.id, profileId));

			return {
				success: true,
				message: 'Perfil atualizado com sucesso'
			};
		} catch (error) {
			console.error('Erro ao atualizar perfil:', error);
			return {
				success: false,
				message: 'Falha ao atualizar perfil'
			};
		}
	},

	updateNotifications: async ({ request }) => {
		try {
			const formData = await request.formData();
			const enabled = formData.get('enabled') === 'true';
			const subscription = formData.get('subscription');

			// Obter ID do perfil atual
			const profiles = await db.select().from(schema.userProfiles).limit(1);
			if (profiles.length === 0) {
				return { success: false, message: 'Perfil não encontrado' };
			}

			const profileId = profiles[0].id;

			// Atualizar configurações de notificação
			await db
				.update(schema.userProfiles)
				.set({
					notificationsEnabled: enabled,
					pushSubscription: subscription ? String(subscription) : null
				})
				.where(eq(schema.userProfiles.id, profileId));

			return {
				success: true,
				message: 'Configurações de notificação atualizadas'
			};
		} catch (error) {
			console.error('Erro ao atualizar notificações:', error);
			return {
				success: false,
				message: 'Falha ao atualizar notificações'
			};
		}
	}
};

// Necessário importar para as ações
import { eq } from 'drizzle-orm';
