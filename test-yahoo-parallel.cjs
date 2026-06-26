const fetch = globalThis.fetch;

async function testParallel() {
  const symbols = [
    '^NSEI', '^NSEBANK', '^BSESN', 'NIFTY_FIN_SERVICE.NS', '^NSMIDCP', '^CNXSC', 
    'GC=F', 'SI=F', 'INR=X', 'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS', 
    'BHARTIARTL.NS', 'INFY.NS', 'SBIN.NS', 'ITC.NS', 'LT.NS', 'BAJFINANCE.NS', 
    'HINDUNILVR.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'M&M.NS', 'MARUTI.NS', 
    'SUNPHARMA.NS', 'NTPC.NS', 'KOTAKBANK.NS', 'TITAN.NS', 'POWERGRID.NS', 
    'TRENT.NS', 'BAJAJFINSV.NS', 'ASIANPAINT.NS', 'WIPRO.NS', 'HCLTECH.NS'
  ];

  console.log(`Fetching ${symbols.length} symbols in parallel...`);
  const start = Date.now();
  
  const results = await Promise.all(symbols.map(async sym => {
    try {
      const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`);
      if (res.ok) {
        const json = await res.json();
        const meta = json.chart?.result?.[0]?.meta;
        return { symbol: sym, price: meta?.regularMarketPrice, change: meta?.chartPreviousClose ? ((meta.regularMarketPrice - meta.chartPreviousClose)/meta.chartPreviousClose)*100 : 0 };
      }
      return { symbol: sym, error: res.status };
    } catch(e) {
      return { symbol: sym, error: e.message };
    }
  }));

  console.log(`Done in ${Date.now() - start}ms`);
  const success = results.filter(r => r.price).length;
  console.log(`Success: ${success}/${symbols.length}`);
  // console.log(results.slice(0, 5));
}
testParallel();
