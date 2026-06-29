export const handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  const query = event.queryStringParameters.q;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing query parameter' })
    };
  }

  try {
    const res = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      throw new Error(`Yahoo API returned ${res.status}`);
    }
    const data = await res.json();
    const quotes = data.quotes || [];

    // Filter to only EQUITY, MUTUALFUND, ETF
    const allowedTypes = ['EQUITY', 'MUTUALFUND', 'ETF'];
    const filtered = quotes.filter(q => allowedTypes.includes(q.quoteType));

    // Format for frontend
    const results = filtered.map(q => ({
      name: q.longname || q.shortname || q.symbol,
      ticker: q.symbol,
      type: q.quoteType,
      exchange: q.exchDisp,
      score: q.score
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results)
    };
  } catch (error) {
    console.error('Error in search-asset:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
