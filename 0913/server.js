const path = require('path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// 키 없으면 중단
if (!process.env.API_KEY) {
  console.error('API_KEY를 읽을 수 없음');
  process.exit(1);
}

const API_KEY = process.env.API_KEY;

async function getNews() {
  try {
    // 한국 키워드로 뉴스 5개 가져오기
    const res = await fetch(
      `https://newsapi.org/v2/everything?q=한국&pageSize=5&sortBy=publishedAt&language=ko&apiKey=${API_KEY}`
    );
    const data = await res.json();

    if (data.status !== 'ok') {
      throw new Error(data.message || 'API 응답 오류');
    }

    if (data.articles.length === 0) {
      console.log('뉴스가 없음이슈');
      return;
    }

    console.log('오늘의 한국 뉴스');
    data.articles.forEach((a, i) => {
      console.log(`${i + 1}. ${a.title}`);
      console.log(` 출처: ${a.source.name}`);
      console.log(` 날짜: ${a.publishedAt}`);
      console.log(` 링크: ${a.url}`);
      console.log('');
    });

  } catch (err) {
    console.error('API 호출 실패:', err);
  }
}

getNews();
