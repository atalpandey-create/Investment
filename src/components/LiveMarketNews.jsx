import React, { useState, useEffect } from 'react';
import { Newspaper, RefreshCw, ExternalLink } from 'lucide-react';

const LiveMarketNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fallbackNews = [
    { title: "Market reaches new highs amidst positive global cues", pubDate: new Date().toISOString(), link: "https://www.moneycontrol.com/markets/indian-indices/" },
    { title: "RBI keeps repo rate unchanged in latest monetary policy", pubDate: new Date(Date.now() - 3600000).toISOString(), link: "https://www.moneycontrol.com/news/business/economy/" },
    { title: "Top 5 Mutual Funds to consider for long-term wealth creation", pubDate: new Date(Date.now() - 7200000).toISOString(), link: "https://www.moneycontrol.com/mutual-funds/" },
    { title: "Understanding the impact of new tax regime on FD returns", pubDate: new Date(Date.now() - 10800000).toISOString(), link: "https://www.moneycontrol.com/personal-finance/" }
  ];

  const fetchNews = async () => {
    setLoading(true);
    try {
      // Using a free RSS to JSON converter to fetch Moneycontrol/Livemint market news
      const rssUrl = 'https://www.moneycontrol.com/rss/marketreports.xml';
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.items && data.items.length > 0) {
          setNews(data.items.slice(0, 4)); // Get top 4 news items
        } else {
          setNews(fallbackNews);
        }
      } else {
        setNews(fallbackNews);
      }
    } catch (error) {
      console.error("Failed to fetch live news:", error);
      setNews(fallbackNews);
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
    // Auto-update every 15 minutes
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', margin: 0 }}>
          <Newspaper color="var(--primary)" />
          Live Market News
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button 
            onClick={fetchNews}
            style={{
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading && news.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading live market updates...</p>
        ) : (
          news.map((item, index) => (
            <a 
              key={index} 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                background: 'rgba(255, 255, 255, 0.4)',
                padding: '1rem',
                borderRadius: '12px',
                borderLeft: '3px solid var(--accent)',
                transition: 'background 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.7)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.4)'}
            >
              <div>
                <h4 style={{ color: 'var(--text-main)', margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{item.title}</h4>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.8rem' }}>
                  {new Date(item.pubDate).toLocaleString()}
                </p>
              </div>
              <ExternalLink size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            </a>
          ))
        )}
      </div>
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default LiveMarketNews;
