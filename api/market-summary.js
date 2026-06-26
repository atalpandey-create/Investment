export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const stockMetadataMap = {
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

  let cachedCookies = '';
  let cookieExpiry = 0;

  async function getCookies() {
    const now = Date.now();
    if (cachedCookies && now < cookieExpiry) {
      return cachedCookies;
    }
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.nseindia.com/',
    };
    const response = await fetch('https://www.nseindia.com/', { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch cookies: ${response.status}`);
    }
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      if (Array.isArray(setCookieHeader)) {
        cachedCookies = setCookieHeader.map(c => c.split(';')[0]).join('; ');
      } else {
        cachedCookies = setCookieHeader.split(/, (?=[^;]+=[^;]+;)/).map(c => c.split(';')[0]).join('; ');
      }
    }
    cookieExpiry = now + 5 * 60 * 1000;
    return cachedCookies;
  }

  async function fetchNSE(url, referer, retries = 1) {
    try {
      const cookies = await getCookies();
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': referer,
        'Cookie': cookies
      };
      const response = await fetch(url, { headers });
      if ((response.status === 401 || response.status === 403) && retries > 0) {
        cachedCookies = '';
        return fetchNSE(url, referer, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        cachedCookies = '';
        return fetchNSE(url, referer, retries - 1);
      }
      throw error;
    }
  }

  async function getConsolidatedMarketData() {
    const startTime = Date.now();
    
    // 1. Fetch NSE data and Yahoo Finance basic data in parallel
    const [nseIndicesRes, nseGainersRes, usdInrRes, sensexRes, goldRes, silverRes] = await Promise.all([
      fetchNSE('https://www.nseindia.com/api/allIndices', 'https://www.nseindia.com/market-data/live-market-indices'),
      fetchNSE('https://www.nseindia.com/api/live-analysis-variations?index=gainers', 'https://www.nseindia.com/market-data/live-equity-market'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/INR%3DX?interval=1d&range=1d'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/%5EBSESN?interval=1d&range=1d'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC%3DF?interval=1d&range=1d'),
      fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI%3DF?interval=1d&range=1d'),
    ]);

    if (!nseIndicesRes.ok) throw new Error(`NSE indices fetch failed with status ${nseIndicesRes.status}`);
    if (!nseGainersRes.ok) throw new Error(`NSE gainers fetch failed with status ${nseGainersRes.status}`);

    const nseData = await nseIndicesRes.json();
    const nseGainers = await nseGainersRes.json();
    
    let usdInrVal = 83.56;
    let usdInrPrev = 83.52;
    
    if (usdInrRes.ok) {
      const usdInrJson = await usdInrRes.json();
      const meta = usdInrJson.chart?.result?.[0]?.meta;
      if (meta) {
        usdInrVal = meta.regularMarketPrice || 83.56;
        usdInrPrev = meta.chartPreviousClose || 83.52;
      }
    }

    const yahooQuotes = {};
    const processYahooResult = async (res, name) => {
      if (res.ok) {
        const json = await res.json();
        const meta = json.chart?.result?.[0]?.meta;
        if (meta) {
          let price = meta.regularMarketPrice;
          let prevClose = meta.chartPreviousClose;

          if (name === 'GOLD') {
            price = (price / 31.1034768) * 10 * usdInrVal;
            prevClose = (prevClose / 31.1034768) * 10 * usdInrPrev;
          } else if (name === 'SILVER') {
            price = (price / 31.1034768) * 1000 * usdInrVal;
            prevClose = (prevClose / 31.1034768) * 1000 * usdInrPrev;
          }

          const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
          yahooQuotes[name] = { price, change, base: prevClose, isNse: false };
        }
      }
    };

    await Promise.all([
      processYahooResult(sensexRes, 'SENSEX'),
      processYahooResult(goldRes, 'GOLD'),
      processYahooResult(silverRes, 'SILVER')
    ]);

    const usdInrChange = ((usdInrVal - usdInrPrev) / usdInrPrev) * 100;
    yahooQuotes['USD/INR'] = { price: usdInrVal, change: usdInrChange, base: usdInrPrev, isNse: false };

    // Map indices
    const indices = {};
    const indexMappings = {
      'NIFTY 50': 'NIFTY 50',
      'NIFTY NEXT 50': 'NIFTY NEXT 50',
      'NIFTY BANK': 'NIFTY BANK',
      'NIFTY FINANCIAL SERVICES': 'NIFTY FINANCIAL SERVICES',
      'NIFTY MIDCAP': 'NIFTY MIDCAP 100',
      'NIFTY SMALLCAP': 'NIFTY SMALLCAP 100'
    };

    const nseIndicesList = nseData.data || [];
    Object.keys(indexMappings).forEach(key => {
      const nseIndexName = indexMappings[key];
      const match = nseIndicesList.find(d => d.index === nseIndexName);
      if (match) {
        indices[key] = {
          price: match.last,
          change: match.percentChange,
          base: match.previousClose,
          isNse: true,
          timestamp: nseData.timestamp
        };
      }
    });

    // Merge Yahoo assets
    Object.keys(yahooQuotes).forEach(key => {
      indices[key] = yahooQuotes[key];
    });

    // Top gainers with sparklines
    const top10 = (nseGainers.FOSec?.data || []).slice(0, 10);
    const gainers = await Promise.all(top10.map(async (stk) => {
      const meta = stockMetadataMap[stk.symbol] || { name: stk.symbol, sector: 'Diversified' };
      let sparkline = [];
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${stk.symbol}.NS?range=5d&interval=1h`);
        if (res.ok) {
          const json = await res.json();
          const prices = json.chart?.result?.[0]?.indicators?.quote?.[0]?.close || [];
          const timestamps = json.chart?.result?.[0]?.timestamp || [];
          const pts = [];
          for (let i = 0; i < prices.length; i++) {
            if (prices[i] !== null && timestamps[i]) {
              const date = new Date(timestamps[i] * 1000);
              const timeString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
              pts.push({ id: i, time: timeString, value: prices[i] });
            }
          }
          sparkline = pts;
        }
      } catch (e) {
        // ignore
      }
      return {
        symbol: stk.symbol,
        name: meta.name,
        sector: meta.sector,
        price: stk.ltp,
        change: stk.perChange,
        sparkline: sparkline
      };
    }));

    const responseTime = Date.now() - startTime;
    return {
      timestamp: nseData.timestamp,
      indices,
      gainers,
      health: {
        responseTime,
        status: 'OK',
        freshness: new Date().toISOString()
      }
    };
  }

  try {
    const summaryData = await getConsolidatedMarketData();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(summaryData);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ error: error.message });
  }
}
