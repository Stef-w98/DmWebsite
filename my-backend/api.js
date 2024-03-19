const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    'https://nhgspooltizwismypzan.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA'
);

// Function to fetch cities
async function fetchCities() {
    let { data: cities, error } = await supabase
        .from('cities')
        .select('*');

    if (error) {
        console.error('Error fetching cities:', error);
        return [];
    }

    return cities;
}

// Function to add a city
async function addCity(name, latitude, longitude) {
    const { data, error } = await supabase
        .from('cities')
        .insert([
            { name: name, latitude: latitude, longitude: longitude }
        ]);

    if (error) {
        console.error('Error inserting new city:', error);
    }

    return { data, error };
}

module.exports = { fetchCities, addCity };
