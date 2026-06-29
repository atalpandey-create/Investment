const yahooFinance = require('yahoo-finance2').default;

async function test() {
  try {
    const quotes = await yahooFinance.quote(['RELIANCE.NS', 'TCS.NS', '^NSEI']);
    console.log(quotes.map(q => `${q.symbol}: ${q.regularMarketPrice}`));
    
    const chart = await yahooFinance.chart('RELIANCE.NS', { period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), interval: '1d' });
    console.log(chart.quotes.length, 'days of chart data for reliance');
  } catch(e) {
    console.error(e);
  }
}
test();
