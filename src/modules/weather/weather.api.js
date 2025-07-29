
import axios from 'axios';
import dotenv from 'dotenv';
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authentication.js';
dotenv.config();

export const weatherRouter = Router();

// Egyptian cities coordinates (for cities that might not be found by name)
const egyptianCities = {
  '10thOfRamadan': { lat: 30.29, lon: 31.75, name: '10th of Ramadan City' },
  'tenth of ramadan': { lat: 30.29, lon: 31.75, name: '10th of Ramadan City' },
  '10th ramadan': { lat: 30.29, lon: 31.75, name: '10th of Ramadan City' }
};


// Basic weather endpoint
weatherRouter.get('/:city',authenticateToken, async (req, res) => {
  try {
    const { city } = req.params;
    let url;
    let cityName = city;
    const API_KEY = process.env.WEATHER_API_KEY;

    //throw error for testing purposes
    // throw new Error('API key not found');

    
    // Check if it's a known Egyptian city with coordinate lookup
    const cityKey = city;
    if (egyptianCities[cityKey]) {
      const coords = egyptianCities[cityKey];
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`;
      cityName = coords.name;

    //   console.log(coords.lat, coords.lon);
    } else {
      // Try regular city name lookup first
      url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    }
    
    const response = await axios.get(url);
    const data = response.data;
    
    // Simplified response for widget
    const weatherData = {
      city: cityName || data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon
    };
    
    res.json(weatherData);
    
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'City not found' });
    } else {
      res.status(500).json({ error: 'Failed to fetch weather data' });
    }
  }
});

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'Weather API is running' });
// });

// app.listen(PORT, () => {
//   console.log(`Weather API running on port ${PORT}`);
// });


