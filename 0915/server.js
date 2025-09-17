const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_KEY = process.env.WEATHER_KEY;
console.log('env 경로:', path.join(__dirname, '../.env'));
console.log('WEATHER_KEY:', API_KEY);

if (!API_KEY) {
  console.error('WEATHER_KEY 못읽음');
  process.exit(1);
}

const city = process.argv[2] || 'Daegu';

async function getWeather(cityName) {
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`;
    console.log('호출할 URL:', apiUrl);

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.cod !== 200) {
      throw new Error(data.message || `API 오류 (code: ${data.cod})`);
    }

    console.log(`\n${data.name} 날씨 정보`);
    console.log(`온도: ${data.main.temp}°C (체감: ${data.main.feels_like}°C)`);
    console.log(`날씨: ${data.weather[0].description}`);
    console.log(`풍속: ${data.wind.speed} m/s`);
    console.log(`습도: ${data.main.humidity}%\n`);
  } catch (err) {
    console.error('날씨 API 호출 실패:', err);
  }
}

getWeather(city);
