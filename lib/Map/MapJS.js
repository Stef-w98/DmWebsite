// We're no longer importing these functions directly from a local module
// import { fetchCities, addCity } from '../../Data/DataHelper.js';

window.addEventListener('load', async () => {
    const map = L.map('fantasyMap', {
        crs: L.CRS.Simple,
        minZoom: 1,
        maxZoom: 4
    });

    const bounds = [[0,0], [562.5, 1000]];
    L.imageOverlay('./Dryle.png', bounds).addTo(map);
    map.fitBounds(bounds);

    map.once('load', function() {
        map.setZoom(map.getBoundsZoom(bounds));
    });

    // Updated to fetch cities from your server
    const fetchCities = async () => {
        const response = await fetch('http://localhost:3000/cities');
        return await response.json();
    };

    // Fetch cities and add markers
    const cities = await fetchCities();
    cities.forEach(city => {
        const { latitude, longitude, name } = city;
        if(latitude != null && longitude != null) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`${name}<br>Coordinates: ${latitude}, ${longitude}`);
        }
    });

    // Updated to add a city via your server
    const addCity = async (name, latitude, longitude) => {
        const response = await fetch('http://localhost:3000/cities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, latitude, longitude }),
        });
        return await response.json();
    };

    map.on('click', async function(e) {
        const name = prompt("Enter name for the new location:");
        if (name) {
            const { lat, lng } = e.latlng;
            const { data, error } = await addCity(name, lat, lng);

            if (error) {
                console.error('Error inserting new city:', error);
            } else {
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`${name}<br>Coordinates: ${lat}, ${lng}`);
                marker.openPopup();
            }
        }
    });
});
