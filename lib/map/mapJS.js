import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://nhgspooltizwismypzan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let map, isDrawing = false, polygonPoints = [], polygon;

let citiesLayerGroup = L.layerGroup();
let regionsLayerGroup = L.layerGroup();

window.addEventListener('load', async () => {
    map = L.map('fantasyMap', {
        crs: L.CRS.Simple,
        minZoom: 1,
        maxZoom: 4
    });

    const bounds = [[0, 0], [562.5, 1000]];
    L.imageOverlay('./Dryle.png', bounds).addTo(map);
    map.fitBounds(bounds);

    // Fetch and display cities and regions on initial load
    fetchAndDisplayCities();
    fetchAndDisplayRegions();

    document.getElementById('close-sidebar').addEventListener('click', closeSidebar);

    setupDrawingTools();

    document.getElementById('addCityForm').addEventListener('submit', handleCityFormSubmit);

    await fetchAndDisplayCities();
    await fetchAndDisplayRegions();

    let baseLayers = {
        "Base Map": L.imageOverlay('./Dryle.png', bounds).addTo(map)
    };

    let overlays = {
        "Cities": citiesLayerGroup,
        "Regions": regionsLayerGroup
    };

    L.control.layers(baseLayers, overlays, {collapsed: false}).addTo(map);

    createRandomTradeRoute();
});

// Global variable to store city data
let cityData = [];




function setupDrawingTools() {
    // Button to toggle drawing mode
    const drawButton = document.createElement('button');
    drawButton.id = 'drawPolygon';
    drawButton.textContent = 'Start Drawing';
    document.body.appendChild(drawButton); // Add the button to the body or another suitable container

    drawButton.addEventListener('click', () => {
        isDrawing = !isDrawing;
        drawButton.textContent = isDrawing ? 'Stop Drawing' : 'Start Drawing';
        if (!isDrawing && polygonPoints.length > 2) {
            completePolygon();
        } else if (!isDrawing) {
            resetDrawing();
        }
    });

    map.on('click', function (e) {
        if (!isDrawing) return;
        polygonPoints.push([e.latlng.lat, e.latlng.lng]);
        if (polygon) {
            map.removeLayer(polygon);
        }
        polygon = L.polygon(polygonPoints).addTo(map);
    });
}

async function completePolygon() {
    const regionName = prompt("Enter the name of the region:");
    const regionInfo = prompt("Enter additional information about the region:");

    if (!regionName || !regionInfo || polygonPoints.length <= 2) {
        resetDrawing();
        return;
    }

    try {
        // Insert the new region
        const { error: insertError } = await supabase
            .from('regions')
            .insert({ regionname: regionName, regioninfo: regionInfo });

        if (insertError) throw insertError;

        // Fetch the latest region entry based on created_on
        const { data: latestRegion, error: fetchError } = await supabase
            .from('regions')
            .select('*')
            .order('created_on', { ascending: false })
            .limit(1)
            .single();

        if (fetchError) throw fetchError;

        const regionId = latestRegion.id;

        // Insert coordinates for the latest region
        for (const point of polygonPoints) {
            const { error: coordError } = await supabase
                .from('coordinates')
                .insert({
                    regionid: regionId,
                    latitude: point[0],
                    longitude: point[1]
                });

            if (coordError) throw coordError;
        }

        alert('Region saved successfully!');
    } catch (error) {
        alert(`Failed to save region: ${error.message}`);
    } finally {
        resetDrawing();
    }
}

function resetDrawing() {
    isDrawing = false;
    polygonPoints = [];
    if (polygon) {
        map.removeLayer(polygon);
        polygon = null;
    }
    document.getElementById('drawPolygon').textContent = 'Start Drawing';
}

async function fetchAndDisplayRegions() {
    try {
        const { data: regions, error: regionsError } = await supabase
            .from('regions')
            .select('id, regionname, regioninfo');

        if (regionsError) throw regionsError;

        regionsLayerGroup.clearLayers(); // Clear existing layers

        for (let region of regions) {
            const { data: coords, error: coordsError } = await supabase
                .from('coordinates')
                .select('latitude, longitude')
                .eq('regionid', region.id);

            if (coordsError) throw coordsError;

            const latlngs = coords.map(c => [c.latitude, c.longitude]);
            const polygon = L.polygon(latlngs, {
                color: 'rgba(122,58,204,0.5)', // Default style
                fillColor: 'rgba(122,58,204,0.5)',
                fillOpacity: 0.5,
                weight: 2,
            }).bindTooltip(`<strong>${region.regionname}</strong>`, {
                permanent: true,
                direction: 'center',
                className: 'region-label'
            }).on('mouseover', function(e) {
                this.setStyle({
                    weight: 3,
                    color: '#313131',
                    fillOpacity: 0.7
                });
            }).on('mouseout', function(e) {
                this.setStyle({
                    weight: 2,
                    color: 'rgba(122,58,204,0.92)',
                    fillOpacity: 0.5
                });
            });

            regionsLayerGroup.addLayer(polygon);
        }

        regionsLayerGroup.addTo(map);
    } catch (error) {
        console.error('Error fetching regions:', error.message);
    }
}

