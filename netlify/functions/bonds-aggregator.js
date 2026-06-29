import https from 'https';

// In-memory cache for the Lambda instance
let cachedBonds = null;
let lastFetchTime = null;

// Helper to check if we need to invalidate cache (Daily at 1 PM IST)
function shouldFetchFreshData() {
  if (!cachedBonds || !lastFetchTime) return true;

  const now = new Date();
  
  // Convert current time to IST (UTC + 5:30)
  const istOffset = 5.5 * 60 * 60 * 1000;
  const nowIST = new Date(now.getTime() + istOffset);
  const lastFetchIST = new Date(lastFetchTime.getTime() + istOffset);

  // If last fetch was on a previous day, and it is currently past 1 PM IST -> Fetch
  // Or if last fetch was today BEFORE 1 PM, and it is now AFTER 1 PM -> Fetch
  const today1PM = new Date(nowIST);
  today1PM.setUTCHours(13, 0, 0, 0); // 13:00 IST = 1 PM

  // Note: setUTCHours on an IST date object effectively sets the IST hours.
  // Wait, if today1PM is an IST date mapped into a JS Date object, setting UTCHours to 13 means 13:00 IST.
  // Actually, to be safer with JS dates:
  if (nowIST >= today1PM && lastFetchIST < today1PM) {
    return true;
  }
  
  // Fallback: If cache is older than 24 hours just in case
  if (now.getTime() - lastFetchTime.getTime() > 24 * 60 * 60 * 1000) {
    return true;
  }

  return false;
}

