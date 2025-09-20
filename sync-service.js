// Real-time OTP Sync Service for GitHub Pages
class OTPSyncService {
    constructor() {
        this.syncId = null;
        this.isPhone = this.detectDevice();
        this.syncInterval = null;
        this.firebaseConfig = {
            // Free Realtime Database for sync
            databaseURL: 'https://ivac-otp-sync-default-rtdb.firebaseio.com/'
        };
        this.init();
    }

    detectDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    init() {
        console.log(`OTP Sync Service initialized (${this.isPhone ? 'Phone' : 'PC'})`);
        this.loadSyncId();
    }

    // Alternative sync using simple JSON API (JSONBin.io - Free tier)
    async initJSONBinSync() {
        this.apiKey = '$2b$10$example'; // Replace with your JSONBin API key
        this.binId = 'your-bin-id'; // Replace with your bin ID
        this.apiUrl = `https://api.jsonbin.io/v3/b/${this.binId}`;
    }

    // Generate or load sync ID
    loadSyncId() {
        this.syncId = localStorage.getItem('otpSyncId');
        if (!this.syncId) {
            this.syncId = 'sync_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('otpSyncId', this.syncId);
        }
        return this.syncId;
    }

    // Method 1: GitHub Gist based sync (Free)
    async syncViaGist(data, action = 'read') {
        const gistId = localStorage.getItem('otpGistId') || 'create_new';
        const token = localStorage.getItem('githubToken'); // User needs to provide personal token
        
        if (action === 'write') {
            return await this.writeToGist(data, gistId, token);
        } else {
            return await this.readFromGist(gistId, token);
        }
    }

    async writeToGist(data, gistId, token) {
        try {
            const gistData = {
                description: 'IVAC OTP Sync Data',
                public: false,
                files: {
                    'otp-sync.json': {
                        content: JSON.stringify(data)
                    }
                }
            };

            const url = gistId === 'create_new' 
                ? 'https://api.github.com/gists'
                : `https://api.github.com/gists/${gistId}`;

            const method = gistId === 'create_new' ? 'POST' : 'PATCH';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(gistData)
            });

