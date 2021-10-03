

const express = require('express');
const axios = require('axios');
const port = process.env['PORT'] || 8080;


const app = express();

app.use("/", express.static(__dirname+"/public"));

app.get('/sigmet', (req, res) => {
  console.log("GET initiated");
  axios.get('https://www.aviationweather.gov/cgi-bin/json/IsigmetJSON.php')
  .then(response => {
    res.json(response.data);
    console.log(response.data.features[5]);
  });
  console.log("Fetched and returned to client");
});

app.listen(port, () => {
  console.log('server started');
});