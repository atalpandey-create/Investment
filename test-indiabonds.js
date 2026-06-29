const https = require('https');

https.get('https://www.indiabonds.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("Status Code:", res.statusCode);
    console.log("Data snippet:", data.substring(0, 500));
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
