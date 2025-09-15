const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("env 경로:", path.join(__dirname, '../.env'));
console.log("WEATHER_KEY:", process.env.WEATHER_KEY);
