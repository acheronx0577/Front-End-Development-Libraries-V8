// script.js
// TUI Markdown Previewer
class TuiMarkdownPreviewer {
    constructor() {
        this.currentTheme = localStorage.getItem('tuiTheme') || 'default';
        this.defaultMarkdown = `# Heading 1
## Heading 2
### Heading 3

**This is bold text**
*This is italic text*
***This is bold and italic***
~~This is strikethrough~~

\`This is inline code\`

[This is a link](https://example.com)

> This is a blockquote
> It can span multiple lines`;
        this.init();
    }

    init() {
        this.configureMarked();
        this.applyTheme(this.currentTheme);
        this.bindEvents();
        this.initializeEditor();
        this.displayConsoleWelcome();
        this.updateStats();
    }

    configureMarked() {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: function(code, lang) {
                // Simple syntax highlighting
                return code;
            }
        });
    }

    bindEvents() {
        const editor = document.getElementById('editor');
        
        // Theme switching
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const theme = e.currentTarget.dataset.theme;
                this.switchTheme(theme);
            });
        });

        // Editor events
        editor.addEventListener('input', () => {
            this.updatePreview();
            this.updateEditorStats();
        });

        // Window controls
        document.querySelector('.control.close').addEventListener('click', () => this.showShutdownDialog());
        document.querySelector('.control.minimize').addEventListener('click', () => this.minimizeTerminal());
        document.querySelector('.control.maximize').addEventListener('click', () => this.toggleFullscreen());

        // Initial update
        this.updatePreview();
        this.updateEditorStats();
    }

    initializeEditor() {
        const editor = document.getElementById('editor');
        editor.value = this.defaultMarkdown;
    }

    // Theme Management
    switchTheme(themeName) {
        this.currentTheme = themeName;
        localStorage.setItem('tuiTheme', themeName);
        this.applyTheme(themeName);
        
        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === themeName);
        });
        
        // Update theme displays
        document.getElementById('footer-theme').textContent = themeName.toUpperCase();
        
        this.logToConsole(`Theme switched to: ${themeName.toUpperCase()}`, 'success');
    }

    applyTheme(themeName) {
        document.body.className = `theme-${themeName}`;
    }

    // Preview Management
    updatePreview() {
        const editor = document.getElementById('editor');
        const preview = document.getElementById('preview');
        const previewStatus = document.getElementById('preview-status');
        const syncStatus = document.getElementById('sync-status');
        
        const startTime = performance.now();
        const markdown = editor.value;
        
        if (!markdown.trim()) {
            preview.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">Markdown preview will appear here</div>
                    <div class="empty-desc">Start typing in the editor to see live preview</div>
                </div>
            `;
            previewStatus.textContent = 'EMPTY';
            syncStatus.textContent = 'LIVE';
            return;
        }

        try {
            const html = marked.parse(markdown);
            preview.innerHTML = html;
            previewStatus.textContent = 'RENDERED';
            syncStatus.textContent = 'LIVE';
            
            const endTime = performance.now();
            document.getElementById('render-time').textContent = `${Math.round(endTime - startTime)}ms`;
            
            this.updatePreviewStats();
        } catch (error) {
            preview.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <div class="empty-text">Error rendering markdown</div>
                    <div class="empty-desc">${error.message}</div>
                </div>
            `;
            previewStatus.textContent = 'ERROR';
            syncStatus.textContent = 'ERROR';
            this.logToConsole(`Render error: ${error.message}`, 'error');
        }
    }

    // Stats Management
    updateEditorStats() {
        const editor = document.getElementById('editor');
        const text = editor.value;
        
        const lines = text.split('\n').length;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        document.getElementById('line-count').textContent = lines;
        document.getElementById('char-count').textContent = chars;
        document.getElementById('total-lines').textContent = lines;
        document.getElementById('total-words').textContent = words;
        document.getElementById('total-chars').textContent = chars;
        
        // Update editor status
        const editorStatus = document.getElementById('editor-status');
        if (chars === 0) {
            editorStatus.textContent = 'EMPTY';
        } else if (chars < 100) {
            editorStatus.textContent = 'SMALL';
        } else if (chars < 500) {
            editorStatus.textContent = 'MEDIUM';
        } else {
            editorStatus.textContent = 'LARGE';
        }
    }

    updatePreviewStats() {
        const preview = document.getElementById('preview');
        
        // Count elements
        const elements = preview.querySelectorAll('*').length;
        const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
        const wordCount = preview.textContent.trim().split(/\s+/).length;
        
        document.getElementById('element-count').textContent = elements;
        document.getElementById('word-count').textContent = wordCount;
        document.getElementById('heading-count').textContent = headings;
    }

    updateStats() {
        this.updateEditorStats();
        this.updatePreviewStats();
    }

    // Console Management
    displayConsoleWelcome() {
        this.logToConsole('MARKDOWN_PREVIEWER_TUI v1.2.0 INITIALIZED', 'success');
        this.logToConsole('PARSER: MARKED.JS [GFM_ENABLED]', 'info');
        this.logToConsole('MODE: LIVE_PREVIEW [SYNCHRONIZED]', 'info');
        this.logToConsole('STATUS: AWAITING_MARKDOWN_INPUT', 'info');
    }

    logToConsole(message, type = 'info') {
        const consoleOutput = document.getElementById('console-output');
        const colors = {
            info: 'var(--text-secondary)',
            success: 'var(--accent-success)',
            error: 'var(--accent-error)',
            warning: 'var(--accent-warning)'
        };

        const line = document.createElement('div');
        line.className = 'console-line';
        line.innerHTML = `
            <span class="prompt">></span>
            <span class="output-text" style="color: ${colors[type]};">${message}</span>
        `;

        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    // Terminal Controls
    showShutdownDialog() {
        if (confirm('Are you sure you want to close the terminal?')) {
            this.logToConsole('Terminal session ended', 'warning');
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
}

// Initialize the application when DOM is loaded
let tuiMarkdown;

document.addEventListener('DOMContentLoaded', function() {
    tuiMarkdown = new TuiMarkdownPreviewer();
    
    // Add global error handler
    window.addEventListener('error', function(e) {
        console.error('Global error:', e.error);
        tuiMarkdown.logToConsole('System error occurred', 'error');
    });
});