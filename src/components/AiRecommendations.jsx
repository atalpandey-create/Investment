import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Flame, Scale, Landmark, Coins, TrendingUp, Search, RefreshCw, Globe } from 'lucide-react';

const mockRecommendations = {
  stocks: [
    {
      name: "Tata Motors Ltd.",
      ticker: "TATAMOTORS",
      risk: "High Risk",
      cagr: "15% - 18%",
      thesis: "Market leader in the passenger EV segment with >70% market share. Expanding export capabilities and high operating leverage inside Jaguar Land Rover (JLR) division.",
      allocation: "Large Cap Equity",
      preset: { lumpsum: 10000, sip: 5000, rate: 16, years: 10 }
    },
    {
      name: "Larsen & Toubro Ltd.",
      ticker: "LT",
      risk: "Moderate Risk",
      cagr: "12% - 14%",
      thesis: "Prime beneficiary of India's capital expenditure boom. Massive order book value exceeding ₹4.5 Lakh Crores spanning green hydrogen, defense, and high-speed rail corridors.",
      allocation: "Infrastructure Equity",
      preset: { lumpsum: 25000, sip: 3000, rate: 13, years: 15 }
    },
    {
      name: "HDFC Bank Ltd.",
      ticker: "HDFCBANK",
      risk: "Low Risk",
      cagr: "13% - 15%",
      thesis: "India's largest private sector bank with unparalleled deposit franchise post-merger. Strong credit growth and improving net interest margins expected over the next 3-5 years.",
      allocation: "Large Cap Banking",
      preset: { lumpsum: 50000, sip: 10000, rate: 14, years: 12 }
    },
    {
      name: "Reliance Industries Ltd.",
      ticker: "RELIANCE",
      risk: "Moderate Risk",
      cagr: "14% - 16%",
      thesis: "Diversified conglomerate with massive moats in telecom (Jio) and retail. Upcoming value unlocking through potential spin-offs of retail and telecom units.",
      allocation: "Conglomerate Equity",
      preset: { lumpsum: 20000, sip: 5000, rate: 15, years: 15 }
    },
    {
      name: "Zomato Ltd.",
      ticker: "ZOMATO",
      risk: "Very High Risk",
      cagr: "20% - 25%",
      thesis: "Dominant player in the food delivery duopoly. Rapidly scaling its quick-commerce arm (Blinkit) which is showing explosive growth and path to profitability.",
      allocation: "New-Age Tech",
      preset: { lumpsum: 5000, sip: 2000, rate: 22, years: 7 }
    },
    {
      name: "ITC Ltd.",
      ticker: "ITC",
      risk: "Low Risk",
      cagr: "10% - 12%",
      thesis: "FMCG giant with high dividend yield (~3-4%). Strong cash generation from core cigarette business funding high-growth FMCG, hotels, and agribusiness divisions.",
      allocation: "Value / Dividend Yield",
      preset: { lumpsum: 100000, sip: 5000, rate: 11, years: 10 }
    }
  ],
  bonds: [
    {
      name: "NHAI Tax-Free Bonds",
      ticker: "NHAI-BOND",
      risk: "Low Risk",
      cagr: "7.1% - 7.4%",
      thesis: "Backed by the Government of India. Interest is fully tax-exempt under Section 10(15)(iv)(h), making it highly lucrative for individuals in the 30% tax bracket.",
      allocation: "Government Debt",
      preset: { lumpsum: 50000, sip: 0, rate: 7.2, years: 10 }
    },
    {
      name: "Power Finance Corp (PFC) NCDs",
      ticker: "PFC-NCD",
      risk: "Low Risk",
      cagr: "8.2% - 8.5%",
      thesis: "AAA-rated secured corporate debt. Regular monthly/annual interest payout options. Perfect for steady capital preservation.",
      allocation: "AAA Rated Public Sector Corporate Debt",
      preset: { lumpsum: 100000, sip: 0, rate: 8.3, years: 5 }
    },
    {
      name: "RBI Floating Rate Savings Bonds",
      ticker: "RBI-FRSB",
      risk: "Low Risk",
      cagr: "8.05% (Current)",
      thesis: "100% sovereign guarantee. Interest rate is pegged 0.35% above the prevailing National Savings Certificate (NSC) rate, protecting against inflation.",
      allocation: "Sovereign Floating Rate Debt",
      preset: { lumpsum: 200000, sip: 0, rate: 8.05, years: 7 }
    },
    {
      name: "Shriram Finance NCDs",
      ticker: "SHRIRAM-NCD",
      risk: "Moderate Risk",
      cagr: "8.8% - 9.2%",
      thesis: "High-yield corporate bond from a leading NBFC (AA+ rated). Ideal for investors seeking higher fixed income than FDs with marginally elevated risk.",
      allocation: "High-Yield Corporate Debt",
      preset: { lumpsum: 50000, sip: 0, rate: 9.0, years: 3 }
    },
    {
      name: "Sovereign Gold Bonds (SGB)",
      ticker: "SGB-GOVT",
      risk: "Low Risk",
      cagr: "8% - 10% (Gold + 2.5%)",
      thesis: "Captures capital appreciation of gold plus a fixed 2.5% annual interest. Capital gains are fully tax-exempt if held until maturity (8 years).",
      allocation: "Commodity Linked Sovereign Debt",
      lockIn: 8,
      preset: { lumpsum: 70000, sip: 0, rate: 9.5, years: 8 }
    }
  ],
  funds: [
    {
      name: "Parag Parikh Flexi Cap Fund",
      ticker: "PPFCF",
      risk: "High Risk",
      cagr: "14% - 16%",
      thesis: "Excellent track record of downside protection during market corrections. Diversifies across top domestic equities and select international tech giants.",
      allocation: "Equity - Flexi Cap Mutual Fund",
      preset: { lumpsum: 10000, sip: 5000, rate: 14.5, years: 12 }
    },
    {
      name: "ICICI Prudential Asset Allocator Fund",
      ticker: "ICICI-AAF",
      risk: "Moderate Risk",
      cagr: "11% - 13%",
      thesis: "A dynamic hybrid fund that rebalances equity and debt percentage based on absolute price-to-earnings valuations. Limits downside exposure automatically.",
      allocation: "Hybrid - Dynamic Rebalancing Fund",
      preset: { lumpsum: 20000, sip: 4000, rate: 11.8, years: 8 }
    },
    {
      name: "Quant Small Cap Fund",
      ticker: "QUANT-SMALL",
      risk: "Very High Risk",
      cagr: "18% - 22%",
      thesis: "Proprietary VLRT framework (Valuation, Liquidity, Risk, Timing). High churn rate but consistently delivers massive alpha in bull runs.",
      allocation: "Small Cap Equity Fund",
      preset: { lumpsum: 5000, sip: 3000, rate: 20, years: 10 }
    },
    {
      name: "Nippon India Multi Cap Fund",
      ticker: "NIPPON-MULTI",
      risk: "High Risk",
      cagr: "14% - 16%",
      thesis: "True-to-label multi-cap fund ensuring minimum 25% allocation each to large, mid, and small-cap segments. Broad-based market participation.",
      allocation: "Multi Cap Equity Fund",
      preset: { lumpsum: 15000, sip: 5000, rate: 15, years: 10 }
    },
    {
      name: "SBI Contra Fund",
      ticker: "SBI-CONTRA",
      risk: "High Risk",
      cagr: "15% - 17%",
      thesis: "Value-oriented approach picking out-of-favor themes and beaten-down stocks with strong fundamentals. Excellent for long-term contrarian plays.",
      allocation: "Contra Equity Fund",
      preset: { lumpsum: 20000, sip: 4000, rate: 16, years: 8 }
    }
  ],
  etfs: [
    {
      name: "HDFC Nifty 50 ETF",
      ticker: "NIFTY-ETF",
      risk: "Moderate Risk",
      cagr: "12% - 13%",
      thesis: "Low expense ratio (0.05%) tracking India's top 50 blue-chip giants. Mirroring India's macro GDP growth path.",
      allocation: "Index Tracking Equity ETF",
      preset: { lumpsum: 5000, sip: 2000, rate: 12.2, years: 15 }
    },
    {
      name: "CPSE ETF",
      ticker: "CPSE-ETF",
      risk: "High Risk",
      cagr: "14% - 17%",
      thesis: "Basket of public sector giants including ONGC, NTPC, and Coal India. High dividend yield (4-5%) coupled with attractive valuation multiples.",
      allocation: "Public Sector Undertaking ETF",
      preset: { lumpsum: 15000, sip: 3000, rate: 15.0, years: 10 }
    },
    {
      name: "Nippon India ETF Nifty Midcap 150",
      ticker: "MIDCAP-ETF",
      risk: "High Risk",
      cagr: "15% - 18%",
      thesis: "Captures the high-growth phase of emerging mid-sized Indian companies. Higher volatility but superior long-term compounding vs Large caps.",
      allocation: "Mid Cap Broad ETF",
      preset: { lumpsum: 10000, sip: 3000, rate: 16.5, years: 10 }
    },
    {
      name: "Motilal Oswal Nasdaq 100 ETF",
      ticker: "NASDAQ-ETF",
      risk: "High Risk",
      cagr: "14% - 18%",
      thesis: "Direct exposure to top 100 non-financial US tech giants (Apple, Microsoft, NVidia). Doubles as a currency hedge against INR depreciation.",
      allocation: "International Tech ETF",
      preset: { lumpsum: 25000, sip: 5000, rate: 15, years: 12 }
    },
    {
      name: "SBI ETF Gold",
      ticker: "GOLD-ETF",
      risk: "Low Risk",
      cagr: "7% - 9%",
      thesis: "Highly liquid instrument tracking domestic physical gold prices. Essential portfolio hedge during global geopolitical crises or severe market drawdowns.",
      allocation: "Commodity ETF",
      preset: { lumpsum: 10000, sip: 2000, rate: 8.5, years: 15 }
    }
  ],
  schemes: [
    {
      name: "Public Provident Fund (PPF)",
      ticker: "PPF",
      risk: "Low Risk",
      cagr: "7.1% (Sovereign Guaranteed)",
      thesis: "15-year contribution scheme with AAA tax status. Contributions qualify for Sec 80C deductions, and maturity returns are fully tax-free.",
      allocation: "Sovereign Savings Scheme",
      lockIn: 15,
      preset: { lumpsum: 0, sip: 12500, rate: 7.1, years: 15 }
    },
    {
      name: "National Pension System (NPS) - Tier I",
      ticker: "NPS",
      risk: "Moderate Risk",
      cagr: "9.5% - 11%",
      thesis: "Structured pension product with active equity allocation choices. Yields additional ₹50,000 tax deduction under Sec 80CCD(1B).",
      allocation: "Retirement Savings Trust",
      lockIn: 25,
      preset: { lumpsum: 10000, sip: 5000, rate: 10.2, years: 25 }
    },
    {
      name: "Sukanya Samriddhi Yojana (SSY)",
      ticker: "SSY",
      risk: "Low Risk",
      cagr: "8.2% (Sovereign Guaranteed)",
      thesis: "Highest interest rate among small savings schemes. Exclusively for girl child education/marriage. EEE tax benefit status.",
      allocation: "Child Education Sovereign Scheme",
      lockIn: 21,
      preset: { lumpsum: 0, sip: 12500, rate: 8.2, years: 21 }
    },
    {
      name: "Senior Citizen Savings Scheme (SCSS)",
      ticker: "SCSS",
      risk: "Low Risk",
      cagr: "8.2% (Sovereign Guaranteed)",
      thesis: "Quarterly interest payout designed for regular income post-retirement. Lock-in of 5 years with high sovereign-backed yields.",
      allocation: "Retirement Income Scheme",
      lockIn: 5,
      preset: { lumpsum: 1500000, sip: 0, rate: 8.2, years: 5 }
    },
    {
      name: "Post Office Monthly Income Scheme (POMIS)",
      ticker: "POMIS",
      risk: "Low Risk",
      cagr: "7.4% (Sovereign Guaranteed)",
      thesis: "A 5-year fixed income scheme guaranteeing steady monthly payouts. Ideal for risk-averse investors needing reliable cash flow.",
      allocation: "Fixed Income Sovereign Scheme",
      lockIn: 5,
      preset: { lumpsum: 900000, sip: 0, rate: 7.4, years: 5 }
    }
  ],
  sips: [
    {
      name: "Core Compounder SIP Plan",
      ticker: "SIP-CC",
      risk: "High Risk",
      cagr: "13% - 15%",
      thesis: "An optimal allocation model: 60% Large Cap Mutual Fund, 40% Mid Cap Fund. Formulates a strong compounding base over standard 10-year horizons.",
      allocation: "Diversified Equity SIP",
      preset: { lumpsum: 0, sip: 10000, rate: 13.8, years: 10 }
    },
    {
      name: "Aggressive Small-Cap Accelerator",
      ticker: "SIP-ASA",
      risk: "Very High Risk",
      cagr: "16% - 19%",
      thesis: "80% allocation to small-cap funds, 20% to thematic gold ETFs. Highly volatile but offers maximum compounding coefficient for investors aged <30.",
      allocation: "Volatile Aggressive Wealth Builder",
      preset: { lumpsum: 0, sip: 8000, rate: 17.5, years: 15 }
    },
    {
      name: "All-Weather Balanced SIP",
      ticker: "SIP-BAL",
      risk: "Moderate Risk",
      cagr: "11% - 13%",
      thesis: "50% Nifty 50 Index Fund, 30% Flexi-Cap Fund, 20% Debt/Arbitrage Fund. Provides stable compounding with significantly reduced downside variance.",
      allocation: "Conservative Hybrid SIP",
      preset: { lumpsum: 0, sip: 15000, rate: 12.0, years: 12 }
    },
    {
      name: "Thematic Innovation SIP",
      ticker: "SIP-THEME",
      risk: "Very High Risk",
      cagr: "17% - 21%",
      thesis: "Focused exposure: 40% Manufacturing/Defense theme, 40% Tech/Digital India, 20% Global Tech. Capitalizes on major decade-long macro tailwinds.",
      allocation: "Thematic Growth SIP",
      preset: { lumpsum: 0, sip: 5000, rate: 18.5, years: 8 }
    },
    {
      name: "Retirement Corpus Builder (Age 40+)",
      ticker: "SIP-RET",
      risk: "Moderate Risk",
      cagr: "12% - 14%",
      thesis: "Gradual glide-path strategy. 70% Equity (Large/Multi cap) and 30% Fixed Income. Focuses on capital appreciation while preserving capital near retirement.",
      allocation: "Goal-Based Retirement SIP",
      preset: { lumpsum: 50000, sip: 20000, rate: 13.0, years: 15 }
    }
  ]
};

