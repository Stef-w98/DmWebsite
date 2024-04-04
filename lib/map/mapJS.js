import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

const supabaseUrl = 'https://nhgspooltizwismypzan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

let map, isDrawing = false, polygonPoints = [], polygon;

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

    setupDrawingTools(); // Set up the drawing functionality and button

    // Handle form submission for adding new cities
    document.getElementById('addCityForm').addEventListener('submit', handleCityFormSubmit);
});

async function fetchAndDisplayCities() {
    const response = await fetch('/api/fetchCities');
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cities = await response.json();

    cities.forEach(city => {
        const { name, latitude, longitude } = city;
        if (latitude != null && longitude != null) {
            const marker = L.marker([latitude, longitude]).addTo(map);
            marker.bindTooltip(name, { permanent: false, direction: 'top', opacity: 0.7 });
            marker.on('click', () => {
                openSidebar(city); // Implement this function as needed
            });
        }
    });
}

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
            .select('id, regionname, regioninfo'); // Make sure these column names match your table's column names exactly.

        if (regionsError) throw regionsError;

        for (let region of regions) {
            const { data: coords, error: coordsError } = await supabase
                .from('coordinates')
                .select('latitude, longitude')
                .eq('regionid', region.id); // Again, ensure 'regionid' matches your column name.

            if (coordsError) throw coordsError;

            const latlngs = coords.map(c => [c.latitude, c.longitude]);
            const polygon = L.polygon(latlngs).addTo(map);
            polygon.bindPopup(`<strong>${region.regionname}</strong><br>${region.regioninfo}`);

            // Here, ensure you use 'regionname' to match your column name
            polygon.bindTooltip(`<strong>${region.regionname}</strong>`, {
                permanent: true,
                direction: 'center',
                className: 'region-label' // This is your custom class for CSS styling
            }).openTooltip();

            polygon.setStyle({
                fillColor: 'rgba(122,58,204,0.5)',
                fillOpacity: 0.5,
                weight: 2,
            });

            polygon.on('mouseover', function(e) {
                e.target.setStyle({
                    weight: 3,
                    color: '#313131',
                    fillOpacity: 0.7
                });
            });

            polygon.on('mouseout', function(e) {
                e.target.setStyle({
                    weight: 2,
                    color: 'rgba(122,58,204,0.92)',
                    fillOpacity: 0.5
                });
            });
        }
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
