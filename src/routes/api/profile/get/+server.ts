// src/routes/api/profile/get/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';

export async function GET() {
	try {
		// For a real app with authentication, you'd get the user ID from the session
		// This is a simplified example assuming a single user
		const userProfiles = await db.select().from(schema.userProfiles).limit(1);

		// If no profile exists, create a default one
		if (userProfiles.length === 0) {
			const [newProfile] = await db
				.insert(schema.userProfiles)
				.values({
					username: 'AnimeEnthusiast',
					email: 'user@example.com',
					joinDate: new Date()
				})
				.returning();

			return json({ profile: newProfile });
		}

		return json({ profile: userProfiles[0] });
	} catch (error) {
		console.error('Error fetching user profile:', error);
		return json({ error: 'Failed to fetch user profile' }, { status: 500 });
	}
}
