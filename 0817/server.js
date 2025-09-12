const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const querystring = require('querystring');
const bcrypt = require('bcrypt');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'savedb'
});

connection.connect(err => {
  if (err) {
    console.error('DB 연결 실패:', err.message);
  } else {
    console.log('DB 연결 성공');
  }
});

const server = http.createServer((req, res) => {

  // 메인 페이지
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

  // 회원가입 처리
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
            console.error(`[SIGNUP FAIL] email: ${email}, DB error: ${err.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('DB error: ' + err.message);
          } else {
            console.log(`[SIGNUP SUCCESS] email: ${email}, name: ${name}`);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <!DOCTYPE html>
              <html lang="ko">
                <head><meta charset="UTF-8"><title>가입 완료</title></head>
                <body>
                  <h1>회원가입이 완료되었습니다!</h1>
                  <a href="/">로그인 페이지로 돌아가기</a>
                </body>
              </html>
            `);
          }
        });
      });
    });

  // 로그인 처리
  } else if (req.method === 'POST' && req.url === '/login') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const { email, password } = querystring.parse(body);

      if (!email || !password) {
        res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('이메일/비밀번호를 입력하세요.');
      }

      const sql = 'SELECT * FROM users WHERE email = ?';
      connection.query(sql, [email], (err, results) => {
        if (err) {
          console.error(`[LOGIN ERROR] email: ${email}, DB error: ${err.message}`);
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('DB error: ' + err.message);
        }

        if (results.length === 0) {
          console.warn(`[LOGIN FAIL] email: ${email}, reason: 등록되지 않은 이메일`);
          res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('등록되지 않은 이메일입니다.');
        }

        const user = results[0];
        bcrypt.compare(password, user.password, (err, same) => {
          if (same) {
            console.log(`[LOGIN SUCCESS] email: ${user.email}, name: ${user.name}`);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <!DOCTYPE html>
              <html lang="ko">
                <head><meta charset="UTF-8"><title>로그인 성공</title></head>
                <body>
                  <h1>${user.name}님, 환영합니다!</h1>
                  <a href="/">홈으로</a>
                </body>
              </html>
            `);
          } else {
            console.warn(`[LOGIN FAIL] email: ${email}, reason: 비밀번호 불일치`);
            res.writeHead(401, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('비밀번호가 일치하지 않습니다.');
          }
        });
      });
    });

  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('페이지를 찾을 수 없습니다.');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
