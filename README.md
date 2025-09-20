# 📱 IVAC OTP Phone Companion

A mobile web app for automatic OTP detection and sync with PC.

## 🚀 Quick Setup

### For Mobile (Phone Companion):
1. Open your mobile browser
2. Visit: `https://yourusername.github.io/ivac-otp-monitor/phone-companion.html`
3. Bookmark this page for easy access
4. Grant required permissions when prompted

### For PC (OTP Monitor):
1. Open browser on PC
2. Visit: `https://yourusername.github.io/ivac-otp-monitor/offline-otp-monitor.html`
3. Or open the local HTML file directly

## 📱 Mobile Usage

1. **Sync with PC**: Scan QR code from PC monitor
2. **Grant Permissions**: Allow SMS and notification access
3. **Auto Detection**: OTPs will be detected automatically
4. **Send to PC**: One-click send to connected PC

## 💻 PC Usage

1. **Start Monitoring**: Open offline-otp-monitor.html
2. **Show QR Code**: Click "Phone Sync" → "Show QR Code"
3. **Wait for Connection**: Mobile will connect automatically
4. **Receive OTPs**: Automatic alerts when OTPs arrive

## 🔧 Features

- ✅ No app installation required
- ✅ Works on any smartphone browser
- ✅ Automatic OTP detection
- ✅ QR-based PC sync
- ✅ Multiple alert types
- ✅ One-click copy

## 🔒 IVAC OTP Monitor - Cross-Device Sync Solution

## 🚨 GitHub Pages Sync Issue Fixed!

If you're experiencing \"GitHub Pages এ phone থেকে PC তে OTP sync perfectly কাজ করতেছে না\" - this update fixes the issue!

## 📁 Updated Files (Deploy All)

✅ **Core Files** (Required):
- `offline-otp-monitor.html` - PC monitor with fixed sync
- `phone-companion.html` - Phone app with enhanced sync  \n- `sync-service.js` - **FIXED** - Now includes initialize() method
- `simple-test.html` - **NEW** - Quick sync test page

📱 **PWA Files** (Optional):
- `manifest.json` - PWA configuration
- `sw.js` - Service worker

📚 **Documentation**:
- `DEPLOYMENT.md` - Deployment guide
- `README.md` - This file

## 🧪 Quick Test Steps

### 1. Deploy to GitHub Pages
1. Upload all files to your GitHub repository
2. Enable GitHub Pages in Settings → Pages
3. Wait 2-3 minutes for deployment

### 2. Test Sync Service
1. **Open Test Page**: `https://yourusername.github.io/your-repo-name/simple-test.html`
2. **Check Status**: Should show \"✅ Sync service ready!\"\n3. **Send Test OTP**: Enter \"123456\" and click \"📤 Send OTP\"\n4. **Check Reception**: Click \"🔍 Check Once\" - should show the OTP

### 3. Real Device Test

**Phone Side**:
1. Open: `https://yourusername.github.io/your-repo-name/phone-companion.html`
2. Enter test message: \"IVAC Bangladesh: Your verification code is: 789012\"
3. Click \"Send OTP to PC\"
4. Wait for \"✅ OTP sent successfully\"

**PC Side**:
1. Open: `https://yourusername.github.io/your-repo-name/offline-otp-monitor.html`
2. Watch for \"📱 Received OTP from sync: 789012\"
3. OTP should appear in the display box within 5 seconds

## 🔧 Troubleshooting

### Issue: \"syncService.initialize is not a function\"
**Solution**: ✅ FIXED in latest sync-service.js
- Re-upload `sync-service.js` to GitHub
- Clear browser cache (Ctrl+F5)
- Try again

### Issue: OTP not syncing between devices
**Check These**:
1. **Both devices have internet**: GitHub Pages requires internet
2. **Same GitHub Pages URL**: Use exact same URL on both devices
3. **Clear browser cache**: Clear cache on both devices
4. **JavaScript enabled**: Make sure JS is not blocked
5. **Console errors**: Open F12 → Console to check for errors

### Issue: Sync service not loading
**Solutions**:
1. Check all files are uploaded to GitHub
2. Verify GitHub Pages is enabled and deployed
3. Wait 5-10 minutes after uploading files
4. Try incognito/private browsing mode

## 📱 Usage Instructions

### Daily Use:
1. **Bookmark URLs** on both phone and PC
2. **Keep tabs open** when expecting OTP
3. **Phone**: Send real IVAC OTP messages via the companion app
4. **PC**: OTPs will auto-appear with notifications

### Real IVAC OTP Flow:
1. **Apply for IVAC appointment** (triggers OTP email/SMS)
2. **Phone**: Copy IVAC OTP message and paste in companion app
3. **Phone**: Click \"Send OTP to PC\" 
4. **PC**: OTP appears automatically with sound + notification
5. **PC**: OTP auto-copied to clipboard for easy pasting

## 🔒 Privacy & Security

- ✅ **Local-only execution**: No external servers for OTP data
- ✅ **Temporary storage**: OTPs auto-expire after 5 minutes
- ✅ **GitHub Pages**: Only uses GitHub's file hosting
- ✅ **No data collection**: No analytics or tracking

## 🆘 Still Having Issues?

### Common Solutions:
1. **Use Chrome/Edge**: Better compatibility
2. **Enable notifications**: Allow browser notifications
3. **Check HTTPS**: Make sure URLs start with https://
4. **Try test page first**: Always test with simple-test.html
5. **Upload all files**: Don't miss any files during upload

### Debug Steps:
1. Open browser console (F12)
2. Look for red error messages
3. Check if sync-service.js loaded properly
4. Verify OTPSyncService is available in console

## 📞 Manual Fallback

If sync still doesn't work:
1. Use **Manual OTP Input** section on PC monitor
2. Copy OTP from phone and paste on PC
3. Works 100% without any sync required

---
```

```
