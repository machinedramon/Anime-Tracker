// public/service-worker.js
self.addEventListener('push', (event) => {
	if (event.data) {
		const data = event.data.json();

		const options = {
			body: data.body,
			icon: data.icon || '/images/logo.png',
			badge: '/images/badge.png',
			data: data.data || {},
			vibrate: [100, 50, 100]
		};

		event.waitUntil(self.registration.showNotification(data.title, options));
	}
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	// Handle notification click
	const notificationData = event.notification.data;

	let url = '/';

	// Customize URL based on notification type
	if (notificationData?.type) {
		if (notificationData.type === 'watching_reminder') {
			url = '/diary?status=watching';
		} else if (notificationData.type === 'new_episode') {
			url = `/anime/${notificationData.animeId}`;
		}
	}

	event.waitUntil(clients.openWindow(url));
});
