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

    // Fetch cities from your server
    const fetchCities = async () => {
        const response = await fetch('http://localhost:3000/api/fetchCities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    };

    const cities = await fetchCities();
    cities.forEach(city => {
        const { latitude, longitude, name } = city;
        if (latitude != null && longitude != null) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindPopup(`${name}<br>Coordinates: ${latitude}, ${longitude}`);
        }
    });

    // Add a city via your server when the map is clicked
    map.on('click', async function(e) {
        const name = prompt("Enter name for the new location:");
        if (name) {
            const { lat, lng } = e.latlng;
            const result = await addCity(name, lat, lng);

            if (result.error) {
                console.error('Error inserting new city:', result.error);
            } else {
                // Add a marker for the new city immediately after insertion
                const marker = L.marker([lat, lng]).addTo(map);
                marker.bindPopup(`${name}<br>Coordinates: ${lat}, ${lng}`);
                marker.openPopup();
            }
        }
    });

    // Define the addCity function
    const addCity = async (name, latitude, longitude) => {
        const response = await fetch('http://localhost:3000/api/addCity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, latitude, longitude }),
            mode: 'no-cors'
        });
        if (!response.ok) {
            console.error('Failed to add city:', response.statusText);
        } else {
            const data = await response.json();
            console.log(data);
        }
    };

});