const AiRecommendations = ({ onSelectPreset }) => {
  const [selectedSubTab, setSelectedSubTab] = useState('stocks');
  const [searchQuery, setSearchQuery] = useState('');
  const [externalResults, setExternalResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setExternalResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search-asset?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          
          const formatted = data.map(quote => {
            let risk = 'Moderate Risk';
            let cagr = '10% - 15%';
            let allocation = quote.type === 'ETF' ? 'Exchange Traded Fund' : (quote.type === 'MUTUALFUND' ? 'Mutual Fund' : 'Equity');
            let preset = { lumpsum: 10000, sip: 2000, rate: 12, years: 10 };

            if (quote.type === 'EQUITY') {
              risk = 'High Risk';
              cagr = '15% - 20%';
            } else if (quote.type === 'MUTUALFUND') {
              risk = 'Moderate Risk';
              cagr = '12% - 15%';
            }

            return {
              name: quote.name,
              ticker: quote.ticker,
              risk: risk,
              cagr: cagr,
              thesis: `AI analysis highlights ${quote.name} (${quote.ticker}) as a dynamically discovered asset on ${quote.exchange}. Quantitative signals suggest monitoring this asset for emerging trends.`,
              allocation: allocation,
              preset: preset,
              isExternal: true
            };
          });
          setExternalResults(formatted);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  let displayedRecommendations = [];
  if (searchQuery.trim().length > 0) {
    const lowerQuery = searchQuery.toLowerCase();
    Object.keys(mockRecommendations).forEach(category => {
      mockRecommendations[category].forEach(rec => {
        if (rec.name.toLowerCase().includes(lowerQuery) || rec.ticker.toLowerCase().includes(lowerQuery)) {
          displayedRecommendations.push(rec);
        }
      });
    });

    // Append external results that aren't already in local mock
    const localTickers = new Set(displayedRecommendations.map(r => r.ticker));
    externalResults.forEach(ext => {
      if (!localTickers.has(ext.ticker)) {
        displayedRecommendations.push(ext);
      }
    });

  } else {
    displayedRecommendations = mockRecommendations[selectedSubTab];
  }

  const getRiskIcon = (risk) => {
    if (risk.includes('Low')) return <ShieldCheck size={16} color="var(--success)" />;
    if (risk.includes('Moderate')) return <Scale size={16} color="#fb923c" />;
    return <Flame size={16} color="var(--danger)" />;
  };

  const getRiskColor = (risk) => {
    if (risk.includes('Low')) return 'var(--success)';
    if (risk.includes('Moderate')) return '#fb923c';
    return 'var(--danger)';
  };

  const getIcon = (tab) => {
    switch (tab) {
      case 'stocks': return <TrendingUp size={14} />;
      case 'bonds': return <Landmark size={14} />;
      case 'funds': return <Coins size={14} />;
      case 'etfs': return <Sparkles size={14} />;
      case 'schemes': return <ShieldCheck size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <div className="wealth-card animate-fade-in" style={{ padding: '2.25rem' }}>
      
      {/* Tab bar header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '2rem' }}>
        <div>
          <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles color="var(--primary)" className="float-3d" />
            AI Asset Recommendations
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.82rem', marginTop: '0.25rem', fontWeight: 600 }}>
            Curated list of AI-powered opportunities based on quantitative performance metrics.
          </p>
        </div>

        {/* Controls Container */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', width: '100%', maxWidth: '450px' }}>
          
          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Search stocks, funds, bonds, ETFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.2rem',
                borderRadius: '100px',
                border: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(255,255,255,0.8)',
                fontSize: '0.85rem',
                color: 'var(--text-main)',
                outline: 'none',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Sub Navigation controls */}
          <div style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'rgba(0,0,0,0.03)',
            padding: '0.3rem',
            borderRadius: '100px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end'
          }}>
          {Object.keys(mockRecommendations).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedSubTab(tab)}
              style={{
                background: selectedSubTab === tab ? '#ffffff' : 'transparent',
                color: selectedSubTab === tab ? 'var(--text-main)' : 'var(--text-light)',
                border: 'none',
                padding: '0.45rem 1rem',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                boxShadow: selectedSubTab === tab ? '0 2px 6px rgba(0,0,0,0.04)' : 'none'
              }}
            >
              {getIcon(tab)}
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Recommendations Cards listing */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {isSearching && displayedRecommendations.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <RefreshCw size={24} className="spin" style={{ margin: '0 auto 1rem', display: 'block', color: 'var(--primary)' }} />
            Searching global markets for "{searchQuery}"...
          </div>
        ) : displayedRecommendations.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No recommendations found matching "{searchQuery}"
          </div>
        ) : displayedRecommendations.map((rec, index) => (
          <div
            key={index}
            style={{
              border: '1px solid rgba(0,0,0,0.06)',
              borderRadius: '20px',
              padding: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.4)',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  color: 'var(--text-light)',
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  {rec.isExternal && <Globe size={12} color="var(--primary)" />}
                  {rec.allocation}
                </span>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  color: getRiskColor(rec.risk),
                  background: `${getRiskColor(rec.risk)}08`,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '100px'
                }}>
                  {getRiskIcon(rec.risk)}
                  {rec.risk}
                </div>
              </div>

              <h4 style={{ color: 'var(--text-main)', fontSize: '1.15rem', marginBottom: '0.5rem', fontWeight: 800 }}>
                {rec.name}
              </h4>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600 }}>Expected Yield:</span>
                <span style={{ fontSize: '0.92rem', color: 'var(--success)', fontWeight: 800 }}>{rec.cagr} CAGR</span>
              </div>

              <div style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.04)',
                borderRadius: '12px',
                padding: '1rem',
                fontSize: '0.85rem',
                lineHeight: 1.5,
                color: 'var(--text-muted)',
                marginBottom: '1.5rem',
                fontWeight: 500
              }}>
                <strong>AI Thesis:</strong> {rec.thesis}
              </div>
            </div>

            <button
              onClick={() => onSelectPreset(rec)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                width: '100%',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(37,99,235,0.1)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--primary-hover)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37,99,235,0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.1)';
              }}
            >
              Simulate in Calculator
              <ArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AiRecommendations;