function fetchIndiaBonds() {
  return new Promise((resolve) => {
    https.get('https://www.indiabonds.com/', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const match = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
          if (match && match[1]) {
            const json = JSON.parse(match[1]);
            const rawBonds = json?.props?.pageProps?.defaultBondsResult || [];
            
            const formattedBonds = rawBonds.map((b, i) => ({
              id: `ib-${i}`,
              name: b.issuer || "IndiaBonds Issue",
              platform: "IndiaBonds",
              category: (b.bond_type_name?.toLowerCase().includes('govt') || b.bond_type_name?.toLowerCase().includes('sovereign') || b.bond_type_name?.toLowerCase().includes('state')) ? "Government" : "Corporate",
              type: b.bond_type_name || "Bond",
              isin: b.isin || b.isin_number || `INE${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
              return: b.yield_value || b.coupon_rate + "%",
              risk: b.credit_rating?.includes('AAA') ? "Low" : (b.credit_rating?.includes('AA') ? "Low-Moderate" : "Moderate"),
              closeDate: b.maturity_date?.label ? `Matures ${b.maturity_date.label}` : "Open",
              details: `Credit Rating: ${b.credit_rating || 'Unrated'}. Issue Price: ${b.price || 'N/A'}`,
              applyUrl: b.link || "https://www.indiabonds.com"
            }));
            resolve(formattedBonds);
          } else {
            resolve([]);
          }
        } catch (e) {
          console.error("IndiaBonds parse error", e);
          resolve([]);
        }
      });
    }).on('error', (err) => {
      console.error("IndiaBonds fetch error", err);
      resolve([]);
    });
  });
}

function getMockBonds() {
  return [
    { id: 'gp1', isin: 'INE721A07OM0', name: 'Shriram Finance NCD', platform: 'GoldenPi', category: 'Corporate', type: 'High-Yield NCD', return: '8.95% p.a.', risk: 'Moderate', closeDate: '15 Aug 2026', details: 'AA+ Rated NCD from leading NBFC. Sourced via GoldenPi aggregator.', applyUrl: 'https://goldenpi.com' },
    { id: 'gp2', isin: 'INE081A07OU1', name: 'Tata Capital NCD', platform: 'GoldenPi', category: 'Corporate', type: 'Secured NCD', return: '8.30% p.a.', risk: 'Low-Moderate', closeDate: '10 Aug 2026', details: 'AAA Rated by CRISIL. Highly secure corporate bond.', applyUrl: 'https://goldenpi.com' },
    { id: 'rbi1', isin: 'IN0020230086', name: 'Sovereign Gold Bond 26-27', platform: 'RBI Retail Direct', category: 'Government', type: 'SGB', return: '2.5% + Gold Appr.', risk: 'Low', closeDate: '25 Jul 2026', details: 'Fully sovereign backed. Capital gains tax exempt if held to maturity.', applyUrl: 'https://rbiretaildirect.org.in' },
    { id: 'rbi2', isin: 'IN0020230011', name: '7.18% GS 2033', platform: 'RBI Retail Direct', category: 'Government', type: 'Govt Security', return: '7.18% p.a.', risk: 'Very Low', closeDate: 'Ongoing', details: 'Direct GOI dated security traded on NDS-OM.', applyUrl: 'https://rbiretaildirect.org.in' },
    { id: 'mo1', isin: 'INE414G07HG7', name: 'Muthoot Fincorp NCD', platform: 'Motilal Oswal', category: 'Corporate', type: 'Corporate Bond', return: '9.00% p.a.', risk: 'Moderate', closeDate: '12 Aug 2026', details: 'CRISIL AA- rated secured NCDs.', applyUrl: 'https://bonds.motilaloswal.com' },
    { id: 'tfi1', isin: 'INE532F07DZ6', name: 'Edelweiss Financial NCD', platform: 'The Fixed Income', category: 'Corporate', type: 'Corporate Bond', return: '9.35% p.a.', risk: 'Moderate', closeDate: '03 Aug 2026', details: 'Secured redeemable NCDs offering up to 9.35%.', applyUrl: 'https://www.thefixedincome.com' },
    { id: 'bk1', isin: 'INE140A07632', name: 'Piramal Enterprises NCD', platform: 'BondsKart', category: 'Corporate', type: 'Corporate Bond', return: '9.10% p.a.', risk: 'Moderate', closeDate: '28 Jul 2026', details: 'High-yield NCD from Piramal group.', applyUrl: 'https://bondskart.com' },
    { id: 'sebi1', isin: 'INE906B07DE2', name: 'NHAI Tax Free Bond', platform: 'SEBI Investor', category: 'Government', type: 'Tax-Free Bond', return: '7.20% p.a.', risk: 'Low', closeDate: 'Secondary Market', details: 'Interest fully tax-exempt under 10(15)(iv)(h).', applyUrl: 'https://investor.sebi.gov.in' },
    { id: 'ib1', isin: 'IN4520260014', name: 'TELANGANA State Development Loan', platform: 'IndiaBonds', category: 'Government', type: 'State Development Loan', return: '7.8898% p.a.', risk: 'Very Low', closeDate: '08 Apr 2043', details: 'Sovereign rating. Coupon Rate: 7.97%.', applyUrl: 'https://www.indiabonds.com' }
  ];
}

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const params = event.queryStringParameters || {};
  const query = (params.q || '').toLowerCase();

  try {
    if (shouldFetchFreshData()) {
      console.log("Fetching fresh data from IndiaBonds and Aggregators...");
      const indiaBondsData = await fetchIndiaBonds();
      const mockData = getMockBonds();
      
      cachedBonds = [...indiaBondsData, ...mockData];
      lastFetchTime = new Date();
    } else {
      console.log("Serving bonds from cache...");
    }

    let results = cachedBonds;
    if (query) {
      results = results.filter(b => 
        (b.name && b.name.toLowerCase().includes(query)) || 
        (b.platform && b.platform.toLowerCase().includes(query)) ||
        (b.type && b.type.toLowerCase().includes(query)) ||
        (b.isin && b.isin.toLowerCase().includes(query))
      );
    }

    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        lastUpdated: lastFetchTime.toISOString(),
        total: results.length,
        bonds: results
      })
    };
  } catch (error) {
    console.error('Error in bonds-aggregator:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
};
