document.addEventListener('DOMContentLoaded', function() {
    fetchCharacters();
});

async function fetchCharacters() {
    const container = document.getElementById('cards-container');
    try {
        const response = await fetch('http://localhost:3000/api/characters'); // Adjust the URL to your actual API endpoint
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


