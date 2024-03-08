import React, { useState, useEffect } from 'react';
import axios from 'axios';

const useStyles = () => ({
  root: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f0f3f3',
    borderRadius: '0.5rem',
  },
  form: {
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
  },
  textField: {
    marginRight: '1rem',
    flex: 1,
  },
  button: {
    marginLeft: '1rem',
  },
  weatherContainer: {
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  weatherItem: {
    padding: '0.75rem',
    border: '2px solid #ccc',
    borderRadius: '0.5rem',
    backgroundColor: '#f9f9f9',
    marginBottom: '1rem',
  },
  loadingIndicator: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1.5rem',
  },
  savedLocationsContainer: {
    marginTop: '1rem',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  savedLocationButton: {
    marginRight: '0.5rem',
    marginBottom: '0.5rem',
    backgroundColor: '#3f51b5',
    color: '#fff',
    '&:hover': {
      backgroundColor: '#303f9f',
    },
  },
});

const WeatherApp = () => {
  const classes = useStyles();
  const [location, setLocation] = useState('');
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState('');
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState('Celsius');
  const [savedLocations, setSavedLocations] = useState([]);

  useEffect(() => {
    const savedLocationsFromStorage = localStorage.getItem('savedLocations');
    if (savedLocationsFromStorage) {
      setSavedLocations(JSON.parse(savedLocationsFromStorage));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedLocations', JSON.stringify(savedLocations));
  }, [savedLocations]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      if (!location) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          const response = await axios.get(`http://localhost:5001/weather?location=${latitude},${longitude}`);
          setCurrentWeather(response.data.currentWeather);
          setForecast(response.data.forecast);
          setLoading(false);
        });
      } else {
        const response = await axios.get(`http://localhost:5001/weather?location=${location}`);
        setCurrentWeather(response.data.currentWeather);
        setForecast(response.data.forecast);
        setLoading(false);
      }
      setError('');
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
      setLoading(false);
    }
  };

  const handleSaveLocation = () => {
    if (location.trim() && !savedLocations.includes(location.trim())) {
      setSavedLocations([...savedLocations, location.trim()]);
    }
  };

  const handleViewSavedLocation = async (savedLocation) => {
    setLocation(savedLocation);
    await fetchWeatherData();
  };

  const kelvinToCelsius = (kelvin) => {
    return kelvin - 273.15;
  };

  const kelvinToFahrenheit = (kelvin) => {
    return (kelvin * 9) / 5 - 459.67;
  };

  const toggleTemperatureUnit = () => {
    setTemperatureUnit((prevUnit) => (prevUnit === 'Celsius' ? 'Fahrenheit' : 'Celsius'));
  };

  const aggregateDailyTemperatures = (list) => {
    const dailyTemperatures = {};

    list.forEach((item) => {
      const forecastDate = new Date(item.dt * 1000);
      const dateKey = forecastDate.toISOString().split('T')[0];

      if (!dailyTemperatures[dateKey]) {
        dailyTemperatures[dateKey] = {
          max: -Infinity,
          min: Infinity,
        };
      }

      if (item.main.temp_max > dailyTemperatures[dateKey].max) {
        dailyTemperatures[dateKey].max = item.main.temp_max;
      }

      if (item.main.temp_min < dailyTemperatures[dateKey].min) {
        dailyTemperatures[dateKey].min = item.main.temp_min;
      }
    });

    return dailyTemperatures;
  };

  return (
    <div style={{ maxWidth: 'md', margin: 'auto' }} className={classes.root}>
      <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Weather App</h1>
      <div style={{ padding: '1rem' }} className={classes.weatherContainer}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchWeatherData();
          }}
          className={classes.form}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              style={{ flex: 1, marginRight: '1rem', padding: '0.5rem' }}
              placeholder="Enter city or coordinates"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <button
              style={{ padding: '0.5rem' }}
              type="submit"
            >
              Get Weather
            </button>
          </div>
          <div style={{ display: 'flex', marginTop: '1rem' }}>
            <button
              style={{ marginRight: '0.5rem', padding: '0.5rem', backgroundColor: '#3f51b5', color: '#fff', border: 'none' }}
              onClick={handleSaveLocation}
            >
              Save Location
            </button>
            <button
              style={{ marginRight: '0.5rem', padding: '0.5rem', backgroundColor: '#3f51b5', color: '#fff', border: 'none' }}
              onClick={toggleTemperatureUnit}
            >
              Toggle Temperature Unit ({temperatureUnit})
            </button>
          </div>
        </form>
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
            <div className={classes.loadingIndicator}>
              Loading...
            </div>
          </div>
        )}
        {currentWeather && (
          <div style={{ padding: '0.75rem', border: '2px solid #ccc', borderRadius: '0.5rem', backgroundColor: '#f9f9f9', marginBottom: '1rem' }} className={classes.weatherItem}>
            <h2 style={{ textAlign: 'center' }}>Current Weather</h2>
            <p style={{ textAlign: 'center' }}>Temperature: {temperatureUnit === 'Celsius' ? kelvinToCelsius(currentWeather.main.temp).toFixed(2) + '°C' : kelvinToFahrenheit(currentWeather.main.temp).toFixed(2) + '°F'}</p>
            <p style={{ textAlign: 'center' }}>Description: {currentWeather.weather[0].description}</p>
          </div>
        )}
        {forecast && (
          <div className={classes.weatherItem}>
            <h2 style={{ textAlign: 'center' }}>5-Day Weather Forecast</h2>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {Object.entries(aggregateDailyTemperatures(forecast.list)).map(([date, temperatures]) => (
                <div key={date} style={{ padding: '0.75rem', border: '2px solid #ccc', borderRadius: '0.5rem', backgroundColor: '#f9f9f9', marginBottom: '1rem' }} className={classes.weatherItem}>
                  <h3 style={{ textAlign: 'center' }}>{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</h3>
                  <p style={{ textAlign: 'center' }}>{date}</p>
                  <p style={{ textAlign: 'center' }}>Max: {temperatureUnit === 'Celsius' ? kelvinToCelsius(temperatures.max).toFixed(2) + '°C' : kelvinToFahrenheit(temperatures.max).toFixed(2) + '°F'}</p>
                  <p style={{ textAlign: 'center' }}>Min: {temperatureUnit === 'Celsius' ? kelvinToCelsius(temperatures.min).toFixed(2) + '°C' : kelvinToFahrenheit(temperatures.min).toFixed(2) + '°F'}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '0.5rem', borderRadius: '0.5rem', boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }} className={classes.savedLocationsContainer}>
        <h2 style={{ textAlign: 'center' }}>Saved Locations</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {savedLocations.map((savedLocation, index) => (
            <button
              key={index}
              style={{ marginRight: '0.5rem', marginBottom: '0.5rem', padding: '0.5rem', backgroundColor: '#3f51b5', color: '#fff', border: 'none' }}
              onClick={() => handleViewSavedLocation(savedLocation)}
            >
              {savedLocation}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
