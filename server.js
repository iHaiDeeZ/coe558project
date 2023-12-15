// run `node index.js` in the terminal
const express = require('express');
const app = express();
const port = 7000
app.get('/', (req, res) => {
  res.send('Home Route')
})

// SPA (return a JSON object)
app.get('/json', (req, res) => {
  res.json( {"name": "Ali Ahmad", "id": 12345678} )
})


app.listen(port, function() {
  console.log(`Example app listening on port ${port}`)
})