// backend/api/asteroids.js
import axios from 'axios';

let cachedAsteroids = [];

async function loadAsteroids() {
  if (cachedAsteroids.length) return cachedAsteroids;

  const res = await axios.get('https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=DEMO_KEY&page=0&size=20');
  cachedAsteroids = res.data.near_earth_objects.map(item => ({
    name: item.name,
    speed: parseFloat(item.close_approach_data?.[0]?.relative_velocity?.kilometers_per_second || 0),
    diameter: item.estimated_diameter?.kilometers?.estimated_diameter_max || 1,
    missDistance: parseFloat(item.close_approach_data?.[0]?.miss_distance?.astronomical || 0),
  }));
  return cachedAsteroids;
}

export default async function handler(req, res) {
  const asteroids = await loadAsteroids();
  const name = req.query.name;
  if (name) {
    const asteroid = asteroids.find(a => a.name === name);
    if (!asteroid) return res.status(404).json({ error: 'Asteroid not found' });
    return res.json({ ...asteroid, size: asteroid.diameter / 2, position: { x: 100, y: 50, z: 0 } });
  }
  res.json(asteroids);
}
