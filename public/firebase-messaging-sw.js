/* global importScripts, firebase */

// Scripts for firebase and firebase-messaging
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

const params = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: params.get("apiKey") || "",
  authDomain: params.get("authDomain") || "",
  projectId: params.get("projectId") || "",
  storageBucket: params.get("storageBucket") || "",
  messagingSenderId: params.get("messagingSenderId") || "",
  appId: params.get("appId") || "",
};

if (!firebaseConfig.apiKey) {
  console.warn(
    "[firebase-sw] Missing Firebase config; background messaging disabled.",
  );
} else {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.apps.length ? firebase.messaging() : null;

if (messaging) {
  messaging.onBackgroundMessage((payload) => {
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload,
    );

    // If the message has a notification property, the browser will likely
    // display it automatically (FCM default behavior).
    // Manually calling showNotification here can cause double notifications.
    if (payload.notification) {
      console.log(
        "[firebase-messaging-sw.js] Notification already present in payload, bypassing manual show.",
      );
      return;
    }

    const notificationTitle = payload.data?.title || "New Notification";
    const notificationOptions = {
      body: payload.data?.body || "",
      icon: payload.data?.image || "/favicon.png",
      data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}
