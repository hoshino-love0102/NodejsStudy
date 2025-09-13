const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../.env'); // 0913 기준 루트로 이동
console.log('찾으려는 .env 경로:', envPath);
console.log('파일 존재 여부:', fs.existsSync(envPath));

dotenv.config({ path: envPath });

console.log('읽은 API_KEY:', process.env.API_KEY);
