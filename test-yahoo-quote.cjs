const fetch = globalThis.fetch;

async function testYahooQuote() {
  const symbols = 'TRENT.NS,RELIANCE.NS,SBIN.NS,^NSEI,^NN50,^CRSMY,^CNXMC';
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`);
    if (res.ok) {
      const data = await res.json();
      console.log("Quotes found:");
      data.quoteResponse.result.forEach(q => {
        console.log(q.symbol, q.regularMarketPrice, q.regularMarketChangePercent);
      });
    } else {
      console.log("FAILED:", res.status);
    }
  } catch (e) {
    console.log("ERROR:", e.message);
  }
}
testYahooQuote();
