// src/routes/api/notifications/subscribe/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Public VAPID key (same as in notification.ts)
const VAPID_PUBLIC_KEY = 'BGEx5ZxdGm...';

export async function GET() {
	return json({ publicKey: VAPID_PUBLIC_KEY });
}

export async function POST({ request }) {
	try {
		const { subscription } = await request.json();

		// In a real app, get user ID from session
		const userId = 1; // Placeholder

		await db
			.update(schema.userProfiles)
			.set({
				pushSubscription: JSON.stringify(subscription),
				notificationsEnabled: true
			})
			.where(eq(schema.userProfiles.id, userId));

		return json({ success: true });
	} catch (error) {
		console.error('Error subscribing to notifications:', error);
		return json({ success: false, error: 'Failed to subscribe' }, { status: 500 });
	}
}
