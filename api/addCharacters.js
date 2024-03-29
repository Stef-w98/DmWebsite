const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with your project's values.
const supabaseUrl = 'https://nhgspooltizwismypzan.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

module.exports = async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        // Assume that the incoming request body format is JSON
        const character = req.body;

        try {
            const { data, error } = await supabase
                .from('characters')
                .insert([
                    character // Assuming character contains { name, race, class, level, backstory }
                ]);

            if (error) throw error;

            // Respond with the newly added character
            res.status(201).json(data);
        } catch (error) {
            console.error('Error adding character:', error);
            return res.status(500).json({ error: 'Failed to add character' });
        }
    } else {
        // Handle other HTTP methods or return a message that the method is not supported
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
