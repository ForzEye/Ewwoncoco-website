importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "{{ config('services.firebase.api_key') }}",
  authDomain: "{{ config('services.firebase.auth_domain') }}",
  projectId: "{{ config('services.firebase.project_id') }}",
  storageBucket: "{{ config('services.firebase.storage_bucket') }}",
  messagingSenderId: "{{ config('services.firebase.messaging_sender_id') }}",
  appId: "{{ config('services.firebase.app_id') }}"
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
