# 🚀 IVAC OTP Monitor - Deployment Guide

## 📱 Option 1: GitHub Pages (Recommended)

### Step 1: Create GitHub Repository
1. Go to [GitHub.com](https://github.com) and create account if needed
2. Create new repository named `ivac-otp-monitor`
3. Make it **Public** (required for GitHub Pages)

### Step 2: Upload Files
Upload these files to your repository:
- `index.html` (landing page)
- `phone-companion.html` (mobile app)
- `offline-otp-monitor.html` (PC monitor)
- `manifest.json` (PWA config)
- `sw.js` (service worker)
- `README.md` (documentation)

### Step 3: Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: main/master
4. Save

### Step 4: Access Your Apps
- **Landing Page:** `https://yourusername.github.io/ivac-otp-monitor/`
- **Mobile App:** `https://yourusername.github.io/ivac-otp-monitor/phone-companion.html`
- **PC Monitor:** `https://yourusername.github.io/ivac-otp-monitor/offline-otp-monitor.html`

## 📱 Mobile Usage Instructions

### Method A: Direct Browser Access
1. Open mobile browser
2. Go to your GitHub Pages URL
3. Bookmark for easy access
4. Use like a regular website

### Method B: Install as PWA (Progressive Web App)
1. Open the mobile app URL in Chrome/Edge
2. Tap "Add to Home Screen" or install prompt
3. App will install like a native app
4. Access from home screen

### Method C: QR Code Access
1. Generate QR code for your mobile app URL
2. Scan with phone camera
3. Opens directly in browser

## 💻 PC Setup Instructions

### Option 1: Online Access
- Open `https://yourusername.github.io/ivac-otp-monitor/offline-otp-monitor.html`

### Option 2: Local Files
- Download all HTML files to your PC
- Open `offline-otp-monitor.html` in browser
- Works completely offline

## 🔗 Sync Setup

### PC Side:
1. Open PC monitor
2. Click "📱 Start Phone Sync" 
3. Click "📷 Show QR Code"
4. Keep QR code visible

### Mobile Side:
1. Open phone companion app
2. Click "📷 QR Scanner খুলুন"
3. Scan the QR code from PC
4. Grant permissions when prompted

## ⚙️ Alternative: Local Network Setup

If you want everything local (no internet required):

### Step 1: Simple HTTP Server
```bash
# On PC, in the folder with HTML files:
python -m http.server 8000
# or
npx serve .
```

### Step 2: Access via Local Network
- **PC:** `http://localhost:8000/offline-otp-monitor.html`
- **Mobile:** `http://YOUR_PC_IP:8000/phone-companion.html`

## 🔒 Security Notes

- All data stays on your devices
- No external servers involved
- Uses browser localStorage only
- GitHub Pages is just file hosting

## 📞 Troubleshooting

### Common Issues:

**1. Mobile app not detecting OTPs:**
- Grant SMS/Notification permissions
- Make sure phone is connected to PC
- Check Activity Log for errors

**2. QR code not scanning:**
- Ensure good lighting
- Hold phone steady
- Try manual sync ID input

**3. Sync not working:**
- Both devices on same network helps
- Check browser localStorage permissions
- Try refreshing both apps

**4. PWA not installing:**
- Use Chrome or Edge browser
- Make sure site is served over HTTPS
- GitHub Pages automatically provides HTTPS

## 🎯 Best Practices

1. **Bookmark URLs** on both devices
2. **Grant all permissions** on mobile
3. **Keep apps open** during OTP waiting
4. **Test connection** before real use
5. **Use latest browser** versions

## 📱 APK Alternative

If you prefer an actual Android APK:
1. Use tools like Capacitor or Cordova
2. Wrap the HTML app in native container
3. Build APK with Android Studio
4. Install on phone

For most users, the PWA (web app) approach is easier and works just as well!