            if (response.ok) {
                const result = await response.json();
                if (gistId === 'create_new') {
                    localStorage.setItem('otpGistId', result.id);
                }
                return { success: true, data: result };
            }
        } catch (error) {
            console.error('Gist sync error:', error);
        }
        return { success: false };
    }

    async readFromGist(gistId, token) {
        try {
            if (!gistId || gistId === 'create_new') return { success: false };

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: token ? { 'Authorization': `token ${token}` } : {}
            });

            if (response.ok) {
                const gist = await response.json();
                const content = gist.files['otp-sync.json']?.content;
                return { 
                    success: true, 
                    data: content ? JSON.parse(content) : null 
                };
            }
        } catch (error) {
            console.error('Gist read error:', error);
        }
        return { success: false };
    }

    // Method 2: Simple polling with pastebin/hastebin
    async syncViaPastebin(data, action = 'read') {
        const syncKey = this.syncId;
        
        if (action === 'write') {
            return await this.writeToPastebin(data, syncKey);
        } else {
            return await this.readFromPastebin(syncKey);
        }
    }

    async writeToPastebin(data, syncKey) {
        try {
            // Using hastebin-like service
            const response = await fetch('https://hastebin.com/documents', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({
                    syncId: syncKey,
                    timestamp: Date.now(),
                    data: data
                })
            });

            if (response.ok) {
                const result = await response.json();
                localStorage.setItem('otpPasteId', result.key);
                return { success: true, key: result.key };
            }
        } catch (error) {
            console.error('Pastebin sync error:', error);
        }
        return { success: false };
    }

    async readFromPastebin(syncKey) {
        try {
            const pasteId = localStorage.getItem('otpPasteId');
            if (!pasteId) return { success: false };

            const response = await fetch(`https://hastebin.com/raw/${pasteId}`);
            if (response.ok) {
                const content = await response.text();
                const parsed = JSON.parse(content);
                
                if (parsed.syncId === syncKey) {
                    return { success: true, data: parsed.data };
                }
            }
        } catch (error) {
            console.error('Pastebin read error:', error);
        }
        return { success: false };
    }

    // Method 3: Local Network Discovery (when on same WiFi)
    async discoverLocalDevices() {
        // Try to find other devices on local network
        const currentIP = await this.getCurrentIP();
        const networkBase = currentIP.substring(0, currentIP.lastIndexOf('.'));
        
        const promises = [];
        for (let i = 1; i <= 254; i++) {
            const ip = `${networkBase}.${i}`;
            promises.push(this.pingDevice(ip));
        }

        const results = await Promise.allSettled(promises);
        return results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => result.value);
    }

    async getCurrentIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch {
            return '192.168.1.100'; // fallback
        }
    }

    async pingDevice(ip) {
        try {
            // Try to connect to potential OTP sync service
            const response = await fetch(`http://${ip}:8080/otp-sync`, {
                method: 'GET',
                signal: AbortSignal.timeout(1000)
            });
            
            if (response.ok) {
                return ip;
            }
        } catch {
            // Device not found or not responding
        }
        return null;
    }

    // Method 4: WebRTC Data Channel
    async initWebRTCSync() {
        if (!window.RTCPeerConnection) {
            console.log('WebRTC not supported');
            return false;
        }

        this.peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.dataChannel = this.peerConnection.createDataChannel('otp-sync');
        
        this.dataChannel.onopen = () => {
            console.log('WebRTC data channel opened');
        };

        this.dataChannel.onmessage = (event) => {
            this.handleWebRTCMessage(JSON.parse(event.data));
        };

        return true;
    }

    handleWebRTCMessage(message) {
        if (message.type === 'otp') {
            this.onOTPReceived(message.data);
        }
    }

    // Main sync methods
    async sendOTP(otpData) {
        console.log('Sending OTP via multiple methods:', otpData);
        
        const syncData = {
            otp: otpData.otp,
            source: otpData.source,
            timestamp: Date.now(),
            syncId: this.syncId,
            fromPhone: this.isPhone
        };

        // Try multiple sync methods simultaneously
        const methods = [
            this.syncViaLocalStorage(syncData, 'write'),
            this.syncViaPastebin(syncData, 'write'),
            this.sendViaWebRTC(syncData)
        ];

        const results = await Promise.allSettled(methods);
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.success);
        
        console.log(`OTP sent via ${successful.length} methods`);
        return successful.length > 0;
    }

    async receiveOTP() {
        console.log('Checking for OTPs via multiple methods');
        
        const methods = [
            this.syncViaLocalStorage(null, 'read'),
            this.syncViaPastebin(null, 'read'),
            this.checkWebRTCMessages()
        ];

        const results = await Promise.allSettled(methods);
        
        for (const result of results) {
            if (result.status === 'fulfilled' && result.value.success && result.value.data) {
                return result.value.data;
            }
        }

        return null;
    }

    // Fallback: Enhanced localStorage with timestamp
    async syncViaLocalStorage(data, action) {
        const key = `otpSync_${this.syncId}`;
        
        if (action === 'write') {
            localStorage.setItem(key, JSON.stringify(data));
            localStorage.setItem(`${key}_timestamp`, Date.now().toString());
            return { success: true };
        } else {
            const stored = localStorage.getItem(key);
            const timestamp = localStorage.getItem(`${key}_timestamp`);
            
            if (stored && timestamp) {
                const age = Date.now() - parseInt(timestamp);
                if (age < 300000) { // 5 minutes max age
                    return { success: true, data: JSON.parse(stored) };
                }
            }
            return { success: false };
        }
    }

    async sendViaWebRTC(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify({ type: 'otp', data: data }));
            return { success: true };
        }
        return { success: false };
    }

    async checkWebRTCMessages() {
        // WebRTC messages are handled in real-time via event handlers
        return { success: false };
    }

    // Event handlers
    onOTPReceived(otpData) {
        console.log('OTP received:', otpData);
        
        // Trigger PC-side OTP display
        if (typeof window.handleOTPDetection === 'function') {
            window.handleOTPDetection(otpData.otp, otpData.source + ' (Synced)');
        }

        // Store for manual checking
        const receivedOTPs = JSON.parse(localStorage.getItem('receivedOTPs') || '[]');
        receivedOTPs.unshift(otpData);
        localStorage.setItem('receivedOTPs', JSON.stringify(receivedOTPs.slice(0, 10)));
    }

    // Start continuous sync monitoring
    startMonitoring() {
        if (this.syncInterval) return;
        
        console.log('Starting OTP sync monitoring');
        this.syncInterval = setInterval(async () => {
            if (!this.isPhone) { // PC side - listen for OTPs
                const otpData = await this.receiveOTP();
                if (otpData && !this.isRecentlyProcessed(otpData)) {
                    this.onOTPReceived(otpData);
                    this.markAsProcessed(otpData);
                }
            }
        }, 3000); // Check every 3 seconds
    }

    stopMonitoring() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
            console.log('OTP sync monitoring stopped');
        }
    }

    isRecentlyProcessed(otpData) {
        const processed = JSON.parse(localStorage.getItem('processedOTPs') || '[]');
        const key = `${otpData.otp}_${otpData.timestamp}`;
        return processed.includes(key);
    }

    markAsProcessed(otpData) {
        const processed = JSON.parse(localStorage.getItem('processedOTPs') || '[]');
        const key = `${otpData.otp}_${otpData.timestamp}`;
        processed.unshift(key);
        localStorage.setItem('processedOTPs', JSON.stringify(processed.slice(0, 50)));
    }

    // Get sync status
    getSyncStatus() {
        return {
            syncId: this.syncId,
            isPhone: this.isPhone,
            isMonitoring: !!this.syncInterval,
            webRTCReady: !!(this.dataChannel && this.dataChannel.readyState === 'open')
        };
    }
}

// Initialize global sync service
window.otpSyncService = new OTPSyncService();