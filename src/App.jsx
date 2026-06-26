import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import WealthCalculator from './components/WealthCalculator';
import AiNews from './components/AiNews';
import AiRecommendations from './components/AiRecommendations';
import Portfolio from './components/Portfolio';
import Alerts from './components/Alerts';
import Chatbot from './components/Chatbot';
import PortfolioDoctor from './components/PortfolioDoctor';
import AuthGate from './components/AuthGate';
import { Bell } from 'lucide-react';

export const stockMetadataMap = {
  'TRENT': { name: 'Trent Limited', sector: 'Retail' },
  'BAJAJFINSV': { name: 'Bajaj Finserv', sector: 'Finance' },
  'SBIN': { name: 'State Bank of India', sector: 'Banking' },
  'TATASTEEL': { name: 'Tata Steel', sector: 'Metals' },
  'HDFCBANK': { name: 'HDFC Bank', sector: 'Banking' },
  'TATAMOTORS': { name: 'Tata Motors', sector: 'Automobile' },
  'LT': { name: 'Larsen & Toubro', sector: 'Infrastructure' },
  'AXISBANK': { name: 'Axis Bank', sector: 'Banking' },
  'BHARTIARTL': { name: 'Bharti Airtel', sector: 'Telecom' },
  'NTPC': { name: 'NTPC Limited', sector: 'Power' },
  'RELIANCE': { name: 'Reliance Industries', sector: 'Conglomerate' },
  'TCS': { name: 'Tata Consultancy Services', sector: 'IT Services' },
  'INFY': { name: 'Infosys', sector: 'IT Services' },
  'ICICIBANK': { name: 'ICICI Bank', sector: 'Banking' },
  'M&M': { name: 'Mahindra & Mahindra', sector: 'Automobile' },
  'BDL': { name: 'Bharat Dynamics', sector: 'Defense' },
  'GVT&D': { name: 'GE Vernova T&D India', sector: 'Power' },
  'AUROPHARMA': { name: 'Aurobindo Pharma', sector: 'Pharmaceuticals' },
  'LAURUSLABS': { name: 'Laurus Labs', sector: 'Pharmaceuticals' },
  'OFSS': { name: 'Oracle Financial Services', sector: 'IT Services' },
  'ITC': { name: 'ITC Limited', sector: 'Consumer Goods' },
  'HINDUNILVR': { name: 'Hindustan Unilever', sector: 'Consumer Goods' },
  'COALINDIA': { name: 'Coal India', sector: 'Energy' },
  'POWERGRID': { name: 'Power Grid Corporation', sector: 'Power' },
  'SUNPHARMA': { name: 'Sun Pharmaceutical', sector: 'Pharmaceuticals' },
  'ADANIENT': { name: 'Adani Enterprises', sector: 'Conglomerate' },
  'ADANIPORTS': { name: 'Adani Ports & SEZ', sector: 'Infrastructure' },
  'KOTAKBANK': { name: 'Kotak Mahindra Bank', sector: 'Banking' },
  'ULTRACEMCO': { name: 'UltraTech Cement', sector: 'Materials' },
  'GRASIM': { name: 'Grasim Industries', sector: 'Materials' },
  'JSWSTEEL': { name: 'JSW Steel', sector: 'Metals' },
  'HINDALCO': { name: 'Hindalco Industries', sector: 'Metals' },
  'ONGC': { name: 'Oil & Natural Gas Corp', sector: 'Energy' },
  'BPCL': { name: 'Bharat Petroleum', sector: 'Energy' },
  'MARUTI': { name: 'Maruti Suzuki India', sector: 'Automobile' },
  'HEROMOTOCO': { name: 'Hero MotoCorp', sector: 'Automobile' },
  'EICHERMOT': { name: 'Eicher Motors', sector: 'Automobile' },
  'CIPLA': { name: 'Cipla Limited', sector: 'Pharmaceuticals' },
  'DRREDDY': { name: 'Dr. Reddy\'s Labs', sector: 'Pharmaceuticals' },
  'APOLLOHOSP': { name: 'Apollo Hospitals', sector: 'Healthcare' },
  'DIVISLAB': { name: 'Divi\'s Laboratories', sector: 'Pharmaceuticals' },
  'WIPRO': { name: 'Wipro Limited', sector: 'IT Services' },
  'TECHM': { name: 'Tech Mahindra', sector: 'IT Services' },
  'HCLTECH': { name: 'HCL Technologies', sector: 'IT Services' },
  'LTIM': { name: 'LTIMindtree', sector: 'IT Services' },
  'TITAN': { name: 'Titan Company', sector: 'Consumer Goods' },
  'ASIANPAINT': { name: 'Asian Paints', sector: 'Consumer Goods' },
  'BRITANNIA': { name: 'Britannia Industries', sector: 'Consumer Goods' },
  'NESTLEIND': { name: 'Nestle India', sector: 'Consumer Goods' },
  'INDUSINDBK': { name: 'IndusInd Bank', sector: 'Banking' },
  'BAJAJ-AUTO': { name: 'Bajaj Auto', sector: 'Automobile' },
  'SHRIRAMFIN': { name: 'Shriram Finance', sector: 'Finance' },
  'JIOFIN': { name: 'Jio Financial Services', sector: 'Finance' }
};

