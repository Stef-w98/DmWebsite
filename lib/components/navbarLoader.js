import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
let supabase;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Supabase client
    supabase = createClient('https://nhgspooltizwismypzan.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA');
    loadNavbar(); // Now that Supabase is initialized, load the navbar
});


function loadNavbar() {
    // Determine the base URL dynamically
    const baseUrl = window.location.origin;
    const navbarPath = `${baseUrl}/lib/components/navbar.html`;
    const navbarStylePath = `${baseUrl}/lib/components/navbarStyle.css`;

    fetch(navbarPath)
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
            const link = document.createElement('link');
            link.href = navbarStylePath;
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);

            // Adjust auth links after navbar is loaded
            adjustAuthLinks();
        })
        .catch(error => console.error('Error loading the navbar:', error));
}




async function adjustAuthLinks() {

    const { data, error } = await supabase.auth.getSession()

    if (data.session) {
        // User is logged in
        document.getElementById('login-register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
    } else {
        // User is logged out
        document.getElementById('login-register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
    }
}


document.addEventListener('click', async (e) => {
    if (e.target.id === 'logout-link' || e.target.closest('#logout-link')) {
        e.preventDefault();
        console.log("Logout clicked");

        const { error } = await supabase.auth.signOut();

        if (!error) {
            console.log("Logout successful");
            adjustAuthLinks(); // Ensure this function updates the UI based on auth state
        } else {
            console.error('Logout error:', error);
        }
    }
});





// This is the primary event listener that kicks everything off when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});

