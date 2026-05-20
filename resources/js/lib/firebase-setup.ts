import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

const firebaseConfig = {
    apiKey: "AIzaSyD_zcK4IcJr6FeBnL5WzVdnKRX9R4nlaxw",
    authDomain: "ewwon-coco.firebaseapp.com",
    projectId: "ewwon-coco",
    storageBucket: "ewwon-coco.firebasestorage.app",
    messagingSenderId: "539905312817",
    appId: "1:539905312817:web:3b60c0f51ef7fa1c2ded10"
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
                vapidKey: 'BALpT1QmX_gwKU1XruellKiG-zszoLGCuXyJGaHQgaRMzmcc-wmNvO7aF-Rt5wWHVL5qHnWA2Ir5ukad7R08_9g' 
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

export const onMessageListener = (callback: (payload: any) => void) => {
    if (!messaging) return () => {};
    return onMessage(messaging, (payload: any) => {
        callback(payload);
    });
};
