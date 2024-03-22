import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
let supabase;
supabase = createClient('https://nhgspooltizwismypzan.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA');

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
            const { latitude, longitude, name, description, npc } = city;
            if (latitude != null && longitude != null) {
                const marker = L.marker([latitude, longitude]).addTo(map);

                // Bind a tooltip to each marker with just the town's name
                marker.bindTooltip(name, {
                    permanent: false,
                    direction: 'top',
                    opacity: 0.7,
                    offset: [-15, 0] // Adjust this value as needed, e.g., [-10, 0] to move the tooltip slightly left
                });

                // Listen for click events on markers to open the sidebar with detailed info
                marker.on('click', () => {
                    openSidebar(name, latitude, longitude, description, npc);
                });
            }
        });
    };

    // Function to open the sidebar with city information
    function openSidebar(name, latitude, longitude, description, npc) {
        const sidebarContent = document.getElementById('sidebar-content');
        sidebarContent.innerHTML = `<h2>${name}</h2><p>Coordinates: ${latitude}, ${longitude}</p></br>
<p>Description: ${description}, ${npc}</p>`;

        document.getElementById('sidebar').classList.add('open');
    }

    document.getElementById('close-sidebar').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
    });


    const cities = await fetchCities();
    displayCities(); // Use the cached cities to populate the map

    // Check if the user is logged in and has the specific email
    let session = await supabase.auth.getUser();
    let userEmail = session?.data.user?.email;
    if (userEmail === 'stef.wouters18@gmail.com') {
        // Allow this user to add cities
        map.on('click', async function(e) {
            const name = prompt("Enter name for the new location:");
            if (name) {
                const { lat, lng } = e.latlng;
                await addCity(name, lat, lng);
                citiesCache.push({ name, latitude: lat, longitude: lng }); // Update cache
                displayCities(); // Refresh map markers from the updated cache
            }
        });
    } else {
        // Optionally, inform non-privileged users they cannot add markers
        console.log("You're viewing the map in read-only mode.");
    }
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
