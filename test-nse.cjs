const fetch = require('node-fetch') || globalThis.fetch;

let cachedCookies = '';
let cookieExpiry = 0;

async function getCookies() {
  const now = Date.now();
  if (cachedCookies && now < cookieExpiry) return cachedCookies;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.nseindia.com/',
  };
  console.log("Fetching cookies...");
  const response = await fetch('https://www.nseindia.com/', { headers });
  if (!response.ok) throw new Error(`Cookie fetch failed: ${response.status}`);
  
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

async function testNSE() {
  try {
    const cookies = await getCookies();
    console.log("Cookies obtained");
    
    const url = 'https://www.nseindia.com/api/allIndices';
    const referer = 'https://www.nseindia.com/market-data/live-market-indices';
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': referer,
      'Cookie': cookies
    };
    console.log("Fetching API...");
    const res = await fetch(url, { headers });
    console.log("Status:", res.status);
    if (!res.ok) {
      console.log("Response text:", await res.text());
    } else {
      const data = await res.json();
      console.log("Success! Data length:", data.data?.length);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
testNSE();
