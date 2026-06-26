import { handler } from './netlify/functions/market-summary.js';

async function run() {
  const result = await handler({ httpMethod: 'GET' });
  console.log(result.statusCode);
  const body = JSON.parse(result.body);
  console.log("Indices:", Object.keys(body.indices));
  console.log("Gainers:", body.gainers.map(g => g.symbol));
}
run();
