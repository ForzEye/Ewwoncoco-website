import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let messaging: any = null;
try {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
} catch (e) {
    console.warn('Firebase Messaging not supported in this environment');
}

export const requestNotificationPermission = async () => {
    try {
        if (!('serviceWorker' in navigator)) {
            console.warn('Service Worker is not supported in this browser');
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted' && messaging) {
            // Register service worker explicitly to resolve ngrok/virtual host scope and registration issues
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
                serviceWorkerRegistration: registration
            });

            if (token) {
                // Send token to backend
                await axios.post('/api/notifications/token', { fcm_token: token });
                console.log('FCM Token registered');
            }
        }
    } catch (error: any) {
        if (error?.message?.includes('Registration failed') || error?.name === 'AbortError') {
            console.warn('Push notification service is blocked or unavailable in this environment (Registration failed - push service error). This usually happens due to local network restrictions, VPN/firewall blocking Google GCM, or browser settings.');
        } else {
            console.error('An error occurred while retrieving token:', error);
        }
    }
};

export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) return () => { };
    try {
        return onMessage(messaging, (payload: any) => {
            callback(payload);
        });
    } catch (e) {
        console.warn('FCM onMessage listener registration failed:', e);
        return () => { };
    }
};
