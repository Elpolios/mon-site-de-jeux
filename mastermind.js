let secretCode = generateSecretCode();
let attempts = 0;
const maxAttempts = 10;
const historyElement = document.getElementById('history');
const countdownElement = document.getElementById('countdown');
const tiles = document.querySelectorAll('.tile');
const proposalTiles = document.querySelectorAll('.proposal-tile');
let currentProposal = ['', '', '', ''];
let selectedIndex = 0;

function generateSecretCode() {
    let code = '';
    const numbers = '0123456789';
    while (code.length < 4) {
        const randomIndex = Math.floor(Math.random() * numbers.length);
        const digit = numbers[randomIndex];
        if (!code.includes(digit)) {
            code += digit;
        }
    }
    return code;
}

function updateSecretCode() {
    secretCode = generateSecretCode();
    attempts = 0;
    historyElement.innerHTML = ''; // Clear history
    showFeedback('Nouveau code secret généré !');
}

tiles.forEach((tile) => {
    tile.addEventListener('click', () => {
        const digit = tile.textContent;
        if (!currentProposal.includes(digit)) {
            currentProposal[selectedIndex] = digit;
            proposalTiles[selectedIndex].textContent = digit;
            selectedIndex = (selectedIndex + 1) % 4;
            updateTileLockStatus();
            updateProposalTileSelection();
        }
    });
});

proposalTiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
        selectedIndex = index;
        updateProposalTileSelection();
    });
});

function updateProposalTileSelection() {
    proposalTiles.forEach((tile, index) => {
        tile.classList.toggle('selected', index === selectedIndex);
    });
}

function updateTileLockStatus() {
    tiles.forEach(tile => {
        const digit = tile.textContent;
        if (currentProposal.includes(digit)) {
            tile.classList.add('disabled');
        } else {
            tile.classList.remove('disabled');
        }
    });
}

function clearSelected() {
    if (currentProposal[selectedIndex] !== '') {
        const digit = currentProposal[selectedIndex];
        currentProposal[selectedIndex] = '';
        proposalTiles[selectedIndex].textContent = '';
        const tile = document.getElementById(`tile-${digit}`);
        if (tile) {
            tile.classList.remove('disabled');
        }
    }
}

function clearAll() {
    currentProposal = ['', '', '', ''];
    proposalTiles.forEach(tile => {
        tile.textContent = '';
    });
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    selectedIndex = 0;
    updateProposalTileSelection();
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
    addToHistory(guess, result);

    if (guess === secretCode) {
        showFeedback('Félicitations ! Vous avez trouvé la combinaison secrète !');
        resetTiles();
    } else if (attempts >= maxAttempts) {
        showFeedback(`Désolé, vous avez épuisé vos tentatives. La combinaison secrète était ${secretCode}.`);
        resetTiles();
    } else {
        resetTiles();
    }
}

function checkGuess(guess) {
    let wellPlaced = 0;
    let misplaced = 0;
    let secretArray = secretCode.split('');
    let guessArray = guess.split('');

    for (let i = 0; i < 4; i++) {
        if (guessArray[i] === secretArray[i]) {
            wellPlaced++;
            secretArray[i] = null;
            guessArray[i] = null;
        }
    }

    for (let i = 0; i < 4; i++) {
        if (guessArray[i] !== null) {
            const index = secretArray.indexOf(guessArray[i]);
            if (index !== -1) {
                misplaced++;
                secretArray[index] = null;
            }
        }
    }

    return `Bien placés: ${wellPlaced}, Mal placés: ${misplaced}`;
}

function showFeedback(message) {
    document.getElementById('feedback').innerText = message;
}

function addToHistory(guess, result) {
    const historyItem = document.createElement('div');
    historyItem.classList.add('history-item');

    guess.split('').forEach(digit => {
        const span = document.createElement('span');
        span.innerText = digit;
        span.classList.add('history-digit');
        historyItem.appendChild(span);
    });

    const resultSpan = document.createElement('span');
    resultSpan.classList.add('result');
    resultSpan.innerText = result;
    historyItem.appendChild(resultSpan);

    historyElement.appendChild(historyItem);
}

function resetTiles() {
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    proposalTiles.forEach(tile => {
        tile.textContent = '';
    });
    currentProposal = ['', '', '', ''];
    selectedIndex = 0;
    updateProposalTileSelection();
}

function openRulesPopup() {
    document.getElementById('rules-popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('rules-popup').style.display = 'none';
}

window.onload = function() {
    startCountdown();
    checkForMidnight();
}

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
    }, 60000); // Check every minute
}