function openSidebar(city) {
    // Implementation for opening the sidebar with city details
}

async function handleCityFormSubmit(e) {
    e.preventDefault();
    // Implementation for handling city form submissions
}

function closeSidebar() {
    // Implementation for closing the sidebar
}
let selectedCities = []; // Array to keep track of selected cities

async function fetchAndDisplayCities() {
    let { data: cities, error } = await supabase
        .from('cities')
        .select('*');

    if (error) {
        console.error('Error loading cities:', error.message);
        return;
    }

    citiesLayerGroup.clearLayers(); // Clear existing city markers before adding new ones

    cities.forEach(city => {
        const marker = L.marker([city.latitude, city.longitude], {
            title: city.name, // Assuming your city objects have 'name', 'latitude', 'longitude'
        }).addTo(citiesLayerGroup)
            .bindTooltip(city.name); // Display city name on hover

        marker.on('click', () => selectCity({
            name: city.name,
            coords: [city.latitude, city.longitude]
        }));
    });

    citiesLayerGroup.addTo(map);
}

// Place this code at the end of your 'load' event listener
const generateRouteBtn = document.createElement('button');
generateRouteBtn.textContent = 'Generate Trade Route';
generateRouteBtn.style.position = 'absolute';
generateRouteBtn.style.left = '10px';
generateRouteBtn.style.top = '10px';
generateRouteBtn.style.zIndex = '1000';
generateRouteBtn.onclick = () => {
    if (selectedCities.length >= 2) { // Ensure at least two cities are selected
        createRandomTradeRoute(selectedCities);
        selectedCities = []; // Optionally clear the selection after generating the route
    } else {
        alert('Please select at least 2 cities.');
    }
};
document.body.appendChild(generateRouteBtn);

function selectCity(city) {
    // Convert string coordinates to numbers without geographic validation
    const latitude = parseFloat(city.coords[0]);
    const longitude = parseFloat(city.coords[1]);

    // Check if the city is already selected to avoid duplicates
    if (selectedCities.some(selectedCity => selectedCity.name === city.name)) {
        console.log(`${city.name} is already selected.`);
        return; // Stop further execution if city is already selected
    }

    // Assuming latitude and longitude are within your custom map's bounds,
    // directly add the city to the selectedCities array
    selectedCities.push({ name: city.name, coords: [latitude, longitude] });
    console.log(`Selected ${city.name}`);

    // Here, you might check if you've selected enough cities to generate a route and call createRandomTradeRoute(selectedCities);
    // if (selectedCities.length === 3) { // Adjust the number as needed
    //     createRandomTradeRoute(selectedCities);
    //     selectedCities = []; // Optionally reset the selection after generating the route
    // }
}

function createRandomTradeRoute(selectedCities) {
    if (!selectedCities || selectedCities.length < 2) {
        console.error('Invalid or insufficient selected cities.');
        return;
    }

    let routeCoords = [];

    for (let i = 0; i < selectedCities.length; i++) {
        const city = selectedCities[i];

        // Validate city coordinates
        if (!city.coords || city.coords.length !== 2 || typeof city.coords[0] !== 'number' || typeof city.coords[1] !== 'number') {
            console.error('Invalid city coordinates:', city);
            continue; // Skip invalid data
        }

        routeCoords.push(city.coords); // Directly use city coordinates without intermediate points for simplicity

        // Optionally, insert logic here to generate intermediate points
    }

    // Check for valid route coordinates
    if (routeCoords.length >= 2) {
        // Create and display the polyline
        L.polyline(routeCoords, {
            color: '#ff7800',
            weight: 5,
            opacity: 0.65
        }).addTo(map);
    } else {
        console.error('Failed to generate valid route coordinates.');
    }
}
