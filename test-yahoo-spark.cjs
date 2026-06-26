const fetch = globalThis.fetch;

async function testYahooSpark() {
  const symbols = 'TRENT.NS,RELIANCE.NS,SBIN.NS,^NSEI,^NSEBANK';
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&interval=1d&range=1d`);
    if (res.ok) {
      const data = await res.json();
      console.log("Spark OK:");
      for (const symbol in data) {
        const d = data[symbol];
        console.log(symbol, d.regularMarketPrice, d.regularMarketPreviousClose);
      }
    } else {
      console.log("FAILED:", res.status);
    }
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
testYahooSpark();
