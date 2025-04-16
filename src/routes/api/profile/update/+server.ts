// src/routes/api/profile/update/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	try {
		const profileData = await request.json();
		const profileId = profileData.id; // In a real app, get ID from session

		if (!profileId) {
			return json({ error: 'Profile ID is required' }, { status: 400 });
		}

		const [updatedProfile] = await db
			.update(schema.userProfiles)
			.set(profileData)
			.where(eq(schema.userProfiles.id, profileId))
			.returning();

		return json({ profile: updatedProfile });
	} catch (error) {
		console.error('Error updating user profile:', error);
		return json({ error: 'Failed to update user profile' }, { status: 500 });
	}
}
