const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const querystring = require('querystring');

// DB 연결
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'testdb'
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const parsed = querystring.parse(body);
      const name = parsed.name;
      const email = parsed.email;

      const sql = 'INSERT INTO users (name, email) VALUES (?, ?)';
      connection.query(sql, [name, email], (err, results) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('DB error: ' + err.message);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('Save success! ID: ' + results.insertId);
        }
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Page not found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});