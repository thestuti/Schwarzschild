// backend/server.js
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// NASA NEO API
const NASA_API_URL = 'https://api.nasa.gov/neo/rest/v1/neo/browse';
const NASA_API_KEY = 'DEMO_KEY';

// Cache storage
let cachedAsteroids = [];

/**
 * Fetch and cache asteroid data from NASA NEO API at startup
 */
async function loadAsteroids() {
  try {
    console.log('⏳ Fetching asteroid data from NASA NEO API...');
    
    let allAsteroids = [];
    let page = 0;
    let totalPages = 1;

    // Loop through pages (limit to first 5 pages to avoid huge fetch)
    while (page < totalPages && page < 5) {
      const response = await axios.get(`${NASA_API_URL}?page=${page}&size=20&api_key=${NASA_API_KEY}`);
      const data = response.data;

      totalPages = data.page.total_pages;

      const mapped = data.near_earth_objects.map(item => ({
        id: item.id,
        name: item.name,
        closeApproachDate: item.close_approach_data?.[0]?.close_approach_date || 'N/A',
        relativeVelocity: parseFloat(item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0),
        missDistance: parseFloat(item.close_approach_data?.[0]?.miss_distance?.astronomical || 0),
        diameter: item.estimated_diameter?.kilometers?.estimated_diameter_max || 1, // km
        orbitBody: item.orbital_data?.orbit_class?.orbit_class_type || 'N/A'
      }));

      allAsteroids = allAsteroids.concat(mapped);
      page++;
    }

    cachedAsteroids = allAsteroids;
    console.log(`✅ Cached ${cachedAsteroids.length} asteroids from NASA NEO API`);
  } catch (error) {
    console.error('❌ Error fetching NASA NEO API data:', error.message);
  }
}

// Initial fetch on server start
await loadAsteroids();

/**
 * GET /api/asteroids
 * Returns the full cached asteroid list
 */
app.get('/api/asteroids', (req, res) => {
  res.json(cachedAsteroids);
});

/**
 * GET /api/asteroids/:name
 * Returns details for the selected asteroid
 */
app.get('/api/asteroids/:name', (req, res) => {
  const { name } = req.params;
  const asteroid = cachedAsteroids.find(a => a.name === name);

  if (!asteroid) {
    return res.status(404).json({ error: 'Asteroid not found' });
  }

  // Use diameter/2 as size (radius)
  const size = asteroid.diameter / 2;

  res.json({
    name: asteroid.name,
    speed: asteroid.relativeVelocity,  
    size,
    position: { x: 100, y: 50, z: 0 }, // constant position
    orbitBody: asteroid.orbitBody,
    closeApproachDate: asteroid.closeApproachDate,
    missDistance: asteroid.missDistance
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
