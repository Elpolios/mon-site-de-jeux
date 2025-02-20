let secretCode = '';
let attempts = 0;
let maxAttempts = 10;
const historyElement = document.getElementById('history');
const countdownElement = document.getElementById('countdown');
const tiles = document.querySelectorAll('.tile');
const proposalTiles = document.querySelectorAll('.proposal-tile');
let currentProposal = [];
let selectedIndex = 0;
const excludedNumbers = [];
const excludedNumbersDiv = document.getElementById('excluded-numbers');
const excludeTile = document.getElementById('exclude-tile');
let isExcluding = false;
let currentGameVariant = '';

const gameVariants = {
    '3-easy': {
        maxAttempts: 10,
        codeLength: 3,
        digits: '0123456789',
        title: 'Le 3 Facile',
    },
    '3-hard': {
        maxAttempts: 10,
        codeLength: 3,
        digits: '0123456789',
        title: 'Le 3 Difficile',
    },
    '4-easy': {
        maxAttempts: 10,
        codeLength: 4,
        digits: '0123456789',
        title: 'Le 4 Facile',
    },
    '4-hard': {
        maxAttempts: 10,
        codeLength: 4,
        digits: '0123456789',
        title: 'Le 4 Difficile',
    },
    '5-easy': {
        maxAttempts: 10,
        codeLength: 5,
        digits: '0123456789',
        title: 'Le 5 Facile',
    },
    '5-hard': {
        maxAttempts: 10,
        codeLength: 5,
        digits: '0123456789',
        title: 'Le 5 Difficile',
    }
};

