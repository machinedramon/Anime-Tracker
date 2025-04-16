// src/lib/server/scheduler.ts
import cron from 'node-cron';
import { checkAndSendWatchingReminders } from './notification';

// Schedule daily reminder at 6PM
export function startScheduler() {
	// Run watching reminders at 6PM every day
	cron.schedule('0 18 * * *', async () => {
		console.log('Running scheduled watching reminders');
		await checkAndSendWatchingReminders();
	});

	console.log('Notification scheduler started');
}
