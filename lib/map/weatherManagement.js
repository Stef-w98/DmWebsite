import { supabase } from './supabaseClient.js';
import { openSidebar } from './uiHelpers.js';

export async function fetchAndDisplayWeatherMarkers(weatherLayerGroup, map) {
    let { data: weatherMarkers, error } = await supabase.from('WeatherMarkers').select(`
        MarkerID,
        ZoneID,
        Latitude,
        Longitude,
        LocationDescription,
        ClimateZones(name),
        WeatherConditions(name, MinTemp, MaxTemp, Description)
    `);

    if (error) {
        console.error('Error loading weather markers:', error.message);
        return;
    }

    weatherLayerGroup.clearLayers(); // Clear existing weather markers before adding new ones

    weatherMarkers.forEach(marker => {
        const weatherIcon = L.icon({
            iconUrl: determineIconUrl(marker.WeatherConditions.name), // Function to determine icon based on weather condition
            iconSize: [32, 37], // Size of the icon
            iconAnchor: [16, 37], // Point of the icon which will correspond to marker's location
            popupAnchor: [0, -28] // Point from which the popup should open relative to the iconAnchor
        });

        const weatherMarker = L.marker([marker.Latitude, marker.Longitude], { icon: weatherIcon, title: marker.ClimateZones.name }).addTo(weatherLayerGroup)
            .bindTooltip(marker.ClimateZones.name, {permanent: true}); // Display zone name on hover

        weatherMarker.on('click', () => {
            let content = `<h2>${marker.ClimateZones.name}</h2><p>${marker.LocationDescription}</p>`;
            content += `<p><strong>Condition:</strong> ${marker.WeatherConditions.name}</p>`;
            content += `<p><strong>Temperature:</strong> ${marker.WeatherConditions.MinTemp}°C to ${marker.WeatherConditions.MaxTemp}°C</p>`;
            content += `<p><strong>Description:</strong> ${marker.WeatherConditions.Description}</p>`;
            openSidebar(content); // Assuming openSidebar function is part of uiHelpers.js
        });
    });
    weatherLayerGroup.addTo(map);
}

function determineIconUrl(weatherCondition) {
    // Map weather conditions to icon URLs
    const iconMap = {
        'Clear Skies': 'path/to/clear_skies_icon.png',
        'Light Snow': 'path/to/light_snow_icon.png',
        'Heavy Snow': 'path/to/heavy_snow_icon.png',
        'Snowstorm': 'path/to/snowstorm_icon.png',
        'Blizzard': 'path/to/blizzard_icon.png',
        // Add other conditions as necessary
    };

    return iconMap[weatherCondition] || 'path/to/default_weather_icon.png';
}
