const express = require('express');
const app = express();

app.listen(8080, function() {
  console.log('listening on 8080');
});

app.get('/a', function(req, res) {
  res.send('this is a');
});

app.get('/b', function(req, res){
  res.send('this is b');
});