import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';

// Initialize Supabase client
let supabase = createClient('https://nhgspooltizwismypzan.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oZ3Nwb29sdGl6d2lzbXlwemFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA2MTI2MDQsImV4cCI6MjAyNjE4ODYwNH0.7uPvzyXlBh6EUShss-I2KkuAAPdyeMauKXdKwGl6YnA');

document.addEventListener('DOMContentLoaded', async () => {
    await loadNavbar();
    adjustLinks();
    setupLogoutListener();
});

async function loadNavbar() {
    const navbarContainer = document.getElementById('navbar-container');
    // Attempt to load the navbar HTML from localStorage
    let navbarHTML = localStorage.getItem('navbarHTML');
    let navbarCSS = localStorage.getItem('navbarCSS');

    if (!navbarHTML || !navbarCSS) {
        const baseUrl = window.location.origin;
        const navbarPath = `${baseUrl}/lib/components/navbar.html`;
        const navbarStylePath = `${baseUrl}/lib/components/navbarStyle.css`;

        try {
            // Fetch navbar HTML if not cached
            if (!navbarHTML) {
                const responseHTML = await fetch(navbarPath);
                navbarHTML = await responseHTML.text();
                localStorage.setItem('navbarHTML', navbarHTML);
            }
            navbarContainer.innerHTML = navbarHTML;

            // Fetch navbar CSS if not cached
            if (!navbarCSS) {
                const responseCSS = await fetch(navbarStylePath);
                navbarCSS = await responseCSS.text();
                localStorage.setItem('navbarCSS', navbarCSS);
            }

            const styleTag = document.createElement('style');
            styleTag.innerHTML = navbarCSS;
            document.head.appendChild(styleTag);

            adjustAuthLinks();
        } catch (error) {
            console.error('Error loading the navbar or its style:', error);
        }
    } else {
        navbarContainer.innerHTML = navbarHTML;
        const styleTag = document.createElement('style');
        styleTag.innerHTML = navbarCSS;
        document.head.appendChild(styleTag);
        adjustAuthLinks();
    }
}

function adjustLinks() {
    const currentPage = window.location.pathname;
    const isIndexPage = currentPage.endsWith('index.html') || currentPage === '/';
    const isLoginPage = currentPage.endsWith('signin.html') || currentPage === '/';
    const signInLink = document.querySelector('#login-register-link a');
    const mapLink = document.querySelector('.nav-links a[href*="map.html"]');

    if (signInLink) {
        if (isIndexPage) {
            signInLink.href = "/lib/registration/signin.html";
        } else {
            signInLink.href = "./../registration/signin.html";
        }
    }
    if (isLoginPage) {
        mapLink.href = "./../map/map.html";
    } else if (isIndexPage) {
        mapLink.href = "./lib/map/map.html";
    }
}

async function adjustAuthLinks() {
    const { data, error } = await supabase.auth.getSession();

    if (data?.session) {
        document.getElementById('login-register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
    } else {
        document.getElementById('login-register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
    }
}

function setupLogoutListener() {
    document.addEventListener('click', async (e) => {
        if (e.target.id === 'logout-link' || e.target.closest('#logout-link')) {
            e.preventDefault();
            console.log("Logout clicked");

            const { error } = await supabase.auth.signOut();

            if (!error) {
                console.log("Logout successful");
                adjustAuthLinks(); // Update the UI based on auth state
            } else {
                console.error('Logout error:', error);
            }
        }
    });
}
