importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in the messagingSenderId.
firebase.initializeApp({
  apiKey: "AIzaSyD_zcK4IcJr6FeBnL5WzVdnKRX9R4nlaxw",
  authDomain: "ewwon-coco.firebaseapp.com",
  projectId: "ewwon-coco",
  storageBucket: "ewwon-coco.firebasestorage.app",
  messagingSenderId: "539905312817",
  appId: "1:539905312817:web:3b60c0f51ef7fa1c2ded10"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/coconut_original.png',
    data: {
        url: payload.data.link || '/'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
