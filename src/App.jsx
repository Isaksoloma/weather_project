import React, { useState, useEffect } from 'react';
import './App.css';

const API_KEY = '9896220c0afabb4bef4c8698627606a0';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWeatherData = async (cityName) => {
    try {
      setLoading(true);
      setError('');
      
      // Current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      
      if (!currentResponse.ok) throw new Error('City not found');
      
      const currentData = await currentResponse.json();
      
      // 5-day forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`
      );
      
      const forecastData = await forecastResponse.json();
      
      // Process forecast data
      const dailyForecast = forecastData.list.reduce((acc, item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = {
            temp: item.main.temp,
            icon: item.weather[0].icon,
            description: item.weather[0].main,
            wind: item.wind.speed,
            humidity: item.main.humidity
          };
        }
        return acc;
      }, {});

      setWeatherData({
        temp: currentData.main.temp,
        feels_like: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        pressure: currentData.main.pressure,
        wind_speed: currentData.wind.speed,
        visibility: currentData.visibility / 1000,
        clouds: currentData.clouds.all,
        icon: currentData.weather[0].icon,
        city: currentData.name
      });

      setForecastData(Object.entries(dailyForecast).slice(0, 5));
      
      setHistory(prev => {
        const newHistory = [cityName, ...prev.filter(item => item !== cityName)];
        return newHistory.slice(0, 5);
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) fetchWeatherData(city.trim());
  };

  return (
    <div className="container">
      <h1 className="title">Weather App</h1>
      
      <form onSubmit={handleSubmit} className="search-form">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name"
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error && <p className="error-message">⚠️ {error}</p>}

      {weatherData && (
        <div className="weather-section">
          <div className="current-weather">
            <h2 className="city-name">{weatherData.city}</h2>
            <div className="weather-main">
              <img
                src={`http://openweathermap.org/img/wn/${weatherData.icon}@4x.png`}
                alt="Weather icon"
                className="weather-icon"
              />
              <div className="temperature">
                {Math.round(weatherData.temp)}°C
                <div className="feels-like">
                  Feels like {Math.round(weatherData.feels_like)}°C
                </div>
              </div>
            </div>
            
            <div className="weather-details-grid">
              <div className="detail-item">
                <span className="detail-label">Wind Speed</span>
                <span className="detail-value">{weatherData.wind_speed} m/s</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Humidity</span>
                <span className="detail-value">{weatherData.humidity}%</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Visibility</span>
                <span className="detail-value">{weatherData.visibility} km</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Pressure</span>
                <span className="detail-value">{weatherData.pressure} hPa</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Cloudiness</span>
                <span className="detail-value">{weatherData.clouds}%</span>
              </div>
            </div>
          </div>

          <div className="forecast-section">
            <h3>5-Day Forecast</h3>
            <div className="forecast-cards">
              {forecastData.map(([date, data], index) => (
                <div key={index} className="forecast-card">
                  <div className="forecast-date">{date}</div>
                  <img
                    src={`http://openweathermap.org/img/wn/${data.icon}@2x.png`}
                    alt="Weather icon"
                    className="forecast-icon"
                  />
                  <div className="forecast-temp">{Math.round(data.temp)}°C</div>
                  <div className="forecast-description">{data.description}</div>
                  <div className="forecast-wind">🌬️ {data.wind} m/s</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h3>Search History:</h3>
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => fetchWeatherData(item)}
              className="history-item"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;