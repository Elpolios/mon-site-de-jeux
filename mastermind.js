let secretCode = generateSecretCode();
let attempts = 0;
const maxAttempts = 10;
const historyElement = document.getElementById('history');
const countdownElement = document.getElementById('countdown');

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

function makeGuess() {
    const guess1 = document.getElementById('guess1').value;
    const guess2 = document.getElementById('guess2').value;
    const guess3 = document.getElementById('guess3').value;
    const guess4 = document.getElementById('guess4').value;
    const guess = guess1 + guess2 + guess3 + guess4;

    if (guess.length !== 4 || new Set(guess).size !== 4) {
        showFeedback('Veuillez entrer une combinaison de 4 chiffres uniques.');
        return;
    }

    attempts++;
    const result = checkGuess(guess);
    showFeedback(`Tentative ${attempts}: ${result}`);
    addToHistory(guess, result);

    if (guess === secretCode) {
        showFeedback('Félicitations ! Vous avez trouvé la combinaison secrète !');
    } else if (attempts >= maxAttempts) {
        showFeedback(`Désolé, vous avez épuisé vos tentatives. La combinaison secrète était ${secretCode}.`);
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
        historyItem.appendChild(span);
    });

    const resultSpan = document.createElement('span');
    resultSpan.innerText = result;
    resultSpan.style.marginLeft = '20px';
    historyItem.appendChild(resultSpan);

    historyElement.appendChild(historyItem);
}

// Afficher la pop-up au chargement de la page
window.onload = function() {
    document.getElementById('rules-popup').style.display = 'flex';
    startCountdown();
}

// Fermer la pop-up
function closePopup() {
    document.getElementById('rules-popup').style.display = 'none';
}

// Compte à rebours jusqu'à minuit
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
