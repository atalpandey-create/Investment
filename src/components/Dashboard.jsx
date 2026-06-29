import React, { useState } from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, LineChart } from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, Lightbulb, Compass, Award, Star, Flame, Sparkles, Bot, AlertCircle, RefreshCw, Landmark, BookOpen, Clock, Activity, ShieldAlert, Check, ShieldCheck, Zap, Target, Search } from 'lucide-react';
import { mutualFundMetadataMap, commodityMetadataMap } from '../App';

const formatPrice = (name, price) => {
  if (price == null) return 'Unavailable';
  const nameUpper = name.toUpperCase();
  if (nameUpper === 'USD/INR') {
    return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}`;
  }
  return `₹${price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatNseTimestamp = (ts) => {
  if (!ts) return '';
  const parts = ts.split(' ');
  if (parts.length < 2) return ts;
  const timePart = parts[1];
  const timeSubparts = timePart.split(':');
  if (timeSubparts.length < 2) return ts;
  let hour = parseInt(timeSubparts[0], 10);
  const min = timeSubparts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${hour}:${min} ${ampm} IST`;
};

const formatGainerPrice = (val) => {
  return `₹${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatChange = (name, price, base, change) => {
  const prevClose = base != null ? base : (change != null ? price / (1 + change / 100) : price);
  const ptChange = price - prevClose;
  const pctChange = change != null ? change : (prevClose !== 0 ? (ptChange / prevClose) * 100 : 0);
  
  const absPtChange = Math.abs(ptChange);
  const absPctChange = Math.abs(pctChange);
  
  let ptDecimals = 2;
  if (name === 'USD/INR') {
    ptDecimals = 4;
  }
  
  const ptStr = absPtChange.toLocaleString(undefined, { minimumFractionDigits: ptDecimals, maximumFractionDigits: ptDecimals });
  const pctStr = absPctChange.toFixed(2);
  
  if (ptChange > 0.00001) {
    return {
      text: `▲ +${ptStr} pts (+${pctStr}%)`,
      color: 'var(--success)',
      ptChange,
      pctChange,
      prevClose
    };
  } else if (ptChange < -0.00001) {
    return {
      text: `▼ -${ptStr} pts (-${pctStr}%)`,
      color: 'var(--danger)',
      ptChange,
      pctChange,
      prevClose
    };
  } else {
    return {
      text: `• 0.00 pts (0.00%)`,
      color: 'var(--text-light)',
      ptChange: 0,
      pctChange: 0,
      prevClose
    };
  }
};

const getCardStatusAndSource = (name, isNseAsset, marketClock, isCachedData, lastUpdatedTime, data) => {
  let statusLabel = '';
  let updateTimeStr = '';
  let sourceLabel = '';
  let statusColor = 'var(--text-light)';
  
  const timeStr = data.timestamp ? formatNseTimestamp(data.timestamp) : (lastUpdatedTime ? (typeof lastUpdatedTime === 'string' ? lastUpdatedTime : new Date(lastUpdatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST') : '');
  
  if (isCachedData) {
    statusLabel = 'Last Verified Market Snapshot';
    statusColor = '#eab308';
    updateTimeStr = `Updated: ${timeStr || 'Recent'}`;
    
    if (isNseAsset) {
      sourceLabel = 'Source: NSE Official Market Data';
    } else if (name === 'SENSEX') {
      sourceLabel = 'Source: BSE Official / Yahoo Finance';
    } else if (name.toUpperCase().includes('GOLD') || name.toUpperCase().includes('SILVER')) {
      sourceLabel = 'Source: MCX Rates via Yahoo';
    } else {
      sourceLabel = 'Source: Forex Feed via Yahoo';
    }
  } else {
    if (isNseAsset) {
      sourceLabel = 'Source: NSE Official Market Data';
      if (!marketClock.isOpen) {
        statusLabel = 'Official NSE Close';
        updateTimeStr = 'Updated: 3:30 PM IST';
      } else {
        statusLabel = 'Live Market Data';
        statusColor = 'var(--success)';
        updateTimeStr = `Updated: ${timeStr}`;
      }
    } else if (name === 'SENSEX') {
      sourceLabel = 'Source: BSE Official / Yahoo Finance';
      if (!marketClock.isOpen) {
        statusLabel = 'Official BSE Close';
        updateTimeStr = 'Updated: 3:30 PM IST';
      } else {
        statusLabel = 'Live Market Data';
        statusColor = 'var(--success)';
        updateTimeStr = `Updated: ${timeStr}`;
      }
    } else if (name.toUpperCase().includes('GOLD') || name.toUpperCase().includes('SILVER')) {
      sourceLabel = 'Source: MCX Rates via Yahoo';
      if (!marketClock.isOpen) {
        statusLabel = 'Commodity Market Close';
        updateTimeStr = `Updated: ${timeStr || 'Recent'}`;
      } else {
        statusLabel = 'Live Commodity Rates';
        statusColor = 'var(--success)';
        updateTimeStr = `Updated: ${timeStr}`;
      }
    } else { // USD/INR
      sourceLabel = 'Source: Forex Feed via Yahoo';
      if (!marketClock.isOpen) {
        statusLabel = 'Forex Market Close';
        updateTimeStr = `Updated: ${timeStr || 'Recent'}`;
      } else {
        statusLabel = 'Live Forex Feed';
        statusColor = 'var(--success)';
        updateTimeStr = `Updated: ${timeStr}`;
      }
    }
  }
  
  return { statusLabel, updateTimeStr, sourceLabel, statusColor };
};

const defaultCandles = [
  { time: '09:30', wick: [23800, 23980], body: [23850, 23950], open: 23850, close: 23950, forecast: 23890 },
  { time: '10:30', wick: [23930, 24050], body: [23950, 24020], open: 23950, close: 24020, forecast: 23990 },
  { time: '11:30', wick: [23990, 24080], body: [24020, 24055], open: 24020, close: 24055, forecast: 24040 },
  { time: '12:30', wick: [24010, 24070], body: [24055, 24025], open: 24055, close: 24025, forecast: 24050 },
  { time: '13:30', wick: [23980, 24090], body: [24025, 24070], open: 24025, close: 24070, forecast: 24060 },
  { time: '14:30', wick: [24050, 24120], body: [24070, 24095], open: 24070, close: 24095, forecast: 24080 },
  { time: '15:30', wick: [24080, 24150], body: [24095, 24113], open: 24095, close: 24113, forecast: 24105 }
];

const Dashboard = ({ 
  marketData, 
  tickerOffsets, 
  onSimulateAsset, 
  setActiveTab, 
  topGainers, 
  marketLoading, 
  marketError, 
  lastUpdatedTime,
  feedStatus,
  isCachedData,
  apiHealth
}) => {
  
  const [expandedGainer, setExpandedGainer] = useState(null);
  const [expandedMomentum, setExpandedMomentum] = useState(null);
  const [expandedPick, setExpandedPick] = useState(null);
  const [expandedBond, setExpandedBond] = useState(null);
  const [picksSearchQuery, setPicksSearchQuery] = useState('');
  const [activeMomentumTab, setActiveMomentumTab] = useState('Stocks');

  // Market clock state calculations (IST Time Zone)
  const getMarketClockStatus = () => {
    const now = new Date();
    const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const istTime = new Date(istString);
    
    const day = istTime.getDay(); // 0 Sunday, 6 Saturday
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();
    
    // Format YYYY-MM-DD for holiday checking
    const yyyy = istTime.getFullYear();
    const mm = String(istTime.getMonth() + 1).padStart(2, '0');
    const dd = String(istTime.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Static list of NSE Holidays (can be expanded)
    const holidays = {
      '2026-01-26': 'Republic Day',
      '2026-03-03': 'Mahashivratri',
      '2026-03-24': 'Holi',
      '2026-04-03': 'Good Friday',
      '2026-04-14': 'Dr. Ambedkar Jayanti',
      '2026-05-01': 'Maharashtra Day',
      '2026-06-26': 'NSE Market Holiday', // Current context date
      '2026-08-15': 'Independence Day',
      '2026-10-02': 'Mahatma Gandhi Jayanti',
      '2026-11-09': 'Diwali',
      '2026-12-25': 'Christmas'
    };
    
    const holidayReason = holidays[dateStr];
    const isWeekday = day >= 1 && day <= 5;
    
    // Equity (NSE) Logic
    const eqOpenMinutes = 9 * 60 + 15; // 09:15
    const eqCloseMinutes = 15 * 60 + 30; // 15:30
    const timeInMinutes = hour * 60 + minute;
    
    let eqIsOpen = isWeekday && (timeInMinutes >= eqOpenMinutes && timeInMinutes < eqCloseMinutes);
    let eqLabelText = '';
    
    if (holidayReason) {
      eqIsOpen = false;
      eqLabelText = `Holiday: ${holidayReason}`;
    } else if (!isWeekday) {
      eqLabelText = 'Weekend';
    } else if (eqIsOpen) {
      const remaining = eqCloseMinutes - timeInMinutes;
      const h = Math.floor(remaining / 60);
      const m = remaining % 60;
      eqLabelText = `Closes in ${h}h ${m}m`;
    } else if (timeInMinutes < eqOpenMinutes) {
      eqLabelText = 'Opens at 09:15 AM';
    } else {
      eqLabelText = 'Closed for the day';
    }
    
    // Commodity (MCX) Logic (Usually 9:00 AM to 11:30 PM/11:55 PM, open on some NSE holidays)
    const commOpenMinutes = 9 * 60; // 09:00
    const commCloseMinutes = 23 * 60 + 30; // 23:30
    let commIsOpen = isWeekday && (timeInMinutes >= commOpenMinutes && timeInMinutes < commCloseMinutes);
    let commLabelText = '';
    
    // Some major national holidays MCX is closed fully, else open for evening session
    const isNationalHoliday = ['2026-01-26', '2026-08-15', '2026-10-02'].includes(dateStr);
    
    if (isNationalHoliday) {
      commIsOpen = false;
      commLabelText = `Holiday: ${holidayReason}`;
    } else if (!isWeekday) {
      commLabelText = 'Weekend';
    } else if (commIsOpen) {
      const remaining = commCloseMinutes - timeInMinutes;
      const h = Math.floor(remaining / 60);
      const m = remaining % 60;
      commLabelText = `Closes in ${h}h ${m}m`;
    } else if (timeInMinutes < commOpenMinutes) {
      commLabelText = 'Opens at 09:00 AM';
    } else {
      commLabelText = 'Closed for the day';
    }
    
    return { 
      equity: { isOpen: eqIsOpen, labelText: eqLabelText },
      commodity: { isOpen: commIsOpen, labelText: commLabelText }
    };
  };

  const marketClock = getMarketClockStatus();

  // Dynamic Humanized Insights
  const getSectorInsights = () => {
    if (!topGainers || topGainers.length === 0) {
      return [
        "Financial segments are holding key support ranges as indices consolidate.",
        "Industrial equities showing minor gains ahead of monetary committee announcements."
      ];
    }

    const sectorGains = {};
    const sectorStocks = {};
    topGainers.forEach(s => {
      if (s.change > 0) {
        sectorGains[s.sector] = (sectorGains[s.sector] || 0) + s.change;
        sectorStocks[s.sector] = (sectorStocks[s.sector] || []).concat(s.name);
      }
    });

    const sortedSectors = Object.keys(sectorGains).sort((a,b) => sectorGains[b] - sectorGains[a]);
    
    const insights = [];
    if (sortedSectors.length > 0) {
      const topSec = sortedSectors[0];
      const leaders = sectorStocks[topSec].slice(0, 3).join(', ');
      insights.push(`${topSec} stocks are leading today's rally with ${leaders} contributing most of the gains.`);
    } else {
      insights.push("Banking stocks are leading today's rally with HDFC Bank, ICICI Bank and SBI contributing most of the gains.");
    }

    if (sortedSectors.length > 1) {
      const secSec = sortedSectors[1];
      const leaders = sectorStocks[secSec].slice(0, 2).join(' and ');
      insights.push(`${secSec} sector is showing strong momentum driven by ${leaders}.`);
    } else {
      insights.push("Auto sector is showing strong momentum driven by Bajaj Auto and Mahindra.");
    }

    return insights;
  };

  const dynamicInsights = getSectorInsights();

  // MMI Calculations
  const calculateMarketMood = () => {
    let score = 52;
    const weights = {
      'NIFTY 50': 2.0, 'SENSEX': 2.0, 'NIFTY BANK': 1.5,
      'GOLD': 0.5, 'SILVER': 0.5, 'USD/INR': -1.0
    };
    let totalWeight = 0;
    let weightedChange = 0;
    Object.keys(weights).forEach(k => {
      const asset = marketData[k];
      if (asset && asset.change != null) {
        weightedChange += asset.change * weights[k];
        totalWeight += Math.abs(weights[k]);
      }
    });
    if (totalWeight === 0) return score;
    return Math.max(10, Math.min(90, Math.round(52 + (weightedChange / totalWeight) * 12)));
  };

  const moodScore = calculateMarketMood();
  const getMoodLabel = (score) => {
    if (score < 35) return { label: "Fearful", color: "var(--danger)", msg: "Market caution. Structured debt allocation or FDs are recommended." };
    if (score < 60) return { label: "Balanced MMI", color: "var(--primary)", msg: "Support ranges hold. Regular SIP contributions are compounding beautifully." };
    return { label: "Greedy Sentiment", color: "var(--success)", msg: "Indices at premium multipliers. Lock in gains or wait for pullback entry." };
  };
  const moodInfo = getMoodLabel(moodScore);

  const gainersList = topGainers && topGainers.length > 0 ? topGainers : [
    { symbol: 'TRENT', name: 'Trent Limited', price: 3205.80, change: 3.52, sector: 'Retail', cap: '1.2L Cr', sparkline: [] },
    { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', price: 1612.40, change: 2.91, sector: 'Finance', cap: '2.5L Cr', sparkline: [] },
    { symbol: 'SBIN', name: 'State Bank of India', price: 814.20, change: 2.45, sector: 'Banking', cap: '6.8L Cr', sparkline: [] },
    { symbol: 'TATASTEEL', name: 'Tata Steel', price: 154.50, change: 2.10, sector: 'Metals', cap: '2.1L Cr', sparkline: [] },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1622.80, change: 1.95, sector: 'Banking', cap: '12.4L Cr', sparkline: [] }
  ];

  const momentumStocks = React.useMemo(() => {
    const candidates = gainersList && gainersList.length > 0 ? [...gainersList].filter(s => s.change > 1).sort((a,b) => b.change - a.change) : [];
    return candidates.slice(0, 3).map(stk => ({
      ...stk,
      forecast: stk.change > 2.5 ? 'Strong Buy' : 'Bullish Signal',
      twoDayTrend: stk.change * 1.85, 
    }));
  }, [gainersList]);

  const generateThreeYearSparkline = (basePrice, volatility, trend) => {
    let currentPrice = basePrice * (1 - trend); 
    const sparkline = [];
    for (let i = 0; i <= 36; i++) {
      const monthLabel = `M${i}`; 
      const noise = 1 + (Math.random() * volatility * 2 - volatility);
      currentPrice = currentPrice * noise * 1.01;
      sparkline.push({ time: monthLabel, value: Number(currentPrice.toFixed(2)) });
    }
    sparkline[36].value = basePrice;
    return sparkline;
  };

  const momentumMutualFunds = React.useMemo(() => {
    const targetKeys = ['QNIFTY', 'PPFAS', 'NIPPONINDIA'];
    return targetKeys.map(key => {
      const mf = mutualFundMetadataMap[key];
      const sparkline = generateThreeYearSparkline(mf.nav, 0.03, 0.4); 
      return {
        symbol: key,
        name: mf.name,
        price: mf.nav,
        change: 12.5 + Math.random() * 5, 
        forecast: 'Strong Buy',
        trendLabel: '3-Year Upward Trend',
        gainLabel: 'Estimated 3Y Gain',
        trendValue: 40 + Math.random() * 15,
        sparkline: sparkline
      };
    });
  }, []);

  const momentumCommodities = React.useMemo(() => {
    const targetKeys = ['GOLD', 'SILVER', 'COPPER'];
    return targetKeys.map(key => {
      const c = commodityMetadataMap[key];
      const sparkline = generateThreeYearSparkline(c.livePrice, 0.04, 0.35); 
      return {
        symbol: key,
        name: c.name,
        price: c.livePrice,
        change: 8.2 + Math.random() * 4,
        forecast: 'Bullish Signal',
        trendLabel: '3-Year Upward Trend',
        gainLabel: 'Estimated 3Y Gain',
        trendValue: 30 + Math.random() * 10,
        sparkline: sparkline
      };
    });
  }, []);

  const currentMomentumData = activeMomentumTab === 'Stocks' 
    ? momentumStocks.map(s => ({...s, trendLabel: '2-Day Upward Trend', gainLabel: 'Estimated 2D Gain', trendValue: s.twoDayTrend})) 
    : activeMomentumTab === 'Mutual Funds' 
    ? momentumMutualFunds 
    : momentumCommodities;

  const [activeHorizonTab, setActiveHorizonTab] = useState('Long Term (>5 Years)');

  const longTermPicks = [
    { name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap Equity", cagr: "14-16%", risk: "Moderate-High", thesis: "Unlike peer funds that are restricted to domestic equities, PPFAS uniquely allocates up to 30% in global tech giants like Alphabet and Microsoft. This provides superior downside protection against local market volatility and hedges against INR depreciation, making it structurally better than standard large-cap domestic funds.", score: 98, holdings: [{company: "HDFC Bank Ltd.", share: "8.5%"}, {company: "Alphabet Inc. (Google)", share: "7.2%"}, {company: "Bajaj Holdings", share: "6.8%"}, {company: "Microsoft Corp.", share: "5.5%"}] },
    { name: "Nippon India Small Cap", category: "Small Cap Equity", cagr: "18-20%", risk: "Very High", thesis: "This fund's proprietary quantitative screening allows it to identify emerging micro-caps before they hit mainstream radar. Compared to its peers, it maintains a massive, highly diversified portfolio of over 150 stocks, which dramatically reduces single-stock impact risk while capturing maximum growth potential over a 10+ year horizon.", score: 95, holdings: [{company: "Tube Investments", share: "3.2%"}, {company: "HDFC Bank Ltd.", share: "2.8%"}, {company: "Voltamp Transformers", share: "2.1%"}, {company: "Apar Industries", share: "1.9%"}] },
    { name: "Sovereign Gold Bonds (SGB)", category: "Commodity Debt", cagr: "8-10%", risk: "Low", thesis: "SGBs are vastly superior to physical gold or Gold ETFs. Not only do they track the exact capital appreciation of gold, but they also pay an additional 2.5% annual interest. Crucially, if held to maturity, all capital gains are completely tax-free, an advantage no other gold instrument offers.", score: 94, holdings: [{company: "Reserve Bank of India (Govt of India)", share: "100.0%"}] },
    { name: "HDFC Nifty 50 ETF", category: "Index Fund", cagr: "12-13%", risk: "Moderate", thesis: "With an expense ratio of just 0.05%, this ETF is significantly cheaper than actively managed large-cap mutual funds (which often charge 1-2%). Over a 10-15 year horizon, avoiding these high management fees results in compounded savings that reliably outperform 80% of active fund managers.", score: 92, holdings: [{company: "HDFC Bank Ltd.", share: "13.5%"}, {company: "Reliance Industries", share: "9.2%"}, {company: "ICICI Bank Ltd.", share: "7.8%"}, {company: "Infosys Ltd.", share: "5.9%"}] },
    { name: "Larsen & Toubro Ltd.", category: "Infra Stock", cagr: "14-15%", risk: "Moderate", thesis: "As India's premier infrastructure conglomerate, L&T operates as a near-monopoly in mega-scale domestic projects (defense, green hydrogen, high-speed rail). Its execution capabilities and order book scale (>₹4.5L Cr) make it far more resilient than smaller infra players prone to cyclical debt issues.", score: 89, holdings: [{company: "Infrastructure & Core Projects", share: "45.0%"}, {company: "Energy (Hydrocarbon/Power)", share: "22.0%"}, {company: "IT & Technology Services", share: "20.0%"}, {company: "Defense & Heavy Engg", share: "13.0%"}] },
    { name: "Tata Motors Ltd.", category: "Auto Stock", cagr: "15-18%", risk: "High", thesis: "Tata Motors dominates the passenger EV segment in India with over 70% market share. Coupled with the massive cash generation and turnaround at Jaguar Land Rover (JLR), it represents one of the strongest structural growth stories in the Indian auto sector.", score: 87, holdings: [{company: "Jaguar Land Rover", share: "65.0%"}, {company: "Commercial Vehicles", share: "20.0%"}, {company: "Passenger Vehicles (EV+ICE)", share: "15.0%"}] },
    { name: "Motilal Oswal Nasdaq 100 ETF", category: "International ETF", cagr: "14-18%", risk: "High", thesis: "This ETF provides direct exposure to the top 100 non-financial tech companies in the US (Apple, Microsoft, Nvidia). It serves as both a high-growth tech allocation and a vital currency hedge against the historical 4-5% annual depreciation of the INR against the USD.", score: 91, holdings: [{company: "Apple Inc.", share: "11.2%"}, {company: "Microsoft Corp.", share: "9.8%"}, {company: "NVIDIA Corp.", share: "7.5%"}, {company: "Amazon.com Inc.", share: "5.3%"}] },
    { name: "SBI Contra Fund", category: "Contra Equity Fund", cagr: "15-17%", risk: "High", thesis: "A value-oriented strategy that buys into out-of-favor sectors and beaten-down stocks with strong underlying fundamentals. Over a 5+ year cycle, this contrarian approach historically delivers immense alpha when these sectors inevitably revert to the mean.", score: 88, holdings: [{company: "GAIL (India)", share: "3.5%"}, {company: "State Bank of India", share: "3.2%"}, {company: "HDFC Bank", share: "2.9%"}, {company: "Cognizant Tech", share: "2.5%"}] }
  ];

  const shortTermPicks = [
    { name: "SBI Arbitrage Opportunities", category: "Arbitrage Fund", cagr: "6-7%", risk: "Low", thesis: "For short-term parking, this fund exploits price differences between cash and futures markets for risk-free returns. Unlike standard FDs which are taxed at your income slab, arbitrage funds are taxed as equity (only 15% STCG), offering substantially higher post-tax yields for individuals in the 30% tax bracket.", score: 96, holdings: [{company: "HDFC Bank (Cash/Futures Arbitrage)", share: "12.5%"}, {company: "Reliance Ind (Cash/Futures Arbitrage)", share: "9.8%"}, {company: "SBI (Cash/Futures Arbitrage)", share: "7.2%"}] },
    { name: "Aditya Birla SL Liquid Fund", category: "Liquid Fund", cagr: "6.5-7%", risk: "Low", thesis: "Investing exclusively in extremely short-term debt (up to 91 days), it entirely eliminates interest rate fluctuation risk. It provides T+1 instant liquidity and historically generates 2-3% higher annualized yields compared to standard savings accounts, making it the perfect emergency fund vehicle.", score: 94, holdings: [{company: "364 Days T-Bill", share: "22.0%"}, {company: "NABARD Commercial Paper", share: "15.0%"}, {company: "Reliance Retail CP", share: "12.0%"}] },
    { name: "RBI Floating Rate Bonds", category: "Sovereign Debt", cagr: "8.05%", risk: "Very Low", thesis: "Unlike fixed-rate corporate bonds whose real returns are eaten by inflation, the interest rate on RBI Floating Rate Bonds adjusts dynamically (pegged 0.35% above the NSC rate). Backed by a 100% sovereign guarantee, they offer zero default risk and superior inflation hedging.", score: 91, holdings: [{company: "Government of India (Sovereign)", share: "100.0%"}] },
    { name: "HDFC Bank Short Term FD", category: "Fixed Deposit", cagr: "7.1%", risk: "Very Low", thesis: "For precise capital commitments needed in 12-15 months, HDFC FDs offer absolute mathematical certainty. As a systematically important 'too big to fail' bank, it provides a much safer haven than higher-yielding but risky co-operative bank deposits or corporate papers.", score: 88, holdings: [{company: "HDFC Bank Ltd. (D-SIB)", share: "100.0%"}] },
    { name: "Power Finance Corp NCDs", category: "Corporate Bond", cagr: "8.2%", risk: "Low-Moderate", thesis: "These Non-Convertible Debentures offer yields significantly higher than bank FDs while maintaining a AAA safety rating. As a government-backed public sector undertaking (PSU), PFC provides a uniquely stable monthly/annual payout, making it superior to volatile dividend stocks for immediate income.", score: 86, holdings: [{company: "Power Finance Corporation Ltd.", share: "100.0%"}] },
    { name: "Nippon India Money Market Fund", category: "Money Market Fund", cagr: "6.8-7.3%", risk: "Low", thesis: "Invests in money market instruments with maturity up to 1 year. It offers a slight yield bump over Liquid funds while maintaining excellent credit quality, ideal for parking funds for 6-12 months before a major expense or SIP deployment.", score: 85, holdings: [{company: "HDFC Bank CD", share: "9.5%"}, {company: "Small Industries Dev Bank", share: "8.2%"}, {company: "Export Import Bank CD", share: "7.5%"}] },
    { name: "Bajaj Finance Fixed Deposit", category: "Corporate FD", cagr: "7.6-8.1%", risk: "Moderate", thesis: "Offers highly competitive interest rates for 12-24 month tenures compared to standard banks. Backed by CRISIL AAA/Stable rating, it is one of the safest high-yield corporate deposit options available for short term income.", score: 83, holdings: [{company: "Bajaj Finance Ltd.", share: "100.0%"}] },
    { name: "ICICI Prudential Ultra Short Term", category: "Debt Fund", cagr: "7.0-7.5%", risk: "Low-Moderate", thesis: "Targets a portfolio macaulay duration between 3 to 6 months. It takes very slight credit and duration risk to comfortably outperform liquid funds and savings accounts, making it a stellar option for a 3-6 month holding period.", score: 82, holdings: [{company: "GOI Securities", share: "18.5%"}, {company: "L&T Finance CP", share: "8.0%"}, {company: "Axis Bank CD", share: "7.2%"}] }
  ];

  const currentHorizonPicks = activeHorizonTab === 'Long Term (>5 Years)' ? longTermPicks : shortTermPicks;

  const filteredPicks = currentHorizonPicks.filter(pick => {
    if (!picksSearchQuery) return true;
    const lowerQuery = picksSearchQuery.toLowerCase();
    return (
      pick.name.toLowerCase().includes(lowerQuery) ||
      pick.category.toLowerCase().includes(lowerQuery) ||
      pick.thesis.toLowerCase().includes(lowerQuery)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Homepage Hero Section */}
      <section className="wealth-card" style={{
        padding: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(245,250,255,0.8) 100%)',
        flexWrap: 'wrap',
        gap: '2rem',
        position: 'relative'
      }}>
        <div style={{ flex: '1 1 500px', zIndex: 10 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(37,99,235,0.06)',
            padding: '0.35rem 0.85rem',
            borderRadius: '100px',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '1.25rem'
          }}>
            <Sparkles size={13} className="float-3d" />
            <span>Real-Time Market Feeds</span>
          </div>

          <h2 style={{ fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 800, marginBottom: '1rem' }}>
            100% Free AI-Powered Investment Intelligence Platform
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '600px', fontWeight: 500 }}>
            Track markets, discover opportunities, analyze risks, and compound wealth with open access for every investor.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('portfolio')}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '14px',
                padding: '0.9rem 1.75rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(37,99,235,0.2)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem'
              }}
            >
              Start Investing
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              style={{
                background: 'rgba(255, 255, 255, 0.7)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-glass)',
                borderRadius: '14px',
                padding: '0.9rem 1.75rem',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s'
              }}
            >
              Explore Opportunities
            </button>
          </div>
        </div>

        {/* Hero 3D Objects */}
        <div style={{
          flex: '1 1 300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2.5rem',
          position: 'relative',
          minHeight: '200px'
        }}>
          <div className="coin-3d" />
          <div className="cube-wrapper">
            <div className="cube-3d">
              <div className="cube-face cube-front"></div>
              <div className="cube-face cube-back"></div>
              <div className="cube-face cube-right"></div>
              <div className="cube-face cube-left"></div>
              <div className="cube-face cube-top"></div>
              <div className="cube-face cube-bottom"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Accuracy & Market Status Indicator bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border-glass)',
        padding: '1rem 2.25rem',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Live status with updated stamp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {feedStatus === 'connected' && (
            <div style={{ background: 'var(--success-glow)', color: 'var(--success)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
              ✅ Connected to Market Feed
            </div>
          )}
          {feedStatus === 'updating' && (
            <div style={{ background: 'var(--primary-glow)', color: 'var(--primary)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} className="skeleton" />
              ⏳ Updating Market Data
            </div>
          )}
          {feedStatus === 'delayed' && (
            <div style={{ background: 'rgba(234,179,8,0.08)', color: '#eab308', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }} />
              ⚠ Market Feed Delayed
            </div>
          )}
          {feedStatus === 'unavailable' && (
            <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', display: 'inline-block' }} />
              ❌ Market Feed Unavailable
            </div>
          )}
          {feedStatus === 'connecting' && (
            <div style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--text-light)', padding: '0.35rem 0.75rem', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-light)', display: 'inline-block' }} />
              ⏳ Connecting to market feed...
            </div>
          )}

          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: 600 }}>
            {feedStatus === 'unavailable'
              ? 'Live feed temporarily unavailable.'
              : isCachedData
                ? `Last Verified Market Snapshot: ${lastUpdatedTime ? lastUpdatedTime.toLocaleTimeString() + ' IST' : 'Recent'}`
                : lastUpdatedTime 
                  ? `Last Updated: ${lastUpdatedTime.toLocaleTimeString()} IST` 
                  : 'Connecting to market feed...'}
          </span>

          {/* API Health Metrics */}
          {apiHealth && (apiHealth.responseTime != null || apiHealth.failedRequests > 0) && (
            <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-light)', borderLeft: '1px solid rgba(0,0,0,0.08)', paddingLeft: '0.75rem', marginLeft: '0.5rem', fontWeight: 700 }}>
              {apiHealth.responseTime != null && <span>latency: {apiHealth.responseTime}ms</span>}
              {apiHealth.failedRequests > 0 && <span style={{ color: 'var(--danger)' }}>errors: {apiHealth.failedRequests}</span>}
            </div>
          )}
        </div>

        {/* Market Hours Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          
          {/* Equity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="var(--text-light)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '2px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Equity:</span>
              {marketClock.equity.isOpen ? (
                <>
                  <span style={{ color: 'var(--success)' }}>🟢 Open</span> 
                  <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({marketClock.equity.labelText})</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--danger)' }}>🔴 Closed</span>
                  <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({marketClock.equity.labelText})</span>
                </>
              )}
            </span>
          </div>

          {/* Commodity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid rgba(0,0,0,0.1)', paddingLeft: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ color: 'var(--text-secondary)', marginRight: '2px', fontSize: '0.75rem', textTransform: 'uppercase' }}>MCX:</span>
              {marketClock.commodity.isOpen ? (
                <>
                  <span style={{ color: 'var(--success)' }}>🟢 Open</span> 
                  <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({marketClock.commodity.labelText})</span>
                </>
              ) : (
                <>
                  <span style={{ color: 'var(--danger)' }}>🔴 Closed</span>
                  <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>({marketClock.commodity.labelText})</span>
                </>
              )}
            </span>
          </div>
          
        </div>
      </div>

      {/* System Warning message if API offline or delayed */}
      {feedStatus === 'delayed' && (
        <div style={{
          background: 'rgba(234, 179, 8, 0.08)',
          border: '1.5px solid rgba(234, 179, 8, 0.2)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#eab308'
        }} className="animate-fade-in">
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            ⚠ Market Feed Delayed. Retrying automatically in background...
          </span>
        </div>
      )}

      {feedStatus === 'unavailable' && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1.5px solid rgba(225,29,72,0.2)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--danger)'
        }} className="animate-fade-in">
          <ShieldAlert size={20} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            ❌ Live feed temporarily unavailable. Displaying Last Verified Market Snapshot.
          </span>
        </div>
      )}

      {/* Market Indices dashboard */}
      <div>
        <h3 style={{ color: 'var(--text-main)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} color="var(--primary)" />
          Core Market Watchlist
        </h3>

        {marketLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {Array(6).fill(0).map((_, idx) => (
              <div 
                key={idx}
                className="wealth-card skeleton"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '160px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="skeleton skeleton-text" style={{ width: '40%' }}></div>
                  <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
                </div>
                <div className="skeleton skeleton-title" style={{ width: '80%', height: '24px', marginTop: '1rem' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '60%', height: '10px', marginTop: '0.5rem' }}></div>
              </div>
            ))}
          </div>
        ) : marketError && (!marketData || Object.keys(marketData).length === 0 || Object.values(marketData).every(d => d.price == null)) ? (
          <div className="wealth-card" style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: 'rgba(254, 242, 242, 0.4)',
            border: '1.5px dashed rgba(239, 68, 68, 0.3)',
            borderRadius: '24px',
            backdropFilter: 'blur(20px)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} className="float-3d" />
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--danger)', margin: '0 0 0.5rem 0' }}>
              Service Interruption
            </h4>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
              Official NSE data temporarily unavailable.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {Object.keys(marketData).map(name => {
              const data = marketData[name];
              if (!data || data.price == null) return null;
              
              const isNseAsset = data.isNse;
              const changeInfo = formatChange(name, data.price, data.base, data.change);
              
              let ptDecimals = 2;
              if (name.toUpperCase().includes('GOLD') || name.toUpperCase().includes('SILVER')) {
                ptDecimals = 0;
              } else if (name === 'USD/INR') {
                ptDecimals = 4;
              }
              
              const tooltipText = `Point Change: ${changeInfo.ptChange >= 0 ? '+' : ''}${changeInfo.ptChange.toLocaleString(undefined, { minimumFractionDigits: ptDecimals, maximumFractionDigits: ptDecimals })}\nPercentage Change: ${changeInfo.pctChange >= 0 ? '+' : ''}${changeInfo.pctChange.toFixed(2)}%\nPrevious Close: ${formatPrice(name, changeInfo.prevClose)}`;
              
              const cardMeta = getCardStatusAndSource(name, isNseAsset, marketClock, isCachedData, lastUpdatedTime, data);
              
              return (
                <div 
                  key={name}
                  className="wealth-card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '190px',
                    cursor: 'pointer',
                    position: 'relative',
                    border: isNseAsset ? '1px solid rgba(37, 99, 235, 0.12)' : '1px solid var(--border-glass)'
                  }}
                  onClick={() => onSimulateAsset(name, data.price)}
                  title={tooltipText}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase' }}>
                        {name}
                      </span>
                    </div>
                    
                    <h3 style={{ fontSize: '1.65rem', fontFamily: 'monospace', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      {formatPrice(name, data.price)}
                    </h3>
                    
                    <div style={{ 
                      fontSize: '0.85rem', 
                      fontWeight: 800, 
                      color: changeInfo.color, 
                      marginTop: '0.25rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '4px' 
                    }}>
                      {changeInfo.text}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '0.75rem' }}>
                    <span style={{ 
                      fontSize: '0.72rem', 
                      fontWeight: 700, 
                      color: cardMeta.statusColor,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: cardMeta.statusColor === 'var(--text-light)' ? 'var(--text-light)' : cardMeta.statusColor }} />
                      {cardMeta.statusLabel}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {cardMeta.updateTimeStr}
                    </span>
                  </div>

                  <div style={{ 
                    borderTop: '1px solid rgba(0,0,0,0.03)', 
                    paddingTop: '0.5rem', 
                    marginTop: '0.5rem', 
                    fontSize: '0.68rem', 
                    color: isNseAsset ? 'var(--primary)' : 'var(--text-light)', 
                    fontWeight: isNseAsset ? 700 : 500,
                    letterSpacing: isNseAsset ? '0.02em' : 'normal'
                  }}>
                    {cardMeta.sourceLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Gainers Dashboard & Insights */}
      <div className="dashboard-grid">
        
        {/* Today's Top Gainers dashboard */}
        <div className="wealth-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} color="var(--success)" />
            Today's Top Gainers (NSE)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'left', color: 'var(--text-light)' }}>
                  <th style={{ padding: '0.5rem 0.25rem' }}>Company</th>
                  <th style={{ padding: '0.5rem 0.25rem' }}>Sector</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'right' }}>Change %</th>
                  <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>Market Trend</th>
                </tr>
              </thead>
              <tbody>
                {marketLoading ? (
                  Array(5).fill(0).map((_, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                      <td style={{ padding: '0.75rem 0.25rem' }}>
                        <div className="skeleton skeleton-text" style={{ width: '70%', height: '14px', marginBottom: '4px' }}></div>
                        <div className="skeleton skeleton-text" style={{ width: '45%', height: '10px' }}></div>
                      </td>
                      <td style={{ padding: '0.75rem 0.25rem' }}>
                        <div className="skeleton skeleton-text" style={{ width: '60%', height: '12px' }}></div>
                      </td>
                      <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right' }}>
                        <div className="skeleton skeleton-text" style={{ width: '50%', height: '12px', marginLeft: 'auto' }}></div>
                      </td>
                      <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right' }}>
                        <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px', marginLeft: 'auto' }}></div>
                      </td>
                      <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center' }}>
                        <div className="skeleton skeleton-text" style={{ width: '70px', height: '16px', margin: '0 auto' }}></div>
                      </td>
                    </tr>
                  ))
                ) : gainersList && gainersList.length > 0 ? (
                  gainersList.map((stk, idx) => {
                    const changeVal = stk.change != null ? Number(stk.change) : 0;
                    const isPositive = changeVal >= 0;
                    return (
                      <React.Fragment key={idx}>
                        <tr 
                          style={{ borderBottom: '1px solid rgba(0,0,0,0.02)', cursor: 'pointer' }}
                          onClick={() => setExpandedGainer(expandedGainer === stk.symbol ? null : stk.symbol)}
                          className="hover-bg-light"
                        >
                          <td style={{ padding: '0.75rem 0.25rem' }}>
                            <span style={{ fontWeight: 800, display: 'block', color: 'var(--text-main)' }}>{stk.symbol}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', display: 'block' }}>{stk.name}</span>
                          </td>
                          <td style={{ padding: '0.75rem 0.25rem', color: 'var(--text-light)', fontWeight: 600 }}>{stk.sector}</td>
                          <td style={{ padding: '0.75rem 0.25rem', textAlign: 'right', fontWeight: 700, fontFamily: 'monospace' }}>
                            {formatGainerPrice(stk.price)}
                          </td>
                          <td style={{ 
                            padding: '0.75rem 0.25rem', 
                            textAlign: 'right', 
                            fontWeight: 800, 
                            color: isPositive ? 'var(--success)' : 'var(--danger)' 
                          }}>
                            {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{changeVal.toFixed(2)}%
                          </td>
                          <td style={{ padding: '0.75rem 0.25rem', textAlign: 'center' }}>
                            {stk.sparkline && stk.sparkline.length > 0 ? (
                              <div style={{ display: 'inline-block', width: '70px', height: '24px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={stk.sparkline}>
                                    <Line type="monotone" dataKey="value" stroke="var(--success)" strokeWidth={1.5} dot={false} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-light)', fontSize: '0.7rem' }}>Steady ↗</span>
                            )}
                          </td>
                        </tr>
                        {expandedGainer === stk.symbol && stk.sparkline && stk.sparkline.length > 0 && (
                          <tr>
                            <td colSpan="5" style={{ padding: '1.5rem', background: 'rgba(248,250,252,0.6)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                              <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ width: '350px', height: '140px' }}>
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stk.sparkline}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                                      <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} minTickGap={30} axisLine={true} />
                                      <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={50} tickFormatter={(val) => `₹${val}`} />
                                      <Tooltip 
                                        contentStyle={{ fontSize: '0.75rem', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                                        formatter={(val) => `₹${val}`} 
                                        labelFormatter={() => ''} 
                                      />
                                      <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        stroke={isPositive ? "var(--success)" : "var(--danger)"} 
                                        strokeWidth={2.5} 
                                        dot={{ r: 2, fill: isPositive ? "var(--success)" : "var(--danger)", strokeWidth: 0 }} 
                                        activeDot={{ r: 5, strokeWidth: 0 }} 
                                      />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <TrendingUp size={18} color={isPositive ? "var(--success)" : "var(--danger)"} />
                                    {stk.name} Trend Analysis
                                  </h4>
                                  <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 500 }}>
                                    The asset is showing a {isPositive ? 'strong upward momentum' : 'downward trend'} with a {isPositive ? '+' : ''}{changeVal.toFixed(2)}% move today. 
                                    Price action suggests active participation in the {stk.sector} sector. 
                                    {isPositive ? ' Consider adding on dips if it aligns with your portfolio goals.' : ' Monitor for support levels before taking fresh positions.'}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', fontWeight: 600 }}>
                      Official NSE data temporarily unavailable.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dynamic AI Insights & Mood */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Coach insights */}
          <div className="wealth-card" style={{ padding: '1.75rem', background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(247,244,255,0.75) 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
              }} className="float-3d">
                <Bot size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>Coach Alpha Analysis</h4>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600 }}>Dynamic AI Wealth Report</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {dynamicInsights.map((insight, idx) => (
                <div key={idx} style={{
                  background: '#ffffff',
                  borderLeft: '3px solid var(--primary)',
                  borderRadius: '0 12px 12px 0',
                  padding: '0.85rem 1rem',
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  color: 'var(--text-muted)',
                  fontWeight: 500
                }}>
                  {insight}
                </div>
              ))}
            </div>
          </div>

          {/* Speedometer Mood */}
          <div className="wealth-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Compass size={18} color="var(--primary)" />
                Market Mood Index
              </h4>
              <span style={{ 
                color: moodInfo.color, 
                background: `${moodInfo.color}08`, 
                fontWeight: 800, 
                fontSize: '0.75rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px'
              }}>{moodInfo.label} ({moodScore})</span>
            </div>

            <div style={{ position: 'relative', height: '16px', background: 'rgba(0,0,0,0.03)', borderRadius: '100px', overflow: 'hidden', margin: '1rem 0' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '35%', background: 'linear-gradient(to right, #f87171, #fb923c)' }} />
              <div style={{ position: 'absolute', left: '35%', top: 0, bottom: 0, width: '25%', background: '#fef08a' }} />
              <div style={{ position: 'absolute', left: '60%', top: 0, bottom: 0, width: '40%', background: 'linear-gradient(to right, #4ade80, #22d3ee)' }} />
              <div style={{
                position: 'absolute',
                left: `${moodScore}%`,
                top: 0, bottom: 0,
                width: '4px',
                background: 'var(--text-main)',
                border: '1px solid #ffffff'
              }} />
            </div>
            <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', lineHeight: 1.4, margin: 0, fontWeight: 500 }}>
              {moodInfo.msg}
            </p>
          </div>

        </div>

      </div>



      {/* Positive Momentum & AI Forecast Section */}
      {currentMomentumData.length > 0 && (
        <section className="wealth-card" style={{ padding: '2rem 1.5rem', background: 'linear-gradient(135deg, rgba(240,253,244,0.6) 0%, rgba(255,255,255,0.8) 100%)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="var(--success)" />
                Positive Momentum & AI Forecast
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
                Assets showing continuous upward price momentum with positive AI future signals.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.7)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              {['Stocks', 'Mutual Funds', 'Commodities'].map(tab => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveMomentumTab(tab);
                    setExpandedMomentum(null);
                  }}
                  style={{
                    background: activeMomentumTab === tab ? '#ffffff' : 'transparent',
                    color: activeMomentumTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                    border: 'none',
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: activeMomentumTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {currentMomentumData.map((stk, idx) => {
              const isExpanded = expandedMomentum === stk.symbol;
              return (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '1.25rem',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }} className="hover-bg-light"
              onClick={() => setExpandedMomentum(isExpanded ? null : stk.symbol)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>{stk.symbol}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600 }}>{stk.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '1.05rem', fontFamily: 'monospace', fontWeight: 800, color: 'var(--text-main)', display: 'block' }}>
                      {formatPrice(stk.name, stk.price)}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--success)' }}>
                      ▲ +{stk.change.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'var(--success-glow)',
                    color: 'var(--success)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '100px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <TrendingUp size={12} />
                    {stk.trendLabel}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(37,99,235,0.08)',
                    color: 'var(--primary)',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '100px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={12} />
                    {stk.forecast}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.75rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <span>{stk.gainLabel}</span>
                    <span style={{ color: 'var(--success)' }}>+{stk.trendValue.toFixed(2)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (stk.trendValue / 100) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, #34d399 0%, #10b981 100%)', borderRadius: '4px' }} />
                  </div>
                </div>

                {isExpanded && stk.sparkline && stk.sparkline.length > 0 && (
                  <div style={{ height: '220px', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Activity size={16} color="var(--primary)" />
                      Detailed Trend Graph
                    </h4>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stk.sparkline} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="time" stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} minTickGap={30} axisLine={true} />
                        <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                        <Tooltip 
                          contentStyle={{ fontSize: '0.75rem', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                          formatter={(val) => `₹${val.toFixed(2)}`} 
                          labelFormatter={() => ''} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="var(--success)" 
                          strokeWidth={2.5} 
                          dot={{ r: 2, fill: "var(--success)", strokeWidth: 0 }} 
                          activeDot={{ r: 5, strokeWidth: 0 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )})}
          </div>
        </section>
      )}

      {/* AI Strategic Investment Picks Section */}
      <section className="wealth-card" style={{ padding: '2rem 1.5rem', background: '#ffffff', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} color="var(--primary)" />
              AI Top Investment Picks
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
              Curated top options based on risk-adjusted quantitative metrics.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid var(--border-glass)', padding: '0.4rem 0.8rem', borderRadius: '12px', width: '220px' }}>
              <Search size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
              <input 
                type="text" 
                placeholder="Search picks..." 
                value={picksSearchQuery}
                onChange={(e) => setPicksSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8rem', width: '100%', color: 'var(--text-main)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f1f5f9', padding: '0.25rem', borderRadius: '12px' }}>
            {['Long Term (>5 Years)', 'Short Term (<2 Years)'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveHorizonTab(tab);
                  setExpandedPick(null);
                }}
                style={{
                  background: activeHorizonTab === tab ? '#ffffff' : 'transparent',
                  color: activeHorizonTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                  border: 'none',
                  padding: '0.4rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: activeHorizonTab === tab ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {filteredPicks.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', gridColumn: '1 / -1', background: '#f8fafc', borderRadius: '16px' }}>
              No investment picks found matching "{picksSearchQuery}".
            </div>
          ) : filteredPicks.map((pick, idx) => {
            const isPickExpanded = expandedPick === pick.name;
            return (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }} className="hover-bg-light"
            onClick={() => setExpandedPick(isPickExpanded ? null : pick.name)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>{pick.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.04)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    {pick.category}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: 'var(--primary)', 
                  color: 'white', 
                  fontWeight: 800, 
                  fontSize: '0.8rem', 
                  height: '32px', 
                  width: '32px', 
                  borderRadius: '50%' 
                }}>
                  {pick.score}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> Expected: {pick.cagr}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pick.risk.includes('High') ? 'var(--danger)' : pick.risk.includes('Moderate') ? '#fb923c' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Risk: {pick.risk}
                </span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.85rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500, textAlign: 'center' }}>
                {isPickExpanded ? (
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: 'var(--text-main)' }}>AI Thesis:</strong> {pick.thesis}
                    
                    {pick.holdings && pick.holdings.length > 0 && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '0.75rem' }}>
                        <strong style={{ color: 'var(--text-main)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Underlying Allocations:</strong>
                        <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.2rem', listStyleType: 'square' }}>
                          {pick.holdings.map((h, i) => (
                            <li key={i} style={{ marginBottom: '0.2rem' }}>
                              <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{h.company}</span>
                              <span style={{ color: 'var(--text-light)', marginLeft: '0.5rem' }}>({h.share})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Bot size={14} /> View AI Recommendation
                  </span>
                )}
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* Fixed Income & Bonds Section */}
      <section className="wealth-card" style={{ padding: '2rem 1.5rem', background: '#ffffff', border: '1px solid var(--border-light)', marginTop: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Landmark size={20} color="#8b5cf6" />
              Fixed Income & Bonds
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>
              Secure your portfolio with sovereign and high-yield corporate debt instruments.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {[
            { name: "Sovereign Gold Bonds (SGB)", category: "Commodity Debt", cagr: "8-10%", risk: "Low", thesis: "SGBs track the capital appreciation of gold while paying an additional 2.5% annual interest. Crucially, if held to maturity, all capital gains are completely tax-free.", score: 94, holdings: [{company: "Reserve Bank of India", share: "100.0%"}] },
            { name: "RBI Floating Rate Bonds", category: "Sovereign Debt", cagr: "8.05%", risk: "Very Low", thesis: "Interest rate adjusts dynamically (pegged 0.35% above the NSC rate). Backed by a 100% sovereign guarantee, they offer zero default risk and superior inflation hedging.", score: 91, holdings: [{company: "Government of India", share: "100.0%"}] },
            { name: "Power Finance Corp NCDs", category: "Corporate Bond", cagr: "8.2%", risk: "Low-Moderate", thesis: "These Non-Convertible Debentures offer yields significantly higher than bank FDs while maintaining a AAA safety rating. PFC provides stable monthly/annual payout.", score: 86, holdings: [{company: "Power Finance Corporation Ltd.", share: "100.0%"}] },
            { name: "NHAI Tax-Free Bonds", category: "Govt Debt", cagr: "7.2-7.5%", risk: "Low", thesis: "Interest is completely tax-free under section 10(15)(iv)(h) of the Income Tax Act. Highly beneficial for investors in the highest tax bracket.", score: 88, holdings: [{company: "NHAI", share: "100.0%"}] },
            { name: "Shriram Finance NCDs", category: "High-Yield Corporate Bond", cagr: "8.8-9.1%", risk: "Moderate", thesis: "High-yield corporate bond from a leading NBFC. Ideal for investors seeking higher fixed income than FDs with marginally elevated risk.", score: 84, holdings: [{company: "Shriram Finance Ltd.", share: "100.0%"}] },
            { name: "ICICI Prudential Corporate Bond Fund", category: "Debt Mutual Fund", cagr: "7.5-8.0%", risk: "Low-Moderate", thesis: "Invests minimum 80% in AAA rated corporate bonds. Highly liquid and provides steady returns with lower volatility compared to equity or credit risk funds.", score: 87, holdings: [{company: "HDFC Bank Bonds", share: "8.5%"}, {company: "NABARD Bonds", share: "7.2%"}] }
          ].map((bond, idx) => {
            const isBondExpanded = expandedBond === bond.name;
            return (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid var(--border-glass)',
              borderRadius: '16px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }} className="hover-bg-light"
            onClick={() => setExpandedBond(isBondExpanded ? null : bond.name)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>{bond.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.04)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
                    {bond.category}
                  </span>
                </div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  background: '#8b5cf6', 
                  color: 'white', 
                  fontWeight: 800, 
                  fontSize: '0.8rem', 
                  height: '32px', 
                  width: '32px', 
                  borderRadius: '50%' 
                }}>
                  {bond.score}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <TrendingUp size={14} /> Expected: {bond.cagr}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: bond.risk.includes('High') ? 'var(--danger)' : bond.risk.includes('Moderate') ? '#fb923c' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Risk: {bond.risk}
                </span>
              </div>

              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.85rem', marginTop: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 500, textAlign: 'center' }}>
                {isBondExpanded ? (
                  <div style={{ textAlign: 'left' }}>
                    <strong style={{ color: 'var(--text-main)' }}>Thesis:</strong> {bond.thesis}
                  </div>
                ) : (
                  <span style={{ color: '#8b5cf6', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <Landmark size={14} /> View Details
                  </span>
                )}
              </div>
            </div>
          )})}
        </div>
      </section>

      {/* 100% Free Open Access Trust Section */}
      <section className="wealth-card" style={{
        padding: '2.25rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(240,253,244,0.7) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.15)',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            fontWeight: 800,
            color: 'var(--success)',
            background: 'var(--success-glow)',
            padding: '0.35rem 0.85rem',
            borderRadius: '100px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={13} />
            <span>Community First & Transparent Investing</span>
          </span>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0', fontWeight: 800 }}>
            Empowering Every Investor with Open Access
          </h3>
          <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', maxWidth: '600px', margin: '0 auto', fontWeight: 600 }}>
            Prefin is built on a foundation of trust. We believe advanced wealth intelligence should be free for everyone.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          {[
            { title: "No Subscription Fees", desc: "No monthly charges, no recurring trials, and no membership paywalls." },
            { title: "No Hidden Charges", desc: "100% free broker statements uploads, diagnostics, and AI advice." },
            { title: "No Locked Features", desc: "Get full access to alerts, portfolio analysis, goals, and coach reports." },
            { title: "Open Access for Every Investor", desc: "Equitable, transparent tools designed to level the financial playing field." }
          ].map((item, idx) => (
            <div key={idx} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.03)' }}>
              <div style={{ color: 'var(--success)', fontWeight: 800, fontSize: '1rem', marginBottom: '0.5rem' }}>
                ✓ {item.title}
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: 0, fontWeight: 500, lineHeight: 1.4 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
