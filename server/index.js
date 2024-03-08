const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 5001;

app.use(cors({
  origin: 'http://localhost:3001',
}));



app.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;
    console.log('Location:', location); // Log the location received from the request

    const apiKey = '93a3ac78712f16d2baeed45476a4c87e';
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}`;

    // Fetch current weather data
    const currentWeatherResponse = await axios.get(currentWeatherUrl);
    console.log('Current Weather Response:', currentWeatherResponse.data); // Log the current weather data received

    const currentWeatherData = currentWeatherResponse.data;

    // Extract latitude and longitude from current weather data
    const { lat, lon } = currentWeatherData.coord;
    console.log('Latitude:', lat, 'Longitude:', lon); // Log the latitude and longitude

    // Fetch 5-day forecast based on latitude and longitude
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    console.log('Forecast URL:', forecastUrl); // Log the forecast API URL

    const forecastResponse = await axios.get(forecastUrl);
    console.log('Forecast Response:', forecastResponse.data); // Log the forecast data received

    const forecastData = forecastResponse.data;

    res.json({ currentWeather: currentWeatherData, forecast: forecastData });
  } catch (error) {
    console.error('Error fetching weather data:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
  
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
