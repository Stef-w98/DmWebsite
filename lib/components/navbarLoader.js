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

function adjustAuthLinks() {
    const user = supabase.auth.user(); // Get the current user

    if (user) {
        document.getElementById('login-register-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'block';
    } else {
        document.getElementById('login-register-link').style.display = 'block';
        document.getElementById('logout-link').style.display = 'none';
    }
}

function logout() {
    supabase.auth.signOut().then(() => {
        adjustAuthLinks();
        window.location.href = './../../index.html'; // Adjust as necessary
    }).catch(error => console.error('Logout error:', error));
}

// This is the primary event listener that kicks everything off when the DOM content is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    loadNavbar();
});