function selectGame(gameType) {
    document.querySelectorAll('#menu button').forEach(button => {
        button.classList.remove('selected');
    });

    const selectedButton = document.querySelector(`#menu button[onclick="selectGame('${gameType}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('selected');
    }

    currentGameVariant = gameType;
    const variant = gameVariants[gameType];
    if (variant) {
        maxAttempts = variant.maxAttempts;
        document.getElementById('game-title').textContent = variant.title;

        // Réinitialiser complètement le jeu
        resetGame();
        resetTiles();
        clearAll();
        attempts = 0;
        historyElement.innerHTML = '';
        showFeedback('Nouveau jeu commencé !');
    }
}

function resetGame() {
    secretCode = generateSecretCode();
    const codeLength = gameVariants[currentGameVariant].codeLength;
    currentProposal = new Array(codeLength).fill('');

    // Afficher ou masquer les tuiles de proposition en fonction de la longueur du code
    proposalTiles.forEach((tile, index) => {
        tile.textContent = '';
        tile.style.display = index < codeLength ? 'block' : 'none';
    });

    excludedNumbers.length = 0; // Réinitialiser les chiffres exclus
    excludedNumbersDiv.innerHTML = ''; // Vider les chiffres exclus affichés
    isExcluding = false;
    excludeTile.classList.remove('selected');
    updateProposalTileSelection();
}

function generateSecretCode() {
    let code = '';
    const numbers = gameVariants[currentGameVariant].digits;
    const codeLength = gameVariants[currentGameVariant].codeLength;

    while (code.length < codeLength) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const digit = numbers[randomIndex];
        if (!code.includes(digit)) {
            code += digit;
        }
    }
    return code;
}

function resetTiles() {
    const codeLength = gameVariants[currentGameVariant].codeLength;
    currentProposal = new Array(codeLength).fill('');
    proposalTiles.forEach((tile, index) => {
        tile.textContent = '';
        tile.style.display = index < codeLength ? 'block' : 'none';
    });
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    selectedIndex = 0;
    isExcluding = false;
    updateProposalTileSelection();
}

function clearAll() {
    const codeLength = gameVariants[currentGameVariant].codeLength;
    currentProposal = new Array(codeLength).fill('');
    proposalTiles.forEach((tile, index) => {
        tile.textContent = '';
        tile.style.display = index < codeLength ? 'block' : 'none';
    });
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    selectedIndex = 0;
    isExcluding = false;
    updateProposalTileSelection();
}

tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
        const digit = tile.textContent;
        if (isExcluding) {
            excludeNumber(digit);
        } else if (!isExcluded(digit) && !currentProposal.includes(digit)) {
            currentProposal[selectedIndex] = digit;
            proposalTiles[selectedIndex].textContent = digit;
            tile.classList.add('disabled');
            moveToNextEmptyIndex();
            updateTileLockStatus();
        }
    });
});

proposalTiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
        if (!isExcluding) {
            selectedIndex = index;
            updateProposalTileSelection();
        }
    });
});

excludeTile.addEventListener('click', () => {
    isExcluding = !isExcluding;
    selectedIndex = isExcluding ? 'exclude' : 0;
    updateProposalTileSelection();
});

function updateProposalTileSelection() {
    const codeLength = gameVariants[currentGameVariant].codeLength;
    proposalTiles.forEach((tile, index) => {
        tile.classList.toggle('selected', index === selectedIndex && index < codeLength);
    });
    excludeTile.classList.toggle('selected', selectedIndex === 'exclude');
}

function updateTileLockStatus() {
    tiles.forEach(tile => {
        const digit = tile.textContent;
        if (isExcluded(digit) || currentProposal.includes(digit)) {
            tile.classList.add('disabled');
        } else {
            tile.classList.remove('disabled');
        }
    });
}

function clearSelected() {
    if (selectedIndex !== 'exclude' && currentProposal[selectedIndex] !== '') {
        const digit = currentProposal[selectedIndex];
        currentProposal[selectedIndex] = '';
        proposalTiles[selectedIndex].textContent = '';
        const tile = document.getElementById(`tile-${digit}`);
        if (tile) {
            tile.classList.remove('disabled');
        }
        moveToNextEmptyIndex();
    }
}

function makeGuess() {
    if (currentProposal.includes('')) {
        showFeedback('Veuillez compléter votre proposition.');
        return;
    }

    attempts++;
    const guess = currentProposal.join('');
    const result = checkGuess(guess);
    showFeedback(`Tentative ${attempts}: ${result}`);

    if (guess === secretCode) {
        showFeedback('Félicitations ! Vous avez trouvé la combinaison secrète !');
        showVictoryPopup();
        resetTiles();
    } else if (attempts >= maxAttempts) {
        showFeedback(`Désolé, vous avez épuisé vos tentatives. La combinaison secrète était ${secretCode}.`);
        resetTiles();
    } else {
        resetTiles();
    }
}

function checkGuess(guess) {
    let wellPlaced = [];
    let misplaced = [];
    let secretArray = secretCode.split('');
    let guessArray = guess.split('');

    for (let i = 0; i < gameVariants[currentGameVariant].codeLength; i++) {
        if (guessArray[i] === secretArray[i]) {
            wellPlaced.push(i);
            secretArray[i] = null;
            guessArray[i] = null;
        }
    }

    for (let i = 0; i < gameVariants[currentGameVariant].codeLength; i++) {
        if (guessArray[i] !== null) {
            const index = secretArray.indexOf(guessArray[i]);
            if (index !== -1) {
                misplaced.push(guessArray[i]);
                secretArray[index] = null;
            }
        }
    }

    const result = `Bien placés: ${wellPlaced.length}, Mal placés: ${misplaced.length}`;
    addToHistory(guess, result, wellPlaced, misplaced);
    return result;
}

function addToHistory(guess, result, wellPlaced, misplaced) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');

    guess.split('').forEach((digit, index) => {
        const span = document.createElement('span');
        span.innerText = digit;
        span.classList.add('history-digit');

        // Vérifier si la variante actuelle est une variante "facile"
        if (currentGameVariant.endsWith('easy')) {
            // Ajouter des classes pour la mise en surbrillance
            if (wellPlaced.includes(index)) {
                span.classList.add('well-placed'); // Chiffre bien placé
            } else if (misplaced.includes(digit)) {
                span.classList.add('misplaced'); // Chiffre mal placé
            }
        }

        historyItem.appendChild(span);
    });

    const resultSpan = document.createElement('span');
    resultSpan.classList.add('result');
    resultSpan.innerText = result;
    historyItem.appendChild(resultSpan);

    historyElement.appendChild(historyItem);
}

function excludeNumber(digit) {
    if (!excludedNumbers.includes(digit)) {
        excludedNumbers.push(digit);
        const excludedNumberElement = document.createElement('div');
        excludedNumberElement.classList.add('excluded-number');
        excludedNumberElement.textContent = digit;
        excludedNumberElement.addEventListener('click', () => {
            const index = excludedNumbers.indexOf(digit);
            if (index !== -1) {
                excludedNumbers.splice(index, 1);
                excludedNumberElement.remove();
                updateTileLockStatus();
            }
        });
        excludedNumbersDiv.appendChild(excludedNumberElement);
        updateTileLockStatus();
        isExcluding = false;
        excludeTile.classList.remove("selected");
        updateProposalTileSelection();
    }
}

function isExcluded(digit) {
    return excludedNumbers.includes(digit);
}

function moveToNextEmptyIndex() {
    const codeLength = gameVariants[currentGameVariant].codeLength;
    for (let i = 0; i < codeLength; i++) {
        if (currentProposal[i] === '') {
            selectedIndex = i;
            updateProposalTileSelection();
            break;
        }
    }
}

window.onload = function() {
    startCountdown();
    checkForMidnight();
    openRulesPopup();
    selectGame('3-easy'); // Initialiser avec la variante facile par défaut
};

function startCountdown() {
    function updateCountdown() {
        const now = new Date();
        const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
        const diff = midnight - now;

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        countdownElement.innerText = `Prochain reset dans ${hours}h ${minutes}m ${seconds}s`;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function checkForMidnight() {
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
            updateSecretCode();
        }
    }, 60000); // Vérifie chaque minute
}

function showVictoryPopup() {
    document.getElementById('victory-popup').style.display = 'flex';
    document.getElementById('victory-message').innerText = `Vous avez trouvé la combinaison secrète en ${attempts} tentatives !`;
}

function closeVictoryPopup() {
    document.getElementById('victory-popup').style.display = 'none';
}

function openRulesPopup() {
    document.getElementById('rules-popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('rules-popup').style.display = 'none';
}

function showFeedback(message) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.textContent = message;
}