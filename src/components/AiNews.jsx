import React, { useState } from 'react';
import { Newspaper, ExternalLink, ShieldCheck, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

const mockArticles = [
  {
    id: 1,
    category: 'rbi-sebi',
    title: "RBI keeps repo rate unchanged at 6.5% for the 8th consecutive meeting",
    source: "RBI Bulletin",
    date: "1 hour ago",
    impact: "Neutral-to-Bullish",
    summary: "The Reserve Bank of India decided to maintain the benchmark repo rate at 6.50% to sustain inflation alignment while keeping GDP growth targets solid.",
    aiTakeaways: [
      "Fixed Deposit rates are expected to peak and remain stable for another 2-3 months. Great time to lock in long-term FDs.",
      "Home and car loan EMIs will not increase, keeping consumer consumption positive in real estate and automotive sectors.",
      "Equity market indexes like Nifty Bank reacted positively, closing 0.8% higher."
    ]
  },
  {
    id: 2,
    category: 'ipos',
    title: "Hyundai India IPO opens for bidding; target valuation set at $19 Billion",
    source: "SEBI Filings",
    date: "3 hours ago",
    impact: "High Interest",
    summary: "Hyundai Motor India receives final SEBI clearance to launch India's biggest ever IPO, aiming to raise over ₹25,000 Crores through an Offer for Sale.",
    aiTakeaways: [
      "Expected listing premium is moderate (10-15%) due to large issue size, which might limit short-term listing gains.",
      "Long-term fundamentals are strong, driven by Hyundai's robust SUV portfolio and high EBITDA margins.",
      "Retail investor quota is 35%. Application size of 1 lot (₹15,000) is highly recommended for diversification."
    ]
  },
  {
    id: 3,
    category: 'earnings',
    title: "TCS Q1 Results: Net Profit rises 8.7% YoY; announces ₹28 special dividend",
    source: "Company Filing",
    date: "5 hours ago",
    impact: "Bullish",
    summary: "Tata Consultancy Services reported robust earnings, beating street expectations on banking client spending rebound in North America.",
    aiTakeaways: [
      "Vibrant performance suggests IT services contraction cycle is ending; positive sign for all major IT stocks.",
      "The ₹28/share dividend record date is scheduled for next Friday. Buy before that to eligibility.",
      "Operating margins improved to 26.2% due to strict cost optimization."
    ]
  },
  {
    id: 4,
    category: 'global',
    title: "US Fed hints at potential rate cuts in September as inflation cools down to 2.9%",
    source: "Federal Reserve",
    date: "Yesterday",
    impact: "Bullish",
    summary: "Federal Reserve Chairman indicated that if inflation metrics continue their downward trend, rate easing cycles will commence in Q3.",
    aiTakeaways: [
      "Likely to trigger heavy foreign institutional (FII) inflows into emerging markets like India.",
      "Cryptocurrencies (Bitcoin & Ethereum) surged 4% on rate easing hopes.",
      "USD/INR exchange rate might slip below 83.20, strengthening the Indian Rupee."
    ]
  },
  {
    id: 5,
    category: 'rbi-sebi',
    title: "SEBI introduces stricter guidelines for Futures & Options (F&O) retail trading",
    source: "SEBI Circular",
    date: "2 days ago",
    impact: "Negative (Short-term)",
    summary: "Capital markets regulator SEBI has proposed increasing lot sizes and mandatory upfront premium margins to safeguard retail retail traders.",
    aiTakeaways: [
      "Aims to curb extreme speculation where 9 out of 10 retail traders lose capital in derivatives.",
      "Brokerage revenues (e.g. Zerodha, AngelOne) might drop 15-20% due to volume declines.",
      "Promotes redirection of retail capital from risky intraday trading into systematic mutual funds."
    ]
  },
  {
    id: 6,
    category: 'earnings',
    title: "Reliance Industries EBITDA rises 12% driven by Retail and Jio tariff hikes",
    source: "RIL Investor Desk",
    date: "3 days ago",
    impact: "Bullish",
    summary: "Reliance Industries posted strong operational metrics. Mobile tariffs were hiked by 15-20%, improving telecom ARPU.",
    aiTakeaways: [
      "Jio's Average Revenue Per User (ARPU) is projected to climb past ₹200, boosting future free cash flows.",
      "Retail arm footprint expanded by adding 300 new stores, consolidating market dominance.",
      "Conglomerate net debt decreased by ₹12,000 crores, reducing interest expense."
    ]
  }
];

const AiNews = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedArticle, setExpandedArticle] = useState(null);

  const filteredArticles = selectedCategory === 'all'
    ? mockArticles
    : mockArticles.filter(art => art.category === selectedCategory);

  const getImpactColor = (imp) => {
    if (imp.includes('Bullish')) return 'var(--success)';
    if (imp.includes('Negative')) return 'var(--danger)';
    return 'var(--primary)';
  };

  return (
    <div className="wealth-card animate-fade-in" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Newspaper color="var(--primary)" />
          AI Financial News Center
        </h3>
        
        {/* News Navigation Filter Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.2rem',
          background: '#f1f5f9',
          padding: '0.25rem',
          borderRadius: '100px'
        }}>
          {['all', 'rbi-sebi', 'ipos', 'earnings', 'global'].map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setExpandedArticle(null);
              }}
              style={{
                background: selectedCategory === cat ? 'var(--bg-primary)' : 'transparent',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                letterSpacing: '0.02em'
              }}
            >
              {cat === 'all' ? 'All' : cat === 'rbi-sebi' ? 'RBI & SEBI' : cat === 'ipos' ? 'IPOs' : cat === 'earnings' ? 'Earnings' : 'Global'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredArticles.map(article => {
          const isExpanded = expandedArticle === article.id;
          return (
            <div 
              key={article.id} 
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border-light)',
                borderRadius: '16px',
                padding: '1.25rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setExpandedArticle(isExpanded ? null : article.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 700, 
                    color: 'var(--primary)', 
                    background: 'rgba(37,99,235,0.06)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {article.source}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{article.date}</span>
                </div>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  padding: '0.2rem 0.5rem', 
                  borderRadius: '100px',
                  color: getImpactColor(article.impact),
                  background: `${getImpactColor(article.impact)}10`
                }}>
                  Impact: {article.impact}
                </span>
              </div>

              <h4 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontWeight: 700, lineHeight: 1.4 }}>
                {article.title}
              </h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, margin: 0 }}>
                {article.summary}
              </p>

              {/* AI Insight Box expander */}
              <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} color="var(--primary)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
                  {isExpanded ? 'Hide AI Pulse Takeaway' : 'Show AI Pulse Takeaway (3 insights)'}
                </span>
              </div>

              {isExpanded && (
                <div 
                  style={{
                    marginTop: '1rem',
                    background: 'rgba(37, 99, 235, 0.03)',
                    borderLeft: '3px solid var(--primary)',
                    borderRadius: '8px',
                    padding: '1rem',
                    animation: 'fadeIn 0.3s ease'
                  }}
                  onClick={(e) => e.stopPropagation()} // Don't collapse card on inner clicks
                >
                  <h5 style={{ color: 'var(--text-main)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Sparkles size={14} color="var(--primary)" />
                    Prefin Thesis:
                  </h5>
                  <ul style={{ paddingLeft: '1.1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {article.aiTakeaways.map((take, idx) => (
                      <li key={idx} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                        {take}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AiNews;
