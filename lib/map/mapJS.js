import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

let supabase;
supabase = createClient('https://nhgspooltizwismypzan.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA');

window.addEventListener('load', async () => {
    const map = L.map('fantasyMap', {
        crs: L.CRS.Simple,
        minZoom: 1,
        maxZoom: 4
    });

    const bounds = [[0, 0], [562.5, 1000]];
    L.imageOverlay('./Dryle.png', bounds).addTo(map);
    map.fitBounds(bounds);

    map.once('load', function() {
        map.setZoom(map.getBoundsZoom(bounds));
    });

    let citiesCache = [];

    function closeSidebar() {
        document.getElementById('sidebar').classList.remove('open');
    }

    document.getElementById('close-sidebar').addEventListener('click', closeSidebar);

    async function fetchCities() {
        const response = await fetch('/api/fetchCities');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const cities = await response.json();
        citiesCache = cities;
        return cities;
    }

    function displayCities() {
        citiesCache.forEach(city => {
            const { name, latitude, longitude } = city; // Simplified for brevity
            if (latitude != null && longitude != null) {
                const marker = L.marker([latitude, longitude]).addTo(map);
                marker.bindTooltip(name, { permanent: false, direction: 'top', opacity: 0.7, offset: [-15, 0] });
                marker.on('click', () => {
                    openSidebar(city); // Adjusted to pass the whole city object
                });
            }
        });
    }

    function openSidebar(city) {
        const sidebarContent = document.getElementById('sidebar-content');
        let content = `<h2>${city.name}</h2>`;
        // Generate the detailed content dynamically, skipping undesired keys
        Object.entries(city).forEach(([key, value]) => {
            if (value && !['id', 'created_at', 'latitude', 'longitude'].includes(key)) {
                // Format the key to make it more human-readable, if necessary
                const formattedKey = key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1);
                content += `<p><strong>${formattedKey}:</strong> ${value}</p>`;
            }
        });
        sidebarContent.innerHTML = content;
        document.getElementById('sidebar').classList.add('open');
    }

    let session = await supabase.auth.getUser();
    let userEmail = session?.data.user?.email;
    if (userEmail === 'stef.wouters18@gmail.com' || userEmail === 'alessandrosanen@gmail.com' || userEmail === 'ruben.kog@telenet.be') {
        // Updated map click event with boundary validation
        map.on('click', function(e) {
            if (isValidLocation(e.latlng.lat, e.latlng.lng)) {
                document.getElementById('cityFormModal').style.display = 'block';
                window.clickedLocation = e.latlng;
            } else {
                alert('The clicked location is outside of the map boundaries. Please select a location within the map.');
            }
        });
    } else {
        console.log("You're viewing the map in read-only mode.");
    }

    // Boundary validation function
    function isValidLocation(lat, lng) {
        const maxLat = 562;
        const minLat = 0;
        const maxLng = 1000;
        const minLng = 0;
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    }

    document.getElementById('addCityForm').addEventListener('submit', async function(e) {
        e.preventDefault(); // Prevent default form submission

        const formData = new FormData(e.target);
        const cityData = {};
        formData.forEach((value, key) => {
            cityData[key] = value; // Collects each form field into cityData object
        });

        cityData.latitude = window.clickedLocation.lat;
        cityData.longitude = window.clickedLocation.lng;

        // Include boundary check before adding the city
        if (!isValidLocation(cityData.latitude, cityData.longitude)) {
            alert('The selected location is outside of the map boundaries. Please select a location within the map.');
            document.getElementById('cityFormModal').style.display = 'none';
            return; // Exit if the location is invalid
        }

        await addCity(cityData);

        document.getElementById('cityFormModal').style.display = 'none';
        e.target.reset(); // Optional: reset form for future use
    });


    async function addCity(cityData) {
        await fetch('/api/addCity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(cityData)
        });
        citiesCache.push(cityData);
        // Immediately add the marker for the new city
        const marker = L.marker([cityData.latitude, cityData.longitude]).addTo(map);
        marker.bindTooltip(cityData.name, { permanent: false, direction: 'top', opacity: 0.7, offset: [-15, 0] });
        marker.on('click', () => {
            openSidebar(cityData); // Use the newly added city data to open the sidebar
        });
    }

    const cities = await fetchCities();
    displayCities(); // Use the cached cities to populate the map initially

    // Optional: Close modal when clicking outside of it
    window.onclick = function(event) {
        const modal = document.getElementById('cityFormModal');
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // Close modal with the close button
    document.querySelector('.modal .close').addEventListener('click', () => {
        document.getElementById('cityFormModal').style.display = 'none';
    });
});
