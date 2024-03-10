const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Your Express application is running on Vercel!');
});

app.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;

    const apiKey = '93a3ac78712f16d2baeed45476a4c87e';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    // Fetch current weather data
    const currentWeatherResponse = await axios.get(currentWeatherUrl);
    const currentWeatherData = currentWeatherResponse.data;

    // Extract latitude and longitude from current weather data
    const { lat, lon } = currentWeatherData.coord;

    // Fetch 5-day forecast based on latitude and longitude
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const forecastResponse = await axios.get(forecastUrl);
    const forecastData = forecastResponse.data;

    res.json({ currentWeather: currentWeatherData, forecast: forecastData });
    
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

module.exports = app;
