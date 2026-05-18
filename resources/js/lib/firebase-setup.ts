import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
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
        const permission = await Notification.requestPermission();
        if (permission === 'granted' && messaging) {
            const token = await getToken(messaging, { 
                vapidKey: 'YOUR_VAPID_KEY' 
            });
            
            if (token) {
                // Send token to backend
                await axios.post('/api/notifications/token', { fcm_token: token });
                console.log('FCM Token registered');
            }
        }
    } catch (error) {
        console.error('An error occurred while retrieving token:', error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        if (!messaging) return resolve(null);
        onMessage(messaging, (payload: any) => {
            resolve(payload);
        });
    });
