// src/routes/api/notifications/settings/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const { watchingNotifications, reminderTime } = await request.json();

		// In a real app, get user ID from session
		const userId = 1; // Placeholder

		await db
			.update(schema.userProfiles)
			.set({
				watchingNotifications: !!watchingNotifications,
				reminderTime: reminderTime || '18:00'
			})
			.where(eq(schema.userProfiles.id, userId));

		return json({ success: true });
	} catch (error) {
		console.error('Error updating notification settings:', error);
		return json({ success: false, error: 'Failed to update settings' }, { status: 500 });
	}
}
