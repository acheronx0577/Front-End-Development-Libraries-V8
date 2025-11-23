import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [markdown, setMarkdown] = useState(`# Heading 1
## Heading 2
### Heading 3

**This is bold text**
*This is italic text*
***This is bold and italic***
~~This is strikethrough~~

\`This is inline code\`

[This is a link](https://example.com)

> This is a blockquote
> It can span multiple lines`);

  const [theme, setTheme] = useState('default');
  const [consoleLines, setConsoleLines] = useState([]);
  const [stats, setStats] = useState({
    lines: 1,
    chars: 0,
    words: 0,
    elements: 0,
    headings: 0,
    renderTime: 0
  });

  const consoleEndRef = useRef(null);

  // Initialize console
  useEffect(() => {
    logToConsole('MARKDOWN_PREVIEWER_TUI v1.2.0 INITIALIZED', 'success');
    logToConsole('PARSER: MARKED.JS [GFM_ENABLED]', 'info');
    logToConsole('MODE: LIVE_PREVIEW [SYNCHRONIZED]', 'info');
    logToConsole('STATUS: AWAITING_MARKDOWN_INPUT', 'info');
  }, []);

  // Scroll console to bottom
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLines]);

  const logToConsole = (message, type = 'info') => {
    setConsoleLines(prev => [...prev, { message, type }]);
  };

  const handleMarkdownChange = (e) => {
    const newMarkdown = e.target.value;
    setMarkdown(newMarkdown);
    updateStats(newMarkdown);
  };

  const updateStats = (text) => {
    const lines = text.split('\n').length;
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    
    setStats(prev => ({
      ...prev,
      lines,
      chars,
      words
    }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('tuiTheme', newTheme);
    logToConsole(`Theme switched to: ${newTheme.toUpperCase()}`, 'success');
  };

  const getRenderedMarkdown = () => {
    let html = '';
    try {
      if (window.marked) {
        html = window.marked.parse(markdown);
      } else {
        html = '<div style="color: var(--accent-error);">Error: Marked.js not loaded</div>';
      }
    } catch (error) {
      html = `<div style=\"color: var(--accent-error);\">Error: ${error.message}</div>`;
      logToConsole(`Render error: ${error.message}`, 'error');
    }
    return { __html: html };
  };

  // Update renderTime, elements, headings when markdown changes
  useEffect(() => {
    const startTime = performance.now();
    if (window.marked) {
      window.marked.parse(markdown);
      const endTime = performance.now();
      setStats(prev => ({ ...prev, renderTime: Math.round(endTime - startTime) }));
      setTimeout(() => {
        const previewElement = document.getElementById('preview');
        if (previewElement) {
          const elements = previewElement.querySelectorAll('*').length;
          const headings = previewElement.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
          setStats(prev => ({ ...prev, elements, headings }));
        }
      }, 0);
    }
  }, [markdown]);

  const getEditorStatus = () => {
    if (stats.chars === 0) return 'EMPTY';
    if (stats.chars < 100) return 'SMALL';
    if (stats.chars < 500) return 'MEDIUM';
    return 'LARGE';
  };

  const getPreviewStatus = () => {
    if (stats.chars === 0) return 'EMPTY';
    return 'RENDERED';
  };

  const handleShutdown = () => {
    if (window.confirm('Are you sure you want to close the terminal?')) {
      logToConsole('Terminal session ended', 'warning');
      document.body.style.opacity = '0.7';
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 1000);
    }
  };

  const handleMinimize = () => {
    logToConsole('Terminal minimized', 'info');
    const terminal = document.querySelector('.terminal');
    if (terminal) {
      terminal.style.transform = 'scale(0.95)';
      setTimeout(() => {
        terminal.style.transform = 'scale(1)';
      }, 150);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const themes = [
    { name: 'default', gradient: 'linear-gradient(135deg, #0a1929 0%, #132f4c 100%)' },
    { name: 'matrix', gradient: 'linear-gradient(135deg, #0a0a0a 0%, #001100 100%)' },
    { name: 'cyberpunk', gradient: 'linear-gradient(135deg, #1a0b2e 0%, #2d1b69 100%)' },
    { name: 'solarized', gradient: 'linear-gradient(135deg, #002b36 0%, #073642 100%)' }
  ];

  return (
    <div className={`App theme-${theme}`}>
      <div className="terminal">
        <header className="terminal-header">
          <div className="window-controls">
            <span className="control close" onClick={handleShutdown} title="Close"></span>
            <span className="control minimize" onClick={handleMinimize} title="Minimize"></span>
            <span className="control maximize" onClick={toggleFullscreen} title="Maximize"></span>
          </div>
          <div className="title-bar">
            <span className="prompt">$</span>
            <span className="title">markdown_previewer --tui --live</span>
            <span className="cursor">_</span>
          </div>
          <div className="header-stats">
            <span className="header-stat">[v1.2.0]</span>
            <span className="header-stat">[GFM]</span>
          </div>
        </header>

        <main className="terminal-body">
          {/* Console Output */}
          <div className="console-output">
            {consoleLines.map((line, index) => (
              <div key={index} className="console-line">
                <span className="prompt">{'>'}</span>
                <span 
                  className="output-text" 
                  style={{ 
                    color: line.type === 'success' ? 'var(--accent-success)' : 
                           line.type === 'error' ? 'var(--accent-error)' : 
                           line.type === 'warning' ? 'var(--accent-warning)' : 
                           'var(--text-secondary)'
                  }}
                >
                  {line.message}
                </span>
              </div>
            ))}
            <div ref={consoleEndRef} />
          </div>

          {/* Theme Selector */}
          <div className="theme-section">
            <div className="section-header">
              <span className="prompt">$</span>
              <span className="section-title">THEME_SELECTOR</span>
            </div>
            <div className="theme-grid">
              {themes.map(themeOption => (
                <button
                  key={themeOption.name}
                  className={`theme-option ${theme === themeOption.name ? 'active' : ''}`}
                  onClick={() => handleThemeChange(themeOption.name)}
                >
                  <span 
                    className="theme-preview" 
                    style={{ background: themeOption.gradient }}
                  ></span>
                  <span className="theme-name">{themeOption.name.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editor and Preview Panels */}
          <div className="panels-container">
            {/* Editor Panel */}
            <div className="panel editor-panel">
              <div className="panel-header">
                <span className="prompt">{'>'}</span>
                <span className="panel-title">EDITOR [MARKDOWN]</span>
                <span className="panel-status">{getEditorStatus()}</span>
              </div>
              <div className="panel-content">
                <textarea
                  id="editor"
                  className="markdown-editor"
                  value={markdown}
                  onChange={handleMarkdownChange}
                  placeholder="Start typing your markdown here..."
                />
                <div className="editor-info">
                  <span className="info-item">LINES: <span>{stats.lines}</span></span>
                  <span className="info-item">CHARS: <span>{stats.chars}</span></span>
                  <span className="info-item">SYNC: <span>LIVE</span></span>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="panel preview-panel">
              <div className="panel-header">
                <span className="prompt">{'>'}</span>
                <span className="panel-title">PREVIEW [RENDERED]</span>
                <span className="panel-status">{getPreviewStatus()}</span>
              </div>
              <div className="panel-content">
                <div 
                  id="preview" 
                  className="markdown-preview"
                  dangerouslySetInnerHTML={getRenderedMarkdown()}
                />
                <div className="preview-info">
                  <span className="info-item">ELEMENTS: <span>{stats.elements}</span></span>
                  <span className="info-item">WORDS: <span>{stats.words}</span></span>
                  <span className="info-item">RENDER: <span>{stats.renderTime}ms</span></span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Reference */}
          <div className="reference-section">
            <div className="section-header">
              <span className="prompt">$</span>
              <span className="section-title">MARKDOWN_REFERENCE</span>
            </div>
            <div className="reference-grid">
              <div className="ref-item">
                <code># H1</code>
                <span>Heading 1</span>
              </div>
              <div className="ref-item">
                <code>**bold**</code>
                <span>Bold Text</span>
              </div>
              <div className="ref-item">
                <code>*italic*</code>
                <span>Italic Text</span>
              </div>
              <div className="ref-item">
                <code>`code`</code>
                <span>Inline Code</span>
              </div>
              <div className="ref-item">
                <code>[link](url)</code>
                <span>Hyperlink</span>
              </div>
              <div className="ref-item">
                <code>- item</code>
                <span>List Item</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-section">
            <div className="section-header">
              <span className="prompt">$</span>
              <span className="section-title">DOCUMENT_STATISTICS</span>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.lines}</div>
                <div className="stat-label">TOTAL_LINES</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.words}</div>
                <div className="stat-label">WORDS</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.chars}</div>
                <div className="stat-label">CHARACTERS</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.headings}</div>
                <div className="stat-label">HEADINGS</div>
              </div>
            </div>
          </div>
        </main>

        <footer className="terminal-footer">
          <div className="footer-content">
            <span className="footer-item">[MARKED.JS]</span>
            <span className="footer-item">[THEME: {theme.toUpperCase()}]</span>
            <span className="footer-item">[LIVE_PREVIEW]</span>
            <span className="footer-item">[v1.2.0]</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;