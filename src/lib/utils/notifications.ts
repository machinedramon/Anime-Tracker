// src/lib/utils/notifications.ts
let swRegistration: ServiceWorkerRegistration | null = null;

export async function subscribeToNotifications() {
	if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
		console.error('Push notifications not supported');
		return false;
	}

	try {
		// Get the VAPID public key from the server
		const response = await fetch('/api/notifications/subscribe');
		const { publicKey } = await response.json();

		// Register service worker
		swRegistration = await navigator.serviceWorker.register('/service-worker.js');

		// Check if already subscribed
		const subscription = await swRegistration.pushManager.getSubscription();
		if (subscription) {
			return true; // Already subscribed
		}

		// Subscribe to push notifications
		const newSubscription = await swRegistration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(publicKey)
		});

		// Send subscription to server
		await fetch('/api/notifications/subscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ subscription: newSubscription })
		});

		return true;
	} catch (error) {
		console.error('Failed to subscribe to notifications:', error);
		return false;
	}
}

export async function unsubscribeFromNotifications() {
	if (!swRegistration) {
		const registration = await navigator.serviceWorker.getRegistration();
		if (!registration) return false;
		swRegistration = registration;
	}

	try {
		const subscription = await swRegistration.pushManager.getSubscription();
		if (subscription) {
			await subscription.unsubscribe();
		}

		// Notify server
		await fetch('/api/notifications/unsubscribe', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		return true;
	} catch (error) {
		console.error('Failed to unsubscribe from notifications:', error);
		return false;
	}
}

// Helper function to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);

	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}

	return outputArray;
}
