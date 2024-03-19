const express = require('express');
const cors = require('cors');
const { fetchCities, addCity } = require('./api');
const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());

// Welcome message route
app.get('/', (req, res) => {
    res.send('Welcome to the API!');
});

// Endpoint to get cities
app.get('/cities', async (req, res) => {
    const cities = await fetchCities();
    res.json(cities);
});

// Endpoint to add a city
app.post('/cities', async (req, res) => {
    const { name, latitude, longitude } = req.body;
    const result = await addCity(name, latitude, longitude);
    res.json(result);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

