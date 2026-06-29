const https = require('https');

https.get('https://www.indiabonds.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    const nextDataMatch = data.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (nextDataMatch && nextDataMatch[1]) {
      try {
        const json = JSON.parse(nextDataMatch[1]);
        if (json.props.pageProps) {
           console.log("defaultBondsResult:", JSON.stringify(json.props.pageProps.defaultBondsResult, null, 2).substring(0, 1000));
        }
      } catch (e) {
        console.log("Error parsing JSON", e);
      }
    } else {
      console.log("No __NEXT_DATA__ found");
    }
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
