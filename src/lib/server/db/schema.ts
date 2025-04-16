// src/lib/server/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const animes = sqliteTable('animes', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	malId: integer('mal_id').notNull().unique(),
	title: text('title').notNull(),
	imageUrl: text('image_url'),
	totalEpisodes: integer('total_episodes'),
	currentEpisode: integer('current_episode').default(0),
	status: text('status', {
		enum: ['watching', 'completed', 'dropped', 'paused', 'planned']
	}).default('planned'),
	personalScore: real('personal_score'),
	comment: text('comment'),
	isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
	lastUpdated: integer('last_updated', { mode: 'timestamp' }).notNull()
});

export const badges = sqliteTable('badges', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull().unique(),
	description: text('description').notNull(),
	achieved: integer('achieved', { mode: 'boolean' }).default(false),
	achievedAt: integer('achieved_at', { mode: 'timestamp' })
});

export const userProfiles = sqliteTable('user_profiles', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	username: text('username').notNull().unique(),
	email: text('email').notNull().unique(),
	avatarUrl: text('avatar_url'),
	joinDate: integer('join_date', { mode: 'timestamp' }).notNull().defaultNow(),
	theme: text('theme', { enum: ['light', 'dark', 'system'] }).default('system'),
	notificationsEnabled: integer('notifications_enabled', { mode: 'boolean' }).default(true),
	watchingNotifications: integer('watching_notifications', { mode: 'boolean' }).default(true),
	reminderTime: text('reminder_time').default('18:00'), // Time of day for reminders
	pushSubscription: text('push_subscription') // Store Web Push subscription as JSON string
});

export type Anime = typeof animes.$inferSelect;
export type NewAnime = typeof animes.$inferInsert;
export type Badge = typeof badges.$inferSelect;
export type NewBadge = typeof badges.$inferInsert;
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
