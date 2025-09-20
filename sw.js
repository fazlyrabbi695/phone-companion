// Service Worker for IVAC OTP Phone Companion
const CACHE_NAME = 'ivac-otp-v1';
const urlsToCache = [
  './phone-companion.html',
  './manifest.json'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch events - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

// Handle background sync for OTP detection
self.addEventListener('sync', (event) => {
  if (event.tag === 'otp-sync') {
    event.waitUntil(
      // Sync OTP data when connection is restored
      syncOTPData()
    );
  }
});

// Handle push notifications for OTP alerts
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New OTP detected!',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'otp-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View OTP'
      },
      {
        action: 'copy',
        title: 'Copy OTP'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('IVAC OTP Detected', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    // Open the app
    event.waitUntil(
      clients.openWindow('./phone-companion.html')
    );
  } else if (event.action === 'copy') {
    // Copy OTP to clipboard (if supported)
    event.waitUntil(
      copyOTPToClipboard()
    );
  }
});

// Sync OTP data function
async function syncOTPData() {
  try {
    // Check for pending OTPs to sync
    const pendingOTPs = await getStoredOTPs();
    if (pendingOTPs.length > 0) {
      // Send to PC monitor
      await sendOTPsToPC(pendingOTPs);
    }
  } catch (error) {
    console.error('OTP sync failed:', error);
  }
}

async function getStoredOTPs() {
  // Get OTPs from IndexedDB or localStorage
  return JSON.parse(localStorage.getItem('pendingOTPs') || '[]');
}

async function sendOTPsToPC(otps) {
  // Send OTPs to PC via stored sync mechanism
  otps.forEach(otp => {
    // Add to phone messages for PC to pick up
    const phoneMessages = JSON.parse(localStorage.getItem('phoneMessages') || '[]');
    phoneMessages.unshift({
      content: otp.content,
      otp: otp.code,
      source: 'Background Sync',
      timestamp: Date.now(),
      processed: false,
      fromPhone: true
    });
    localStorage.setItem('phoneMessages', JSON.stringify(phoneMessages));
  });
  
  // Clear pending OTPs
  localStorage.setItem('pendingOTPs', '[]');
}

async function copyOTPToClipboard() {
  // Copy latest OTP to clipboard if supported
  try {
    const latestOTP = getLatestOTP();
    if (latestOTP && 'clipboard' in navigator) {
      await navigator.clipboard.writeText(latestOTP);
    }
  } catch (error) {
    console.error('Clipboard copy failed:', error);
  }
}

function getLatestOTP() {
  const phoneMessages = JSON.parse(localStorage.getItem('phoneMessages') || '[]');
  return phoneMessages.length > 0 ? phoneMessages[0].otp : null;
}