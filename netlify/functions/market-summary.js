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

  async function getYahooData() {
    const startTime = Date.now();
    
    // Indices and Commodities
    const indicesSymbols = [
      { sym: '^NSEI', name: 'NIFTY 50' },
      { sym: '^NSEBANK', name: 'NIFTY BANK' },
      { sym: 'NIFTY_FIN_SERVICE.NS', name: 'NIFTY FINANCIAL SERVICES' },
      { sym: '^NSMIDCP', name: 'NIFTY MIDCAP' },
      { sym: '^CNXSC', name: 'NIFTY SMALLCAP' },
      { sym: '^BSESN', name: 'SENSEX' },
      { sym: 'GC=F', name: 'GOLD' },
      { sym: 'SI=F', name: 'SILVER' },
      { sym: 'INR=X', name: 'USD/INR' }
    ];

    const stockSymbols = Object.keys(stockMetadataMap);
    
    // Fetch all symbols in parallel from Yahoo Finance
    const fetchPromises = [...indicesSymbols.map(i => i.sym), ...stockSymbols].map(async sym => {
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=5d`);
        if (res.ok) {
          const json = await res.json();
          const result = json.chart?.result?.[0];
          const meta = result?.meta;
          const timestamps = result?.timestamp || [];
          const prices = result?.indicators?.quote?.[0]?.close || [];
          
          if (meta) {
            return {
              symbol: sym,
              price: meta.regularMarketPrice,
              prevClose: meta.chartPreviousClose,
              change: meta.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose) / meta.chartPreviousClose) * 100 : 0,
              timestamps,
              prices
            };
          }
        }
        return { symbol: sym, error: res.status };
      } catch (e) {
        return { symbol: sym, error: e.message };
      }
    });

    const results = await Promise.all(fetchPromises);
    
    // Extract USD/INR for Gold/Silver conversion
    const usdInrResult = results.find(r => r.symbol === 'INR=X');
    const usdInrVal = usdInrResult?.price || 83.50;
    const usdInrPrev = usdInrResult?.prevClose || 83.50;

    const indices = {};
    indicesSymbols.forEach(({ sym, name }) => {
      const data = results.find(r => r.symbol === sym);
      if (data && !data.error) {
        let price = data.price;
        let prevClose = data.prevClose;
        
        // Convert Gold/Silver to INR per 10g / 1kg
        if (name === 'GOLD') {
          price = (price / 31.1034768) * 10 * usdInrVal;
          prevClose = (prevClose / 31.1034768) * 10 * usdInrPrev;
        } else if (name === 'SILVER') {
          price = (price / 31.1034768) * 1000 * usdInrVal;
          prevClose = (prevClose / 31.1034768) * 1000 * usdInrPrev;
        }
        
        const change = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
        indices[name] = {
          price: price,
          change: change,
          base: prevClose,
          isNse: name.includes('NIFTY'),
          timestamp: new Date().toISOString()
        };
      }
    });

    // Determine Top Gainers
    const stocksData = stockSymbols
      .map(sym => results.find(r => r.symbol === sym))
      .filter(data => data && !data.error)
      .sort((a, b) => b.change - a.change)
      .slice(0, 10); // Top 10 Gainers

    const gainers = stocksData.map(stk => {
      const meta = stockMetadataMap[stk.symbol];
      
      // Build Sparkline
      const sparkline = [];
      for (let i = 0; i < stk.prices.length; i++) {
        if (stk.prices[i] !== null && stk.timestamps[i]) {
          const date = new Date(stk.timestamps[i] * 1000);
          const timeString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' });
          sparkline.push({ id: i, time: timeString, value: stk.prices[i] });
        }
      }

      return {
        symbol: stk.symbol.replace('.NS', ''),
        name: meta.name,
        sector: meta.sector,
        price: stk.price,
        change: stk.change,
        sparkline: sparkline
      };
    });

    const responseTime = Date.now() - startTime;
    return {
      timestamp: new Date().toISOString(),
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
    const summaryData = await getYahooData();
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