export const mutualFundMetadataMap = {
  'HDFCEQG': { name: 'HDFC Equity Growth Fund', sector: 'Large Cap', nav: 845.20 },
  'SBIBLUECHIP': { name: 'SBI Blue Chip Fund', sector: 'Large Cap', nav: 72.35 },
  'AXISMIDCAP': { name: 'Axis Midcap Fund', sector: 'Mid Cap', nav: 98.40 },
  'ABORSMALLCAP': { name: 'Aditya Birla SL Small Cap Fund', sector: 'Small Cap', nav: 65.12 },
  'ICICIPRU50': { name: 'ICICI Pru Nifty 50 Index Fund', sector: 'Index Fund', nav: 215.80 },
  'MOTILALOSMIDCAP': { name: 'Motilal Oswal Midcap Fund', sector: 'Mid Cap', nav: 82.15 },
  'PPFAS': { name: 'Parag Parikh Flexi Cap Fund', sector: 'Flexi Cap', nav: 68.50 },
  'NIPPONINDIA': { name: 'Nippon India Small Cap Fund', sector: 'Small Cap', nav: 145.75 },
  'MIRAELARGEMOD': { name: 'Mirae Asset Large Cap Fund', sector: 'Large Cap', nav: 102.30 },
  'KOTAKELSS': { name: 'Kotak ELSS Tax Saver Fund', sector: 'ELSS', nav: 92.60 },
  'HDFCMIDCAP': { name: 'HDFC Mid-Cap Opportunities Fund', sector: 'Mid Cap', nav: 155.40 },
  'TATADIGI': { name: 'Tata Digital India Fund', sector: 'Sectoral', nav: 42.80 },
  'SBIFOCUSED': { name: 'SBI Focused Equity Fund', sector: 'Focused', nav: 268.45 },
  'DSPSMALL': { name: 'DSP Small Cap Fund', sector: 'Small Cap', nav: 148.25 },
  'AXISLONG': { name: 'Axis Long Term Equity Fund', sector: 'ELSS', nav: 78.92 },
  'UTIFLEXI': { name: 'UTI Flexi Cap Fund', sector: 'Flexi Cap', nav: 310.55 },
  'QNIFTY': { name: 'Quant Active Fund', sector: 'Multi Cap', nav: 520.70 },
  'HDFCBAL': { name: 'HDFC Balanced Advantage Fund', sector: 'Hybrid', nav: 388.10 },
  'ABORLIQUID': { name: 'Aditya Birla SL Liquid Fund', sector: 'Liquid', nav: 395.20 },
  'ICICITECH': { name: 'ICICI Pru Technology Fund', sector: 'Sectoral', nav: 175.60 }
};

