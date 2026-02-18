/* global importScripts, firebase */

// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// These values will be replaced by the user with their own Firebase project credentials
firebase.initializeApp({
  apiKey: "AIzaSyDhP-mCsHaPpfnEl3IEYvK1Ig1SDnbJa9o",
  authDomain: "clash-of-code-2e166.firebaseapp.com",
  projectId: "clash-of-code-2e166",
  storageBucket: "clash-of-code-2e166.firebasestorage.app",
  messagingSenderId: "642245550576",
  appId: "1:642245550576:web:00f7b976c2b7c44b5c3d35",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.image || '/logo192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
