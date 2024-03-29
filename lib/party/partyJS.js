document.addEventListener('DOMContentLoaded', function() {
    fetchCharacters();

    // Get the modal
    var modal = document.getElementById("addCharacterModal");

    // Get the button that opens the modal
    var btn = document.querySelector(".add-card");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks on the button, open the modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById('addCharacterForm').onsubmit = async function(event) {
        event.preventDefault();

        // Create a character object from form inputs
        const formData = new FormData(event.target);
        const character = Object.fromEntries(formData.entries());

        try {
            // Call the API to add the character
            const response = await fetch('/api/addCharacters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(character),
            });

            if (!response.ok) throw new Error('Failed to add character');

            // Handle success (e.g., close the modal, clear the form, refresh character list)
            document.getElementsByClassName("close")[0].click();
            event.target.reset();
            fetchCharacters(); // Assuming this is a function to refresh the characters displayed
        } catch (error) {
            console.error('Error adding character:', error);
            // Optionally, handle/display the error to the user
        }
    };

});


async function fetchCharacters() {
    const container = document.getElementById('cards-container');
    try {
        const response = await fetch('/api/characters'); // Adjust the URL to your actual API endpoint
        const characters = await response.json();

        characters.forEach(char => {
            const card = createCharacterCard(char);
            container.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
}

function createCharacterCard(character) {
    const card = document.createElement('div');
    card.className = 'card';
    card.onclick = () => window.location.href = `/character-details.html?id=${character.characterid}`;

    // Image
    const img = document.createElement('img');
    img.src = `assets/${character.name.replace(/\s+/g, '').toLowerCase()}.png`; // Construct the path
    console.log(`assets/${character.name.replace(/\s+/g, '').toLowerCase()}.png`)
    img.alt = character.name;
    card.appendChild(img);

    // Name
    const name = document.createElement('h3');
    name.textContent = character.name;
    card.appendChild(name);

    // Race & Class
    const raceClass = document.createElement('p');
    raceClass.textContent = `${character.race} ${character.class}, Level ${character.level}`;
    card.appendChild(raceClass);

    // Description - using a snippet of the backstory
    const description = document.createElement('p');
    description.textContent = character.backstory ? `${character.backstory.substring(0, 100)}...` : 'No backstory provided.';
    card.appendChild(description);

    return card;
}


