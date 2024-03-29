import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
let supabase;

supabase = createClient('https://nhgspooltizwismypzan.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA');


document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional manner
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Use Supabase client directly to handle login
    const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Login error:', error.message);
        // Handle error (e.g., display a message to the user)
    } else {
        let usr = await supabase.auth.getUser()
        console.log('User logged in:', user, usr);
        // Redirect the user or update UI as needed
        window.location.href = './../../index.html'; // Adjust as necessary
    }
});

document.getElementById('registration-form').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the form from submitting in the traditional manner
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    // This fetch assumes you're handling registration through a serverless function.
    // Adjust the URL as necessary.
    await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ email, password }).toString(),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Registration error:', data.error);
                // Handle registration error (e.g., display a message to the user)
            } else {
                console.log('User registered:', data.user);
                // Optionally, log the user in directly or redirect to a login page
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
