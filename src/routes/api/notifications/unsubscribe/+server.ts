// src/routes/api/notifications/unsubscribe/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		// In a real app, get user ID from session
		const userId = 1; // Placeholder

		await db
			.update(schema.userProfiles)
			.set({
				notificationsEnabled: false
			})
			.where(eq(schema.userProfiles.id, userId));

		return json({ success: true });
	} catch (error) {
		console.error('Error unsubscribing from notifications:', error);
		return json({ success: false, error: 'Failed to unsubscribe' }, { status: 500 });
	}
}
