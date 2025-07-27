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
  database: 'test_db'
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      }
    });

  } else if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { name, email, password } = querystring.parse(body);

      const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      connection.query(sql, [name, email, password], (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('DB error: ' + err.message);
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <!DOCTYPE html>
            <html lang="ko">
              <head><meta charset="UTF-8"><title>가입 완료</title></head>
              <body>
                <h1>회원가입이 완료되었습니다!</h1>
                <a href="/">처음으로 돌아가기</a>
              </body>
            </html>
          `);
        }
      });
    });

  } else {
    // 나머지 요청은 404 처리
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('페이지를 찾을 수 없습니다.');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
