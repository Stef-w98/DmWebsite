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

    let citiesCache = []; // Client-side cache for cities

    const fetchCities = async () => {
        const response = await fetch('http://localhost:3000/api/fetchCities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cities = await response.json();
        citiesCache = cities; // Update the cache with fetched data
        return cities;
    };

    const displayCities = () => {
        citiesCache.forEach(city => {
            const { latitude, longitude, name } = city;
            if (latitude != null && longitude != null) {
                const marker = L.marker([latitude, longitude]).addTo(map);
                marker.bindPopup(`${name}<br>Coordinates: ${latitude}, ${longitude}`);
            }
        });
    };

    const cities = await fetchCities();
    displayCities(); // Use the cached cities to populate the map

    // Add a city via your server when the map is clicked
    map.on('click', async function(e) {
        const name = prompt("Enter name for the new location:");
        if (name) {
            const { lat, lng } = e.latlng;
            await addCity(name, lat, lng);
            citiesCache.push({ name, latitude: lat, longitude: lng }); // Update cache
            displayCities(); // Refresh map markers from the updated cache
        }
    });

    // Define the addCity function
    const addCity = async (name, latitude, longitude) => {
        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('latitude', latitude);
        formData.append('longitude', longitude);

        await fetch('http://localhost:3000/api/addCity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        // Immediately add the marker for the new city
        const marker = L.marker([latitude, longitude]).addTo(map);
        marker.bindPopup(`${name}<br>Coordinates: ${latitude}, ${longitude}`);
        marker.openPopup();
    };
});
