import React, { useState, useEffect } from 'react';
import './App.css';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", author: "Martin Luther King Jr." },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney" },
  { text: "Don't let yesterday take up too much of today.", author: "Will Rogers" },
  { text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.", author: "Unknown" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.", author: "Steve Jobs" },
  { text: "People who are crazy enough to think they can change the world, are the ones who do.", author: "Rob Siltanen" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" }
];

function App() {
  const [quote, setQuote] = useState(quotes[0]);
  const [fadeOut, setFadeOut] = useState(false);
  const [quotesGenerated, setQuotesGenerated] = useState(0);
  const [tweetCount, setTweetCount] = useState(0);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    displayNewQuote();
    const blinkInterval = setInterval(() => {
      setBlink(prev => !prev);
    }, 600);
    return () => clearInterval(blinkInterval);
  }, []);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const displayNewQuote = () => {
    setFadeOut(true);
    
    setTimeout(() => {
      const newQuote = getRandomQuote();
      setQuote(newQuote);
      setFadeOut(false);
      setQuotesGenerated(prev => prev + 1);
    }, 300);
  };

  const handleTweetClick = () => {
    setTweetCount(prev => prev + 1);
  };

  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`"${quote.text}" - ${quote.author}`)}`;

  return (
    <div className="terminal">
      <header className="terminal-header">
        <div className="window-controls">
          <span className="control close"></span>
          <span className="control minimize"></span>
          <span className="control maximize"></span>
        </div>
        <div className="title-bar">
          <span className="prompt">{'>'}</span>
          <span className="title">RANDOM_QUOTE_MACHINE</span>
          <span className="cursor" style={{ opacity: blink ? 1 : 0 }}>_</span>
        </div>
      </header>

      <main className="terminal-body">
        <div className="app-header">
          <h1 className="app-title">~/wisdom/quotes</h1>
          <div className="status-bar">
            <span className="status-item">ONLINE</span>
            <span className="status-item">v1.0.0</span>
            <span className="status-item">INSPIRE</span>
          </div>
        </div>

        <div id="quote-box" className="quote-section">
          <div className="output-panel">
            <div className="output-header">
              <span className="output-title">CURRENT_QUOTE</span>
              <span className="output-status">READY</span>
            </div>
            <div className="output-content">
              <div 
                id="text" 
                className={`quote-text ${fadeOut ? 'fade-out' : 'fade-in'}`}
              >
                {quote.text}
              </div>
              <div 
                id="author" 
                className={`quote-author ${fadeOut ? 'fade-out' : 'fade-in'}`}
              >
                {quote.author}
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <a
              id="tweet-quote"
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn tweet-btn"
              onClick={handleTweetClick}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              TWEET
            </a>

            <button 
              id="new-quote" 
              className="action-btn generate-btn"
              onClick={displayNewQuote}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              NEW_QUOTE
            </button>
          </div>
        </div>

        <div className="info-panel">
          <div className="info-header">
            <span className="info-title">SESSION_STATISTICS</span>
          </div>
          <div className="info-content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value" id="quotes-generated">{quotesGenerated}</span>
                <span className="stat-label">QUOTES_SHOWN</span>
              </div>
              <div className="stat-item">
                <span className="stat-value" id="tweet-count">{tweetCount}</span>
                <span className="stat-label">TWEETS</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">100%</span>
                <span className="stat-label">WISDOM</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">v1.0</span>
                <span className="stat-label">VERSION</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="terminal-footer">
        <div className="footer-stats">
          <span className="stat">STATUS: <span className="highlight">OPERATIONAL</span></span>
          <span className="stat">MODE: <span className="highlight">RANDOM</span></span>
          <span className="stat">ENGINE: <span className="highlight">WISDOM_v1</span></span>
        </div>
      </footer>
    </div>
  );
}

export default App;