let secretCode = generateSecretCode();
let attempts = 0;
const maxAttempts = 10;
const historyElement = document.getElementById('history');
const countdownElement = document.getElementById('countdown');
const tiles = document.querySelectorAll('.tile');
const proposalTiles = document.querySelectorAll('.proposal-tile');
let currentProposal = ['', '', '', ''];
let selectedIndex = 0;
const excludedNumbers = [];
const excludedNumbersDiv = document.getElementById('excluded-numbers');
const excludeTile = document.getElementById('exclude-tile');
let isExcluding = false;

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
    proposalTiles.forEach((tile, index) => {
        tile.classList.toggle('selected', index === selectedIndex);
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

function clearAll() {
    currentProposal = ['', '', '', ''];
    proposalTiles.forEach(tile => {
        tile.textContent = '';
    });
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    selectedIndex = 0;
    isExcluding = false;
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
    currentProposal = ['', '', '', ''];
    proposalTiles.forEach(tile => {
        tile.textContent = '';
    });
    tiles.forEach(tile => {
        tile.classList.remove('disabled');
    });
    selectedIndex = 0;
    isExcluding = false;
    updateProposalTileSelection();
}

function openRulesPopup() {
    document.getElementById('rules-popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('rules-popup').style.display = 'none';
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
    for (let i = 0; i < currentProposal.length; i++) {
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
