document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    await fetch('http://localhost:3000/api/login', { // Assuming you're hosting this alongside your serverless functions
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) console.error('Login error:', data.error);
            else console.log('User logged in:', data.user);
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('registration-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);

    await fetch('http://localhost:3000/api/register', { // Adjust the fetch URL as necessary
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) console.error('Registration error:', data.error);
            else console.log('User registered:', data.user);
        })
        .catch(error => console.error('Error:', error));
});
