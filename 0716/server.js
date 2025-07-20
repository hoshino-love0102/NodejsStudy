const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const querystring = require('querystring');
const bcrypt = require('bcrypt');

// DB 연결
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678', // 직접 비밀번호 넣음
  database: 'savedb' // DB 이름 직접 지정
});

// DB 연결 확인
connection.connect(err => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
  } else {
    console.log('DB 연결 성공');
  }
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

      if (!name || !email || !password) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('입력값이 올바르지 않습니다.');
      }

      const saltRounds = 10;
      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('비밀번호 암호화 에러');
        }

        const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        connection.query(sql, [name, email, hash], (err) => {
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
    });

  } else {
    // 나머지 요청은 404 처리
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('페이지를 찾을 수 없습니다.');
  }
});

// 서버 실행
server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
