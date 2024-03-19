const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nhgspooltizwismypzan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to set CORS headers
const setCorsHeaders = (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust in production
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

module.exports = async (req, res) => {
    // Set CORS headers
    setCorsHeaders(res);

    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method === 'POST') {
        const { name, latitude, longitude } = req.body;
        const { data, error } = await supabase.from('cities').insert([{ name, latitude, longitude }]);

        if (error) {
            console.error('Error adding city:', error);
            return res.status(500).json({ error: 'Failed to add city' });
        }

        res.status(201).json(data);
    } else {
        // Respond with method not allowed for non-POST requests
        res.status(405).end();
    }
};

