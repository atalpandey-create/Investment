export const handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const stockMetadataMap = {
    'RELIANCE.NS': { name: 'Reliance Industries', sector: 'Conglomerate' },
    'TCS.NS': { name: 'Tata Consultancy Services', sector: 'IT Services' },
    'HDFCBANK.NS': { name: 'HDFC Bank', sector: 'Banking' },
    'ICICIBANK.NS': { name: 'ICICI Bank', sector: 'Banking' },
    'BHARTIARTL.NS': { name: 'Bharti Airtel', sector: 'Telecom' },
    'INFY.NS': { name: 'Infosys', sector: 'IT Services' },
    'SBIN.NS': { name: 'State Bank of India', sector: 'Banking' },
    'ITC.NS': { name: 'ITC Limited', sector: 'Consumer Goods' },
    'LT.NS': { name: 'Larsen & Toubro', sector: 'Infrastructure' },
    'BAJFINANCE.NS': { name: 'Bajaj Finance', sector: 'Finance' },
    'HINDUNILVR.NS': { name: 'Hindustan Unilever', sector: 'Consumer Goods' },
    'TATAMOTORS.NS': { name: 'Tata Motors', sector: 'Automobile' },
    'TATASTEEL.NS': { name: 'Tata Steel', sector: 'Metals' },
    'M&M.NS': { name: 'Mahindra & Mahindra', sector: 'Automobile' },
    'MARUTI.NS': { name: 'Maruti Suzuki', sector: 'Automobile' },
    'SUNPHARMA.NS': { name: 'Sun Pharma', sector: 'Pharmaceuticals' },
    'NTPC.NS': { name: 'NTPC Limited', sector: 'Power' },
    'KOTAKBANK.NS': { name: 'Kotak Mahindra Bank', sector: 'Banking' },
    'TITAN.NS': { name: 'Titan Company', sector: 'Consumer Goods' },
    'POWERGRID.NS': { name: 'Power Grid', sector: 'Power' },
    'TRENT.NS': { name: 'Trent Limited', sector: 'Retail' },
    'BAJAJFINSV.NS': { name: 'Bajaj Finserv', sector: 'Finance' },
    'ASIANPAINT.NS': { name: 'Asian Paints', sector: 'Consumer Goods' },
    'WIPRO.NS': { name: 'Wipro Limited', sector: 'IT Services' },
    'HCLTECH.NS': { name: 'HCL Technologies', sector: 'IT Services' }
  };

  function generateDynamicMockData() {
    const indicesSymbols = [
      { sym: '^NSEI', name: 'NIFTY 50', base: 23850 },
      { sym: '^NSEBANK', name: 'NIFTY BANK', base: 51912 },
      { sym: 'NIFTY_FIN_SERVICE.NS', name: 'NIFTY FINANCIAL SERVICES', base: 23310 },
      { sym: '^NSMIDCP', name: 'NIFTY MIDCAP', base: 57396 },
      { sym: '^CNXSC', name: 'NIFTY SMALLCAP', base: 18178 },
      { sym: '^BSESN', name: 'SENSEX', base: 78600 },
      { sym: 'GC=F', name: 'GOLD', base: 7295 },
      { sym: 'SI=F', name: 'SILVER', base: 93.25 },
      { sym: 'INR=X', name: 'USD/INR', base: 83.52 }
    ];

    const indices = {};
    const now = Date.now();
    const noise = Math.sin(now / 10000) * 0.005; // small fluctuation

    indicesSymbols.forEach(({ name, base }) => {
      const volatility = name === 'USD/INR' ? 0.001 : 0.015;
      const variation = base * (noise * volatility * 100);
      const price = base + variation + (Math.random() * base * 0.001);
      const change = ((price - base) / base) * 100;
      
      indices[name] = {
        price,
        change,
        base,
        isNse: name.includes('NIFTY'),
        timestamp: new Date().toISOString()
      };
    });

    const gainers = [
      { symbol: 'TRENT', name: 'Trent Limited', sector: 'Retail', price: 5432.10 + Math.random() * 20, change: 4.5 + Math.random(), sparkline: [] },
      { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Finance', price: 1654.80 + Math.random() * 10, change: 3.2 + Math.random(), sparkline: [] },
      { symbol: 'SBIN', name: 'State Bank of India', sector: 'Banking', price: 845.60 + Math.random() * 5, change: 2.8 + Math.random(), sparkline: [] },
      { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals', price: 154.50 + Math.random() * 2, change: 2.1 + Math.random(), sparkline: [] },
      { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', price: 1622.80 + Math.random() * 10, change: 1.95 + Math.random(), sparkline: [] }
    ];

    gainers.forEach(g => {
      let p = g.price * 0.95;
      for (let i = 0; i < 5; i++) {
        p = p + (Math.random() * p * 0.02);
        g.sparkline.push({ id: i, time: `Day ${i+1}`, value: p });
      }
    });

    return {
      timestamp: new Date().toISOString(),
      indices,
      gainers,
      health: {
        responseTime: 45,
        status: 'OK',
        freshness: new Date().toISOString()
      }
    };
  }

  try {
    const summaryData = generateDynamicMockData();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(summaryData)
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