export const commodityMetadataMap = {
  'GOLD': { name: 'Gold (24K)', sector: 'Precious Metals', unit: '₹/gram', livePrice: 7285.00 },
  'SILVER': { name: 'Silver', sector: 'Precious Metals', unit: '₹/gram', livePrice: 93.50 },
  'CRUDEOIL': { name: 'Crude Oil (WTI)', sector: 'Energy', unit: '₹/barrel', livePrice: 6420.00 },
  'NATURALGAS': { name: 'Natural Gas', sector: 'Energy', unit: '₹/mmBtu', livePrice: 195.80 },
  'COPPER': { name: 'Copper', sector: 'Base Metals', unit: '₹/kg', livePrice: 820.50 },
  'ALUMINIUM': { name: 'Aluminium', sector: 'Base Metals', unit: '₹/kg', livePrice: 218.60 },
  'ZINC': { name: 'Zinc', sector: 'Base Metals', unit: '₹/kg', livePrice: 252.30 },
  'NICKEL': { name: 'Nickel', sector: 'Base Metals', unit: '₹/kg', livePrice: 1540.00 },
  'COTTON': { name: 'Cotton', sector: 'Agriculture', unit: '₹/bale', livePrice: 56200.00 },
  'SOYBEAN': { name: 'Soybean', sector: 'Agriculture', unit: '₹/quintal', livePrice: 4850.00 },
  'WHEAT': { name: 'Wheat', sector: 'Agriculture', unit: '₹/quintal', livePrice: 2520.00 },
  'PLATINUM': { name: 'Platinum', sector: 'Precious Metals', unit: '₹/gram', livePrice: 2950.00 },
  'PALLADIUM': { name: 'Palladium', sector: 'Precious Metals', unit: '₹/gram', livePrice: 2780.00 },
  'LEAD': { name: 'Lead', sector: 'Base Metals', unit: '₹/kg', livePrice: 182.40 },
  'MENTHAOIL': { name: 'Mentha Oil', sector: 'Agriculture', unit: '₹/kg', livePrice: 960.00 }
};

