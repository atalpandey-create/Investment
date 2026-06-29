const https = require('https');

https.get('https://goldenpi.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("GoldenPi Status Code:", res.statusCode);
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
