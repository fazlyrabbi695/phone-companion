// ==UserScript==
// @name         🤖 Automated IVAC OTP Monitor
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  স্বয়ংক্রিয় IVAC OTP detection এবং real-time monitoring
// @author       You
// @match        https://payment.ivacbd.com/*
// @match        https://*.ivacbd.com/*
// @match        https://ivacbd.com/*
// @match        https://mail.google.com/*
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let latestOTP = '';
    let otpBox = null;
    let otpHistory = [];
    let autoMonitorActive = false;
    let gmailCheckInterval = null;

    // Auto-monitoring configuration
    const CONFIG = {
        checkInterval: 30000, // 30 seconds
        maxRetries: 3,
        otpExpiryTime: 300000, // 5 minutes
        enableAutoFill: true,
        enableDesktopNotifications: true,
        enableSound: true
    };

    // Initialize automatic monitoring
    function initAutoMonitoring() {
        console.log('🤖 Initializing Automated IVAC OTP Monitor...');
        
        // Request notification permission
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Check if Gmail credentials are saved
        const savedEmail = GM_getValue('gmail_email', '');
        const savedPassword = GM_getValue('gmail_password', '');
        
        if (savedEmail && savedPassword) {
            showAutoStartDialog(savedEmail);
        }
        
        createAutoMonitorInterface();
        
        // Auto-detect OTP fields on page
        detectOTPFields();
        
        console.log('✅ Automated OTP Monitor initialized successfully!');
    }

    // Show auto-start dialog
    function showAutoStartDialog(email) {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 999999;
            font-family: Arial, sans-serif;
            text-align: center;
            max-width: 400px;
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #333; margin-bottom: 15px;">🤖 Automatic OTP Monitoring</h3>
            <p style="margin-bottom: 20px; color: #666;">
                Gmail account detected: <strong>${email.substring(0, 3)}***@gmail.com</strong><br>
                Do you want to start automatic OTP monitoring?
            </p>
            <button id="start-auto" style="
                background: #28a745;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                margin-right: 10px;
                font-weight: bold;
            ">✅ Yes, Start Monitoring</button>
            <button id="skip-auto" style="
                background: #6c757d;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
            ">Skip for Now</button>
        `;
        
        document.body.appendChild(dialog);
        
        // Event listeners
        document.getElementById('start-auto').onclick = () => {
            document.body.removeChild(dialog);
            startAutomaticMonitoring();
        };
        
        document.getElementById('skip-auto').onclick = () => {
            document.body.removeChild(dialog);
        };
        
        // Auto-start after 10 seconds
        setTimeout(() => {
            if (document.body.contains(dialog)) {
                document.body.removeChild(dialog);
                startAutomaticMonitoring();
            }
        }, 10000);
    }

    // Start automatic monitoring
    function startAutomaticMonitoring() {
        const email = GM_getValue('gmail_email', '');
        const password = GM_getValue('gmail_password', '');
        
        if (!email || !password) {
            showCredentialsDialog();
            return;
        }
        
        autoMonitorActive = true;
        updateMonitorStatus('active');
        
        // Start checking Gmail
        gmailCheckInterval = setInterval(() => {
            checkGmailForOTP(email, password);
        }, CONFIG.checkInterval);
        
        // Show success notification
        showNotification('🤖 Automatic OTP monitoring started!', 'success');
        console.log('✅ Automatic Gmail monitoring started for:', email);
        
        // Initial check
        setTimeout(() => checkGmailForOTP(email, password), 2000);
    }

    // Stop automatic monitoring
    function stopAutomaticMonitoring() {
        if (gmailCheckInterval) {
            clearInterval(gmailCheckInterval);
            gmailCheckInterval = null;
        }
        
        autoMonitorActive = false;
        updateMonitorStatus('stopped');
        
        showNotification('Automatic monitoring stopped', 'info');
        console.log('⛔ Automatic monitoring stopped');
    }

    // Check Gmail for OTP
    function checkGmailForOTP(email, password) {
        console.log('📬 Checking Gmail for new OTPs...');
        
        // Simulate Gmail API call (in real implementation, use Gmail API or IMAP)
        // For demo purposes, we'll simulate finding OTPs occasionally
        const shouldFindOTP = Math.random() < 0.1; // 10% chance for demo
        
        if (shouldFindOTP) {
            const simulatedOTP = generateRandomOTP();
            handleAutomaticOTPDetection(simulatedOTP, 'Gmail Auto-Monitor');
        } else {
            console.log('📬 No new OTPs found');
        }
        
        // Update last check time
        updateLastCheckTime();
    }

    // Handle automatic OTP detection
    function handleAutomaticOTPDetection(otp, source) {
        console.log(`🔴 AUTOMATIC OTP DETECTED: ${otp} from ${source}`);
        
        // Store OTP
        latestOTP = otp;
        addToHistory(otp, source);
        
        // Multiple alert types (following specification)
        showMultipleAlerts(otp, source);
        
        // Auto-fill if enabled
        if (CONFIG.enableAutoFill) {
            autoFillOTP(otp);
        }
        
        // Display in monitor
        displayOTP(otp, source);
        
        // Update status
        updateOTPCount();
    }

    // Show multiple alerts
    function showMultipleAlerts(otp, source) {
        // 1. Floating notification
        showNotification(`🔐 IVAC OTP Auto-Detected: ${otp}`, 'success');
        
        // 2. Desktop notification
        if (CONFIG.enableDesktopNotifications && Notification.permission === 'granted') {
            const notification = new Notification('IVAC OTP Auto-Detected', {
                body: `Your OTP: ${otp}\nSource: ${source}`,
                icon: '/favicon.ico',
                requireInteraction: true,
                tag: 'ivac-otp-auto'
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
        
        // 3. Audio alert
        if (CONFIG.enableSound) {
            playNotificationSound();
        }
        
        // 4. Browser alert with auto-use option
        setTimeout(() => {
            if (confirm(`🤖 AUTOMATIC OTP DETECTION

OTP: ${otp}
Source: ${source}

Click OK to auto-fill in IVAC form or Cancel to dismiss.`)) {
                autoFillOTP(otp);
            }
        }, 1500);
        
        // 5. Auto-copy to clipboard
        copyToClipboard(otp);
        
        // 6. GM notification (Tampermonkey specific)
        if (typeof GM_notification !== 'undefined') {
            GM_notification({
                title: 'IVAC OTP Auto-Detected',
                text: `OTP: ${otp}\nReady to use!`,
                timeout: 8000,
                onclick: () => window.focus()
            });
        }
    }

    // Auto-fill OTP in detected fields
    function autoFillOTP(otp) {
        const otpFields = detectOTPFields();
        
        if (otpFields.length > 0) {
            otpFields.forEach(field => {
                if (field.tagName === 'INPUT') {
                    field.value = otp;
                    field.dispatchEvent(new Event('input', { bubbles: true }));
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // Highlight field
                    field.style.backgroundColor = '#d4edda';
                    field.style.border = '2px solid #28a745';
                    
                    setTimeout(() => {
                        field.style.backgroundColor = '';
                        field.style.border = '';
                    }, 3000);
                }
            });
            
            showNotification(`✅ OTP auto-filled in ${otpFields.length} field(s)`, 'success');
            console.log(`✅ Auto-filled OTP in ${otpFields.length} fields`);
        } else {
            console.log('⚠️ No OTP fields detected for auto-fill');
        }
    }

    // Detect OTP input fields
    function detectOTPFields() {
        const selectors = [
            'input[type="text"][name*="otp"]',
            'input[type="text"][id*="otp"]',
            'input[type="text"][placeholder*="otp"]',
            'input[type="number"][name*="otp"]',
            'input[type="tel"][name*="otp"]',
            'input[name*="verification"]',
            'input[id*="verification"]',
            'input[placeholder*="verification"]',
            'input[name*="code"]',
            'input[id*="code"]',
            'input[placeholder*="code"]'
        ];
        
        const fields = [];
        selectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(field => {
                if (!fields.includes(field)) {
                    fields.push(field);
                }
            });
        });
        
        return fields;
    }

    // Generate random OTP for demo
    function generateRandomOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    // Show credentials dialog
    function showCredentialsDialog() {
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 999999;
            font-family: Arial, sans-serif;
            max-width: 450px;
            width: 90%;
        `;
        
        dialog.innerHTML = `
            <h3 style="color: #333; margin-bottom: 20px; text-align: center;">🔑 Gmail Credentials Setup</h3>
            <p style="margin-bottom: 20px; color: #666; text-align: center;">
                Enter your Gmail credentials for automatic OTP monitoring:
            </p>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Gmail Address:</label>
                <input type="email" id="cred-email" placeholder="your.email@gmail.com" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
            </div>
            
            <div style="margin-bottom: 20px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">App Password:</label>
                <input type="password" id="cred-password" placeholder="16-character app password" style="
                    width: 100%;
                    padding: 10px;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    font-size: 14px;
                    box-sizing: border-box;
                ">
                <small style="color: #666;">Create app password at: <a href="https://myaccount.google.com/apppasswords" target="_blank">Google App Passwords</a></small>
            </div>
            
            <div style="text-align: center;">
                <button id="save-creds" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-right: 10px;
                    font-weight: bold;
                ">Save & Start Monitoring</button>
                <button id="cancel-creds" style="
                    background: #6c757d;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Event listeners
        document.getElementById('save-creds').onclick = () => {
            const email = document.getElementById('cred-email').value;
            const password = document.getElementById('cred-password').value;
            
            if (email && password) {
                GM_setValue('gmail_email', email);
                GM_setValue('gmail_password', password);
                
                document.body.removeChild(dialog);
                startAutomaticMonitoring();
            } else {
                alert('Please enter both email and app password');
            }
        };
        
        document.getElementById('cancel-creds').onclick = () => {
            document.body.removeChild(dialog);
        };
    }
    function createOTPMonitor() {
        const monitor = document.createElement('div');
        monitor.id = 'ivac-otp-monitor';
        monitor.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 350px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 99999;
            font-family: Arial, sans-serif;
            display: none;
            max-height: 80vh;
            overflow-y: auto;
        `;

        monitor.innerHTML = `
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px; border-radius: 15px 15px 0 0; position: relative;">
                <h3 style="margin: 0; font-size: 16px;">🔐 IVAC OTP Monitor</h3>
                <button id="close-monitor" style="position: absolute; right: 10px; top: 10px; background: none; border: none; color: white; font-size: 20px; cursor: pointer; width: 30px; height: 30px;">×</button>
            </div>
            
            <div style="padding: 20px;">
                <!-- Method Tabs -->
                <div style="display: flex; margin-bottom: 15px; background: #f5f5f5; border-radius: 8px; padding: 3px;">
                    <div class="otp-tab active" data-tab="manual" style="flex: 1; padding: 8px; text-align: center; cursor: pointer; border-radius: 5px; font-size: 12px; background: #667eea; color: white;">Manual Input</div>
                    <div class="otp-tab" data-tab="history" style="flex: 1; padding: 8px; text-align: center; cursor: pointer; border-radius: 5px; font-size: 12px;">History</div>
                </div>

                <!-- Manual Input Tab -->
                <div id="manual-tab" class="tab-content">
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-size: 12px;">
                        <strong>Instructions:</strong> Copy IVAC email/SMS content and paste below to extract OTP automatically.
                    </div>
                    
                    <textarea id="email-content" placeholder="Paste your IVAC email content or SMS here..." style="
                        width: 100%;
                        height: 120px;
                        padding: 10px;
                        border: 2px solid #ddd;
                        border-radius: 8px;
                        font-size: 13px;
                        resize: vertical;
                        box-sizing: border-box;
                    "></textarea>
                    
                    <button id="extract-otp" style="
                        background: #667eea;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                        width: 100%;
                        margin: 10px 0;
                    ">Extract OTP</button>
                </div>

                <!-- History Tab -->
                <div id="history-tab" class="tab-content" style="display: none;">
                    <div id="otp-history-list" style="max-height: 200px; overflow-y: auto;">
                        <p style="text-align: center; color: #666; margin: 20px 0;">No OTP history yet</p>
                    </div>
                    <button id="clear-history" style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                        width: 100%;
                    ">Clear History</button>
                </div>

                <!-- Current OTP Display -->
                <div id="current-otp" style="display: none; background: #f8f9fa; border: 2px solid #e9ecef; border-radius: 8px; padding: 15px; text-align: center; margin-top: 15px;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #333;">Current OTP:</p>
                    <div id="otp-display" style="
                        font-size: 20px;
                        font-weight: bold;
                        color: #667eea;
                        letter-spacing: 2px;
                        margin: 10px 0;
                        padding: 12px;
                        background: white;
                        border-radius: 8px;
                        border: 2px dashed #667eea;
                    ">------</div>
                    <div id="otp-timestamp" style="font-size: 11px; color: #666; margin-bottom: 10px;"></div>
                    <button id="copy-current-otp" style="
                        background: #28a745;
                        color: white;
                        border: none;
                        padding: 8px 15px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 12px;
                        width: 100%;
                    ">Copy OTP</button>
                </div>

                <!-- Status Message -->
                <div id="status-message" style="display: none; padding: 10px; border-radius: 5px; margin-top: 10px; text-align: center; font-size: 12px;"></div>
            </div>
        `;

        document.body.appendChild(monitor);
        setupEventListeners();
        loadHistory();
    }

    // Function to setup all event listeners
    function setupEventListeners() {
        // Close monitor
        document.getElementById('close-monitor').addEventListener('click', hideMonitor);
        
        // Tab switching
        document.querySelectorAll('.otp-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                switchTab(this.dataset.tab);
            });
        });
        
        // Extract OTP button
        document.getElementById('extract-otp').addEventListener('click', extractOTPFromText);
        
        // Copy current OTP
        document.getElementById('copy-current-otp').addEventListener('click', copyCurrentOTP);
        
        // Clear history
        document.getElementById('clear-history').addEventListener('click', clearHistory);
        
        // Auto-extract on paste
        document.getElementById('email-content').addEventListener('paste', function() {
            setTimeout(() => {
                if (this.value.trim()) {
                    extractOTPFromText();
                }
            }, 100);
        });
    }

    // Function to switch tabs
    function switchTab(tabName) {
        // Update tab appearance
        document.querySelectorAll('.otp-tab').forEach(tab => {
            tab.style.background = 'transparent';
            tab.style.color = '#333';
        });
        document.querySelector(`[data-tab="${tabName}"]`).style.background = '#667eea';
        document.querySelector(`[data-tab="${tabName}"]`).style.color = 'white';
        
        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.getElementById(`${tabName}-tab`).style.display = 'block';
    }

    // Function to extract OTP from text
    function extractOTPFromText() {
        const text = document.getElementById('email-content').value;
        if (!text.trim()) {
            showStatus('Please paste email content or SMS text', 'error');
            return;
        }

        // Check if it's IVAC related
        if (!isIVACRelated(text)) {
            showStatus('Warning: This doesn\'t appear to be IVAC-related content', 'warning');
        }

        const otp = extractOTP(text);
        if (otp) {
            displayOTP(otp);
            addToHistory(otp, 'Manual Input');
            showStatus(`OTP extracted: ${otp}`, 'success');
        } else {
            showStatus('No OTP found in the provided text', 'error');
        }
    }

    // Function to extract OTP using patterns
    function extractOTP(text) {
        const otpPatterns = [
            /\b(\d{6})\b/g,  // 6-digit OTP
            /\b(\d{4})\b/g,  // 4-digit OTP
            /\b(\d{5})\b/g,  // 5-digit OTP
            /(?:OTP|Code|Verification)[:\s]*(\d{4,6})/gi,
            /(?:pin|password)[:\s]*(\d{4,6})/gi,
            /(\d{4,6})(?:\s*is your|.*verification)/gi
        ];

        for (let pattern of otpPatterns) {
            const matches = [...text.matchAll(pattern)];
            if (matches.length > 0) {
                return matches[matches.length - 1][1]; // Return last match
            }
        }
        return null;
    }

    // Function to check if text is IVAC related
    function isIVACRelated(text) {
        const keywords = ['ivac', 'visa', 'appointment', 'consulate', 'embassy', 'verification', 'bangladesh'];
        return keywords.some(keyword => text.toLowerCase().includes(keyword));
    }

    // Function to display current OTP
    function displayOTP(otp) {
        latestOTP = otp;
        document.getElementById('otp-display').textContent = otp;
        document.getElementById('otp-timestamp').textContent = `Extracted: ${new Date().toLocaleTimeString()}`;
        document.getElementById('current-otp').style.display = 'block';
    }

    // Function to copy current OTP
    function copyCurrentOTP() {
        if (latestOTP) {
            copyToClipboard(latestOTP);
        }
    }

    // Function to copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showStatus(`Copied: ${text}`, 'success');
        }).catch(() => {
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showStatus(`Copied: ${text}`, 'success');
        });
    }

    // Function to add OTP to history
    function addToHistory(otp, source) {
        const historyItem = {
            otp: otp,
            time: new Date().toLocaleTimeString(),
            date: new Date().toLocaleDateString(),
            source: source
        };
        
        otpHistory.unshift(historyItem);
        
        // Keep only last 20 OTPs
        if (otpHistory.length > 20) {
            otpHistory = otpHistory.slice(0, 20);
        }
        
        updateHistoryDisplay();
        saveHistory();
    }

    // Function to update history display
    function updateHistoryDisplay() {
        const historyList = document.getElementById('otp-history-list');
        
        if (otpHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; color: #666; margin: 20px 0;">No OTP history yet</p>';
            return;
        }
        
        historyList.innerHTML = '';
        
        otpHistory.forEach((item, index) => {
            const historyItem = document.createElement('div');
            historyItem.style.cssText = `
                background: #f8f9fa;
                padding: 10px;
                margin-bottom: 8px;
                border-radius: 5px;
                border-left: 4px solid #667eea;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            historyItem.innerHTML = `
                <div>
                    <div style="font-weight: bold; font-size: 16px; color: #667eea;">${item.otp}</div>
                    <div style="font-size: 11px; color: #666;">${item.date} ${item.time} (${item.source})</div>
                </div>
                <button onclick="copyToClipboard('${item.otp}')" style="
                    background: #28a745;
                    color: white;
                    border: none;
                    padding: 5px 10px;
                    border-radius: 3px;
                    cursor: pointer;
                    font-size: 11px;
                ">Copy</button>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    // Function to clear history
    function clearHistory() {
        if (confirm('Are you sure you want to clear OTP history?')) {
            otpHistory = [];
            updateHistoryDisplay();
            saveHistory();
            showStatus('History cleared', 'success');
        }
    }

    // Function to save history to localStorage
    function saveHistory() {
        localStorage.setItem('ivacOtpHistory', JSON.stringify(otpHistory));
    }

    // Function to load history from localStorage
    function loadHistory() {
        const saved = localStorage.getItem('ivacOtpHistory');
        if (saved) {
            otpHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    }

    // Function to show status message
    function showStatus(message, type) {
        const statusDiv = document.getElementById('status-message');
        statusDiv.textContent = message;
        
        // Set colors based on type
        let bgColor, textColor;
        switch(type) {
            case 'success':
                bgColor = '#d4edda';
                textColor = '#155724';
                break;
            case 'error':
                bgColor = '#f8d7da';
                textColor = '#721c24';
                break;
            case 'warning':
                bgColor = '#fff3cd';
                textColor = '#856404';
                break;
            default:
                bgColor = '#d1ecf1';
                textColor = '#0c5460';
        }
        
        statusDiv.style.background = bgColor;
        statusDiv.style.color = textColor;
        statusDiv.style.display = 'block';
        
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 4000);
    }

    // Function to show monitor
    function showMonitor() {
        if (!document.getElementById('ivac-otp-monitor')) {
            createOTPMonitor();
        }
        document.getElementById('ivac-otp-monitor').style.display = 'block';
    }

    // Function to hide monitor
    function hideMonitor() {
        const monitor = document.getElementById('ivac-otp-monitor');
        if (monitor) {
            monitor.style.display = 'none';
        }
    }

    // Function to create toggle button
    function createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'ivac-otp-toggle';
        toggleBtn.innerHTML = '🔐 OTP Monitor';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 18px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 99998;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: transform 0.2s;
            font-weight: bold;
        `;

        toggleBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        toggleBtn.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });

        toggleBtn.addEventListener('click', function() {
            const monitor = document.getElementById('ivac-otp-monitor');
            if (monitor && monitor.style.display === 'block') {
                hideMonitor();
            } else {
                showMonitor();
            }
        });

        document.body.appendChild(toggleBtn);
    }

    // Function to create notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 999999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        
        // Add animation keyframes
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translate(-50%, -60%); }
                    to { opacity: 1; transform: translate(-50%, -50%); }
                }
            `;
            document.head.appendChild(style);
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    // Make copyToClipboard globally accessible
    window.copyToClipboard = copyToClipboard;

    // Initialize the application
    function init() {
        // Wait a bit for page to load
        setTimeout(() => {
            createToggleButton();
            
            // Show welcome notification
            showNotification('IVAC OTP Monitor loaded! Click the button to open.', 'success');
            
            // Auto-show if this is the first visit
            if (!localStorage.getItem('ivacOtpMonitorVisited')) {
                setTimeout(() => {
                    showMonitor();
                    localStorage.setItem('ivacOtpMonitorVisited', 'true');
                }, 2000);
            }
            
        }, 1000);
    }

    // Start the application
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();