export const cryptoMetadataMap = {
  'BTC': { name: 'Bitcoin', sector: 'Crypto', livePrice: 5825000 },
  'ETH': { name: 'Ethereum', sector: 'Crypto', livePrice: 315000 },
  'BNB': { name: 'Binance Coin', sector: 'Crypto', livePrice: 52800 },
  'SOL': { name: 'Solana', sector: 'Crypto', livePrice: 14500 },
  'XRP': { name: 'Ripple (XRP)', sector: 'Crypto', livePrice: 192 },
  'ADA': { name: 'Cardano', sector: 'Crypto', livePrice: 62.50 },
  'DOGE': { name: 'Dogecoin', sector: 'Crypto', livePrice: 25.40 },
  'AVAX': { name: 'Avalanche', sector: 'Crypto', livePrice: 3580 },
  'DOT': { name: 'Polkadot', sector: 'Crypto', livePrice: 680 },
  'MATIC': { name: 'Polygon (MATIC)', sector: 'Crypto', livePrice: 85.20 },
  'LINK': { name: 'Chainlink', sector: 'Crypto', livePrice: 1850 },
  'SHIB': { name: 'Shiba Inu', sector: 'Crypto', livePrice: 0.0018 }
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(() => {
    try {
      const cachedSession = localStorage.getItem('Prefin_user_session');
      return cachedSession ? JSON.parse(cachedSession) : null;
    } catch (e) {
      console.error('Failed to load user session:', e);
      return null;
    }
  });

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('Prefin_user_session');
    setToastAlert({ title: "Logged Out", message: "You have been successfully logged out from Prefin." });
  };

  const [inputs, setInputs] = useState({
    lumpsumAmount: 10000,
    sipAmount: 5000,
    stepUpRate: 10,
    sipRate: 12,
    fdAmount: 2000,
    fdRate: 7.5,
    years: 10,
    lots: 0,
    assetContext: null
  });

  // Load cache immediately
  const getCachedData = () => {
    try {
      const cached = localStorage.getItem('Prefin_market_summary_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Failed to load cached market data:', e);
    }
    return null;
  };

  const cached = getCachedData();

  const [marketData, setMarketData] = useState(() => {
    return cached?.indices || {
      'NIFTY 50': { price: null, change: null, base: null, isNse: true },
      'NIFTY NEXT 50': { price: null, change: null, base: null, isNse: true },
      'NIFTY BANK': { price: null, change: null, base: null, isNse: true },
      'NIFTY FINANCIAL SERVICES': { price: null, change: null, base: null, isNse: true },
      'NIFTY MIDCAP': { price: null, change: null, base: null, isNse: true },
      'NIFTY SMALLCAP': { price: null, change: null, base: null, isNse: true },
      'SENSEX': { price: null, change: null, base: null, isNse: false },
      'GOLD': { price: null, change: null, base: null, isNse: false },
      'SILVER': { price: null, change: null, base: null, isNse: false },
      'USD/INR': { price: null, change: null, base: null, isNse: false }
    };
  });

  const [topGainers, setTopGainers] = useState(() => {
    return cached?.gainers || [];
  });

  const [tickerOffsets, setTickerOffsets] = useState({});
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState(() => {
    return cached?.savedAt ? new Date(cached.savedAt) : null;
  });

  const [feedStatus, setFeedStatus] = useState('connecting'); // 'connecting', 'connected', 'updating', 'delayed', 'unavailable'
  const [isCachedData, setIsCachedData] = useState(() => {
    return cached ? true : false;
  });
  const [apiHealth, setApiHealth] = useState({ responseTime: null, failedRequests: 0, freshness: cached?.timestamp || null });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'Price Alert', asset: 'NIFTY 50', condition: 'Above', threshold: 24200, active: true },
    { id: 2, type: 'Dividend Alert', asset: 'TCS', condition: 'Dividend Declared', threshold: 28, active: true },
    { id: 3, type: 'IPO Alert', asset: 'Hyundai India', condition: 'Allotment Date', threshold: 0, active: true }
  ]);
  const [toastAlert, setToastAlert] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectPreset = (rec) => {
    const isLotBased = [
      'TATAMOTORS', 'LT', 'HDFCBANK', 'RELIANCE', 'ZOMATO', 'ITC',
      'NHAI-BOND', 'PFC-NCD', 'RBI-FRSB', 'SHRIRAM-NCD', 'SGB-GOVT',
      'NIFTY-ETF', 'CPSE-ETF', 'MIDCAP-ETF', 'NASDAQ-ETF', 'GOLD-ETF'
    ].includes(rec.ticker);

    let price = 0;
    if (marketData && marketData[rec.ticker] && marketData[rec.ticker].price) {
      price = marketData[rec.ticker].price;
    } else {
      const mockPrices = {
        'TATAMOTORS': 980, 'LT': 3450, 'HDFCBANK': 1650, 'RELIANCE': 2950, 'ZOMATO': 195, 'ITC': 430,
        'NHAI-BOND': 1000, 'PFC-NCD': 1000, 'RBI-FRSB': 1000, 'SHRIRAM-NCD': 1000, 'SGB-GOVT': 7200,
        'NIFTY-ETF': 245, 'CPSE-ETF': 85, 'MIDCAP-ETF': 120, 'NASDAQ-ETF': 140, 'GOLD-ETF': 62
      };
      price = mockPrices[rec.ticker] || 0;
    }

    let initialLots = 0;
    let initialLumpsum = rec.preset.lumpsum;
    let initialSip = rec.preset.sip;

    if (isLotBased && price > 0) {
       initialLots = Math.floor(rec.preset.lumpsum / price);
       if (initialLots === 0 && rec.preset.lumpsum > 0) initialLots = 1;
       initialLumpsum = initialLots * price;
       initialSip = 0;
    }

    setInputs({
      ...inputs,
      lumpsumAmount: initialLumpsum,
      sipAmount: initialSip,
      stepUpRate: isLotBased ? 0 : 10,
      sipRate: rec.preset.rate,
      fdAmount: 0,
      fdRate: 7.5,
      years: rec.preset.years,
      lots: initialLots,
      assetContext: {
        name: rec.name,
        ticker: rec.ticker,
        type: rec.allocation,
        lockIn: rec.lockIn || 0
      }
    });
    setActiveTab('calculator');
  };

  const handleSimulateAsset = (name, price) => {
    let rate = 12;
    if (name.includes('Gold') || name.includes('Silver')) rate = 8.5;
    
    setInputs(prev => ({
      ...prev,
      lumpsumAmount: Math.round(price),
      sipRate: rate
    }));
    setActiveTab('calculator');
  };

  const alertsRef = React.useRef(alerts);
  useEffect(() => {
    alertsRef.current = alerts;
  }, [alerts]);

  const isFetchingRef = React.useRef(false);
  const retryTimeoutRef = React.useRef(null);
  const feedStatusRef = React.useRef(feedStatus);

  useEffect(() => {
    feedStatusRef.current = feedStatus;
  }, [feedStatus]);

  const fetchMarketData = async (isBackground = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (isBackground) {
      setFeedStatus('updating');
    } else {
      setFeedStatus('connecting');
      setMarketLoading(true);
    }

    // Limit skeleton loaders to max 2 seconds
    let skeletonTimer = null;
    if (!isBackground) {
      skeletonTimer = setTimeout(() => {
        setMarketLoading(false);
      }, 2000);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const startTime = Date.now();
      const res = await fetch('/api/market-summary', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (skeletonTimer) clearTimeout(skeletonTimer);

      if (!res.ok) {
        throw new Error(`API returned status ${res.status}`);
      }

      const data = await res.json();
      
      // Validation Layer
      if (!data || !data.indices || !data.gainers) {
        throw new Error('Invalid market summary data structure');
      }

      const nifty = data.indices['NIFTY 50'];
      if (!nifty || nifty.price == null || nifty.price <= 0) {
        throw new Error('NIFTY 50 validation failed');
      }

      setMarketData(data.indices);
      setTopGainers(data.gainers);
      setLastUpdatedTime(new Date());
      setIsCachedData(false);
      setFeedStatus('connected');
      setMarketLoading(false);
      setMarketError(false);

      setApiHealth({
        responseTime: Date.now() - startTime,
        failedRequests: 0,
        freshness: data.timestamp
      });

      localStorage.setItem('Prefin_market_summary_cache', JSON.stringify({
        indices: data.indices,
        gainers: data.gainers,
        timestamp: data.timestamp,
        savedAt: new Date().toISOString()
      }));

      // Evaluate active price alerts
      alertsRef.current.forEach(alert => {
        if (alert.active && alert.type === 'Price Alert') {
          const assetData = data.indices[alert.asset];
          if (assetData && assetData.price != null) {
            let triggered = false;
            if (alert.condition === 'Above' && assetData.price >= alert.threshold) {
              triggered = true;
            } else if (alert.condition === 'Below' && assetData.price <= alert.threshold) {
              triggered = true;
            }

            if (triggered) {
              setToastAlert({
                title: `Smart Alert Triggered!`,
                message: `${alert.asset} has gone ${alert.condition.toLowerCase()} ${alert.threshold.toLocaleString()}. Current Price: ₹${assetData.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              });
              setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, active: false } : a));
            }
          }
        }
      });

    } catch (err) {
      clearTimeout(timeoutId);
      if (skeletonTimer) clearTimeout(skeletonTimer);
      console.error('Market summary fetch failed:', err);
      
      setApiHealth(prev => {
        const nextFailed = prev.failedRequests + 1;
        
        // If consecutive failures exceed 3, completely mark unavailable
        if (nextFailed >= 3) {
          setFeedStatus('unavailable');
          setMarketError(true);
        } else {
          setFeedStatus('delayed');
        }
        
        return {
          ...prev,
          failedRequests: nextFailed
        };
      });

      // Caching Fallback: Load latest successful market response
      const cachedData = getCachedData();
      if (cachedData) {
        setMarketData(cachedData.indices);
        setTopGainers(cachedData.gainers);
        setIsCachedData(true);
      }

      setMarketLoading(false);

      // Auto Retry in background after 3 seconds
      retryTimeoutRef.current = setTimeout(() => {
        fetchMarketData(true);
      }, 3000);
    } finally {
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchMarketData();

    const timer = setInterval(() => {
      // Check if market is open (9:15 AM to 3:30 PM weekdays)
      const now = new Date();
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istTime = new Date(istString);
      const day = istTime.getDay();
      const hour = istTime.getHours();
      const minute = istTime.getMinutes();
      const timeInMinutes = hour * 60 + minute;
      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && (timeInMinutes >= (9 * 60 + 15) && timeInMinutes < (15 * 60 + 30));

      if (isOpen || feedStatusRef.current === 'delayed' || feedStatusRef.current === 'unavailable') {
        fetchMarketData(true);
      }
    }, 30000);

    return () => {
      clearInterval(timer);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <Dashboard 
              marketData={marketData} 
              tickerOffsets={tickerOffsets} 
              onSimulateAsset={handleSimulateAsset} 
              setActiveTab={setActiveTab}
              topGainers={topGainers}
              marketLoading={marketLoading}
              marketError={marketError}
              lastUpdatedTime={lastUpdatedTime}
              feedStatus={feedStatus}
              isCachedData={isCachedData}
              apiHealth={apiHealth}
            />
          </>
        );
      case 'recommendations':
        return <AiRecommendations onSelectPreset={handleSelectPreset} />;
      case 'calculator':
        return <WealthCalculator inputs={inputs} onInputChange={handleInputChange} marketData={marketData} />;
      case 'portfolio':
        return user ? (
          <Portfolio marketData={marketData} />
        ) : (
          <AuthGate onLoginSuccess={(userData) => { setUser(userData); localStorage.setItem('Prefin_user_session', JSON.stringify(userData)); setToastAlert({ title: "Welcome to Prefin", message: `Signed in as ${userData.name}. Portfolio Console is now active.` }); }} />
        );
      case 'alerts':
        return <Alerts marketData={marketData} alerts={alerts} setAlerts={setAlerts} />;
      case 'doctor':
        return user ? (
          <PortfolioDoctor marketData={marketData} />
        ) : (
          <AuthGate onLoginSuccess={(userData) => { setUser(userData); localStorage.setItem('Prefin_user_session', JSON.stringify(userData)); setToastAlert({ title: "Welcome to Prefin", message: `Signed in as ${userData.name}. AI Portfolio Doctor is now active.` }); }} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} marketData={marketData} tickerOffsets={tickerOffsets} topGainers={topGainers} marketError={marketError} marketLoading={marketLoading} feedStatus={feedStatus} isCachedData={isCachedData} user={user} onLogout={handleLogout} />
      
      <main style={{ minHeight: '60vh', position: 'relative', zIndex: 10 }}>
        {renderTabContent()}
      </main>

      <Footer setActiveTab={setActiveTab} />
      
      {/* Advisor Chatbot Panel */}
      <Chatbot marketData={marketData} topGainers={topGainers} setActiveTab={setActiveTab} user={user} />

      {/* Floating Smart Toast Alerts */}
      {toastAlert && (
        <div className="alert-toast">
          <div style={{ background: 'var(--primary-glow)', padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}>
            <Bell size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>{toastAlert.title}</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{toastAlert.message}</p>
          </div>
          <button 
            onClick={() => setToastAlert(null)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}

export default App;
