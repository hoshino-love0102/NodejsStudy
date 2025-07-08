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
        res.end('서버 오류');
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
          res.end('DB 오류: ' + err.message);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('저장 성공! ID: ' + results.insertId);
        }
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('페이지 없음');
  }
});

server.listen(3000, () => {
  console.log('서버 실행 중! http://localhost:3000');
});