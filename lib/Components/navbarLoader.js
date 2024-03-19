function loadNavbar() {
    fetch('./lib/Components/navbar.html') // Adjust the path as necessary
        .then(response => response.text())
        .then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);
            // Now that the navbar is loaded, link the navbar stylesheet
            const link = document.createElement('link');
            link.href = './lib/Components/navbarStyle.css';
            link.type = 'text/css';
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        });
}

document.addEventListener('DOMContentLoaded', loadNavbar);
