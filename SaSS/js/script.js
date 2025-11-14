// Enhanced TUI URL Shortener with Theme System
class TuiUrlShortener {
    constructor() {
        this.shortenedUrls = JSON.parse(localStorage.getItem('shortenedUrls')) || [];
        this.currentTheme = localStorage.getItem('tuiTheme') || 'default';
        this.commandHistory = [];
        this.historyIndex = -1;
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.updateStats();
        this.displayHistory();
        this.setupConsoleWelcome();
    }

    bindEvents() {
        const shortenBtn = document.getElementById('shorten');
        const urlInput = document.getElementById('urlInput');

        // URL shortening
        shortenBtn.addEventListener('click', () => this.shortenUrl());
        
        // Enter key support
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.shortenUrl();
        });

        // Theme switching
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.target.dataset.theme;
                this.switchTheme(theme);
            });
        });

        // Command history navigation
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateHistory(e.key);
            }
        });

        // Save command to history on input
        urlInput.addEventListener('input', (e) => {
            this.currentInput = e.target.value;
        });

        // Window controls
        document.querySelector('.control.close').addEventListener('click', () => this.showShutdownDialog());
        document.querySelector('.control.minimize').addEventListener('click', () => this.minimizeTerminal());
        document.querySelector('.control.maximize').addEventListener('click', () => this.toggleFullscreen());
    }

    // Theme Management
    switchTheme(themeName) {
        this.currentTheme = themeName;
        localStorage.setItem('tuiTheme', themeName);
        this.applyTheme(themeName);
        
        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        
        // Update theme display
        const themeDisplay = document.getElementById('current-theme');
        if (themeDisplay) {
            themeDisplay.textContent = themeName.toUpperCase();
        }
        
        this.logToConsole(`Theme switched to: ${themeName.toUpperCase()}`, 'success');
    }

    applyTheme(themeName) {
        document.body.className = `theme-${themeName}`;
        
        // Set active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
    }

    // Command History
    navigateHistory(key) {
        const input = document.getElementById('urlInput');
        
        if (key === 'ArrowUp') {
            if (this.historyIndex < this.commandHistory.length - 1) {
                this.historyIndex++;
                input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            }
        } else if (key === 'ArrowDown') {
            if (this.historyIndex > 0) {
                this.historyIndex--;
                input.value = this.commandHistory[this.commandHistory.length - 1 - this.historyIndex];
            } else if (this.historyIndex === 0) {
                this.historyIndex = -1;
                input.value = this.currentInput || '';
            }
        }
    }

    addToHistory(url) {
        this.commandHistory.push(url);
        if (this.commandHistory.length > 50) {
            this.commandHistory.shift(); // Keep only last 50 commands
        }
        this.historyIndex = -1;
        this.currentInput = '';
    }

    // URL Shortening Logic
    async shortenUrl() {
        const urlInput = document.getElementById('urlInput');
        const shortenBtn = document.getElementById('shorten');
        const url = urlInput.value.trim();

        if (!url) {
            this.showError('NO_INPUT: Please enter a URL to shorten');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('INVALID_URL: Must start with http:// or https://');
            return;
        }

        this.addToHistory(url);
        this.showLoading();
        shortenBtn.disabled = true;

        try {
            const result = await this.mockApiCall(url);
            this.displayResult(url, result.shortUrl, result.stats);
            this.saveToHistory(url, result.shortUrl);
            this.updateStats();
            this.logToConsole(`URL shortened: ${url} → ${result.shortUrl}`, 'success');
        } catch (error) {
            this.showError(`NETWORK_ERROR: ${error.message}`);
            this.logToConsole(`Shortening failed: ${error.message}`, 'error');
        } finally {
            shortenBtn.disabled = false;
            this.hideLoading();
        }
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return url.startsWith('http://') || url.startsWith('https://');
        } catch {
            return false;
        }
    }

    async mockApiCall(url) {
        // Simulate API call with random delay
        const delay = 800 + Math.random() * 1200;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simulate occasional errors (10% chance)
        if (Math.random() < 0.1) {
            throw new Error('API timeout - please try again');
        }

        // Generate short code
        const shortCode = Math.random().toString(36).substring(2, 8);
        const shortUrl = `${window.location.origin}/s/${shortCode}`;

        // Simulate some stats
        const stats = {
            clicks: Math.floor(Math.random() * 100),
            created: new Date().toISOString(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        return { shortUrl, stats };
    }

    // UI Management
    displayResult(originalUrl, shortUrl, stats) {
        const output = document.getElementById('output');
        const resultDiv = document.getElementById('result');

        resultDiv.innerHTML = `
            <div class="url-result">
                <div class="original-url">
                    <span style="color: var(--accent-cyan); font-weight: 600;">[ORIGINAL]</span><br>
                    ${originalUrl}
                </div>
                <div class="short-url">
                    <span style="color: var(--accent-success); font-weight: 600;">[SHORTENED]</span><br>
                    ${shortUrl}
                </div>
                <div style="margin-top: 15px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-primary);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; font-size: 0.85em;">
                        <div>
                            <span style="color: var(--text-dim);">CLICKS:</span><br>
                            <span style="color: var(--accent-info);">${stats.clicks}</span>
                        </div>
                        <div>
                            <span style="color: var(--text-dim);">CREATED:</span><br>
                            <span style="color: var(--accent-cyan);">${new Date(stats.created).toLocaleDateString()}</span>
                        </div>
                        <div>
                            <span style="color: var(--text-dim);">EXPIRES:</span><br>
                            <span style="color: var(--accent-warning);">${new Date(stats.expires).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
                <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button class="copy-btn" onclick="tuiApp.copyToClipboard('${shortUrl}', this)">
                        📋 COPY_URL
                    </button>
                    <button class="copy-btn" onclick="tuiApp.openUrl('${shortUrl}')" 
                            style="background: var(--accent-info); border-color: var(--accent-info);">
                        🔗 TEST_URL
                    </button>
                    <button class="copy-btn" onclick="tuiApp.generateQR('${shortUrl}')"
                            style="background: var(--accent-warning); border-color: var(--accent-warning);">
                        📱 QR_CODE
                    </button>
                    <button class="copy-btn" onclick="tuiApp.analyzeUrl('${shortUrl}')"
                            style="background: var(--accent-purple); border-color: var(--accent-purple);">
                        📊 ANALYZE
                    </button>
                </div>
            </div>
            <div style="color: var(--accent-success); margin-top: 15px; font-weight: 600; text-align: center;">
                ✅ URL_SUCCESSFULLY_SHORTENED
            </div>
        `;

        output.classList.remove('hide');
    }

    showError(message) {
        const output = document.getElementById('output');
        const resultDiv = document.getElementById('result');

        resultDiv.innerHTML = `
            <div style="color: var(--accent-error);">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <span style="font-size: 1.5em;">⚠️</span>
                    <span style="font-weight: 600; font-size: 1.1em;">ERROR</span>
                </div>
                <div style="background: var(--bg-secondary); padding: 15px; border: 1px solid var(--accent-error);">
                    ${message}
                </div>
                <div style="margin-top: 10px; font-size: 0.9em; color: var(--text-dim);">
                    TIP: Ensure the URL starts with http:// or https://
                </div>
            </div>
        `;

        output.classList.remove('hide');
    }

    showLoading() {
        const shortenBtn = document.getElementById('shorten');
        const output = document.getElementById('output');
        const resultDiv = document.getElementById('result');

        shortenBtn.textContent = 'PROCESSING...';
        shortenBtn.style.background = 'var(--accent-warning)';
        
        output.classList.remove('hide');
        resultDiv.innerHTML = `
            <div style="text-align: center; color: var(--text-dim);">
                <div style="font-size: 2em; margin-bottom: 10px;">⏳</div>
                <div>PROCESSING_URL...</div>
                <div style="margin-top: 10px; font-size: 0.9em;">
                    Contacting URL shortening service
                </div>
            </div>
        `;
    }

    hideLoading() {
        const shortenBtn = document.getElementById('shorten');
        shortenBtn.textContent = 'SHORTEN_URL';
        shortenBtn.style.background = '';
    }

    // Data Management
    saveToHistory(originalUrl, shortUrl) {
        const urlData = {
            original: originalUrl,
            short: shortUrl,
            timestamp: new Date().toISOString(),
            clicks: 0,
            id: Math.random().toString(36).substring(2, 9)
        };

        this.shortenedUrls.push(urlData);
        localStorage.setItem('shortenedUrls', JSON.stringify(this.shortenedUrls));
    }

    updateStats() {
        const totalUrls = document.getElementById('total-urls');
        const activeUrls = document.getElementById('active-urls');
        const footerStats = document.getElementById('total-urls-footer');

        const total = this.shortenedUrls.length;
        const active = this.shortenedUrls.filter(url => {
            const created = new Date(url.timestamp);
            const expires = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000);
            return expires > new Date();
        }).length;

        totalUrls.textContent = total;
        activeUrls.textContent = active;
        if (footerStats) footerStats.textContent = total;
    }

    displayHistory() {
        // Could display recent URLs in a sidebar
        console.log('URL History:', this.shortenedUrls.slice(-5));
    }

    // Utility Functions
    copyToClipboard(text, buttonElement) {
        navigator.clipboard.writeText(text).then(() => {
            const originalText = buttonElement.textContent;
            buttonElement.textContent = '✅ COPIED!';
            buttonElement.style.background = 'var(--accent-success)';
            buttonElement.style.borderColor = 'var(--accent-success)';
            
            setTimeout(() => {
                buttonElement.textContent = originalText;
                buttonElement.style.background = '';
                buttonElement.style.borderColor = '';
            }, 2000);
            
            this.logToConsole('URL copied to clipboard', 'info');
        }).catch((err) => {
            this.showError('Failed to copy to clipboard');
            this.logToConsole('Clipboard copy failed', 'error');
        });
    }

    openUrl(url) {
        window.open(url, '_blank');
        this.logToConsole(`Opening URL: ${url}`, 'info');
    }

    generateQR(url) {
        const qrUrl = `https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=${encodeURIComponent(url)}`;
        window.open(qrUrl, '_blank');
        this.logToConsole('QR code generated', 'info');
    }

    analyzeUrl(url) {
        this.logToConsole(`Analyzing URL: ${url}`, 'info');
        // In a real app, this would show analytics
        alert(`URL Analysis:\n\nShort URL: ${url}\nTotal Clicks: ${Math.floor(Math.random() * 100)}\nStatus: Active\nCreated: ${new Date().toLocaleDateString()}`);
    }

    // Terminal Controls
    showShutdownDialog() {
        if (confirm('Are you sure you want to close the terminal?')) {
            this.logToConsole('Terminal session ended', 'warning');
            // In a real app, this might close the window
            document.body.style.opacity = '0.7';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 1000);
        }
    }

    minimizeTerminal() {
        this.logToConsole('Terminal minimized', 'info');
        document.querySelector('.terminal').style.transform = 'scale(0.95)';
        setTimeout(() => {
            document.querySelector('.terminal').style.transform = 'scale(1)';
        }, 150);
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                this.logToConsole('Fullscreen failed: ' + err.message, 'error');
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Console Logging
    logToConsole(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const styles = {
            info: 'color: #66b3ff;',
            success: 'color: #00ff88;',
            warning: 'color: #ffaa00;',
            error: 'color: #ff4444;'
        };
        
        console.log(`%c[${timestamp}] ${message}`, styles[type]);
    }

    setupConsoleWelcome() {
        const welcomeMessage = `
╔═══════════════════════════════════════════════╗
║            URL SHORTENER TUI v2.1             ║
║              THEME SYSTEM LOADED              ║
║                                               ║
║  Available Commands:                          ║
║  • Enter URL to shorten                       ║
║  • Use ↑/↓ arrows for command history         ║
║  • Press Enter to submit                      ║
║  • Click theme buttons to switch appearance   ║
║                                               ║
║  Features:                                    ║
║  • Local storage persistence                  ║
║  • URL validation                             ║
║  • Copy to clipboard                          ║
║  • QR code generation                         ║
║  • 6 different themes                         ║
║  • Command history navigation                 ║
╚═══════════════════════════════════════════════╝
        `;
        
        console.log(`%c${welcomeMessage}`, 'color: #00ff88; font-family: monospace; font-size: 12px;');
        this.logToConsole('TUI System initialized successfully', 'success');
    }
}

// Initialize the application when DOM is loaded
let tuiApp;

document.addEventListener('DOMContentLoaded', function() {
    tuiApp = new TuiUrlShortener();
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        tuiApp.logToConsole('System error occurred', 'error');
    });
});

// Make functions globally available for onclick handlers
window.tuiApp = {
    copyToClipboard: (text, element) => tuiApp?.copyToClipboard(text, element),
    openUrl: (url) => tuiApp?.openUrl(url),
    generateQR: (url) => tuiApp?.generateQR(url),
    analyzeUrl: (url) => tuiApp?.analyzeUrl(url)
};