const fetch = globalThis.fetch;

async function testYahoo(symbol) {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);
    if (res.ok) {
      const data = await res.json();
      const meta = data.chart?.result?.[0]?.meta;
      console.log(symbol, "-> OK:", meta?.regularMarketPrice);
    } else {
      console.log(symbol, "-> FAILED:", res.status);
    }
  } catch (e) {
    console.log(symbol, "-> ERROR:", e.message);
  }
}

async function run() {
  const symbols = [
    '^NSEI', // NIFTY 50
    '^NSEBANK', // NIFTY BANK
    '^CNX100', // NIFTY 100
    '^NSMIDCP', // NIFTY MIDCAP 50
    '^CNXSC', // NIFTY SMALLCAP
    'NIFTY_FIN_SERVICE.NS' // NIFTY FIN
  ];
  for (const s of symbols) {
    await testYahoo(s);
  }
}
run();
