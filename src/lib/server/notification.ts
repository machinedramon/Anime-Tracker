// src/lib/server/notification.ts
import webpush from 'web-push';
import { db } from './db';
import * as schema from './db/schema';
import { eq, and } from 'drizzle-orm';

// VAPID keys
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = import.meta.env.VITE_VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
	throw new Error('VAPID keys must be set');
}

webpush.setVapidDetails('mailto:mugendramon@gmail.com', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Function to send notification to a user
interface NotificationData {
	type: string;
	count?: number;
}

export async function sendNotification(
	userId: number,
	title: string,
	body: string,
	icon?: string,
	data?: NotificationData
) {
	try {
		const user = await db
			.select()
			.from(schema.userProfiles)
			.where(eq(schema.userProfiles.id, userId))
			.limit(1);

		if (!user.length || !user[0].pushSubscription || !user[0].notificationsEnabled) {
			return { success: false, message: 'User not found or notifications disabled' };
		}

		const subscription = JSON.parse(user[0].pushSubscription);

		const payload = JSON.stringify({
			title,
			body,
			icon: icon || '/images/logo.png',
			data
		});

		await webpush.sendNotification(subscription, payload);
		return { success: true };
	} catch (error) {
		console.error('Error sending notification:', error);
		return { success: false, error };
	}
}

// Get all watching animes for users with enabled notifications
export async function checkAndSendWatchingReminders() {
	try {
		// Get users with notifications enabled
		const users = await db
			.select()
			.from(schema.userProfiles)
			.where(
				and(
					eq(schema.userProfiles.notificationsEnabled, true),
					eq(schema.userProfiles.watchingNotifications, true)
				)
			);

		for (const user of users) {
			if (!user.pushSubscription) continue;

			// Get all animes with status 'watching'
			const animes = await db
				.select()
				.from(schema.animes)
				.where(eq(schema.animes.status, 'watching'));

			if (animes.length > 0) {
				// Send a reminder notification
				await sendNotification(
					user.id,
					'Anime Reminder',
					`You have ${animes.length} animes in your watching list. Continue your journey!`,
					undefined,
					{ type: 'watching_reminder', count: animes.length }
				);
			}
		}

		return { success: true };
	} catch (error) {
		console.error('Error sending watching reminders:', error);
		return { success: false, error };
	}
}
