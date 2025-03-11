document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    let combinationLength = 0;
    let maxAttempts = 10;

    switch (mode) {
        case '3easy':
        case '3hard':
            combinationLength = 3;
            break;
        case '4easy':
        case '4hard':
            combinationLength = 4;
            break;
        case '5easy':
        case '5hard':
            combinationLength = 5;
            break;
        default:
            combinationLength = 4; // Default for daily
    }

    const tilesContainer = document.getElementById('tiles');
    const attemptContainer = document.getElementById('attempt');
    const historyContainer = document.getElementById('history');
    const clearButton = document.getElementById('clear');
    const clearAllButton = document.getElementById('clearAll');
    const guessButton = document.getElementById('guess');
    const backButton = document.getElementById('back');

    let combination = generateCombination(combinationLength);
    let currentAttempt = Array(combinationLength).fill(null);
    let attempts = 0;
    let selectedIndex = 0;

    // 🟢 Générer le code journalier unique si on est en mode "daily"
    function getDailyUniqueCode() {
        let now = new Date();

        // Ajuster pour l'heure de Paris (hiver UTC+1, été UTC+2)
        let parisOffset = new Date().getTimezoneOffset() / -60;
        now.setHours(0 - parisOffset, 0, 0, 0);

        // Transformer la date en une graine unique (ex: 20240310 devient 20240310)
        let seed = parseInt(now.getFullYear().toString() +
                            (now.getMonth() + 1).toString().padStart(2, "0") +
                            now.getDate().toString().padStart(2, "0"));

        // Générer une liste de chiffres [0-9] et la mélanger selon la seed
        let digits = [...Array(10).keys()]; // [0,1,2,3,4,5,6,7,8,9]
        
        for (let i = digits.length - 1; i > 0; i--) {
            let j = (seed + i) % (i + 1); // Mélange pseudo-aléatoire basé sur la seed
            [digits[i], digits[j]] = [digits[j], digits[i]]; // Échanger les valeurs
        }

        // Prendre les 4 premiers chiffres mélangés
        return digits.slice(0, 4);
    }

    function generateCombination(length) {
        if (mode === "daily") {
            return getDailyUniqueCode();
        }

        const arr = [];
        while (arr.length < length) {
            const num = Math.floor(Math.random() * 10);
            if (!arr.includes(num)) {
                arr.push(num);
            }
        }
        return arr;
    }

    // 🔹 Maintenant, si mode = "daily", la combinaison sera fixe et identique pour tous
    console.log("Combinaison générée :", combination.join(""));

    // 🟢 Création des boutons de chiffres (0-9)
    for (let i = 0; i < 10; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => addToAttempt(i));
        tilesContainer.appendChild(button);
    }

    // 🟢 Création des champs pour la tentative
    for (let i = 0; i < combinationLength; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.readOnly = true;
        input.addEventListener('click', () => selectInput(i));
        attemptContainer.appendChild(input);
    }

    selectInput(selectedIndex);

    // 🟢 Initialisation de l'historique des tentatives
    for (let i = 0; i < maxAttempts; i++) {
        const attemptElement = document.createElement('div');
        attemptElement.className = 'attempt';

        const numberElement = document.createElement('div');
        numberElement.className = 'attempt-number';
        numberElement.textContent = i + 1;
        attemptElement.appendChild(numberElement);

        const tilesElement = document.createElement('div');
        tilesElement.className = 'attempt-tiles';

        for (let j = 0; j < combinationLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'attempt-tile';
            tilesElement.appendChild(tile);
        }

        const resultElement = document.createElement('div');
        resultElement.className = 'result';

        const wellPlaced = document.createElement('div');
        wellPlaced.className = 'well-placed';
        resultElement.appendChild(wellPlaced);

        const misplaced = document.createElement('div');
        misplaced.className = 'misplaced';
        resultElement.appendChild(misplaced);

        attemptElement.appendChild(tilesElement);
        attemptElement.appendChild(resultElement);
        historyContainer.appendChild(attemptElement);
    }

    clearButton.addEventListener('click', clearSelected);
    clearAllButton.addEventListener('click', clearAll);
    guessButton.addEventListener('click', makeGuess);
    backButton.addEventListener('click', () => window.location.href = 'index.html');

    function selectInput(index) {
        selectedIndex = index;
        for (let i = 0; i < combinationLength; i++) {
            attemptContainer.children[i].style.border = i === index ? '2px solid #A4BD01' : '2px solid #427AA1';
        }
    }

    function addToAttempt(num) {
    const oldNum = currentAttempt[selectedIndex]; // Sauvegarde l'ancien chiffre

    if (!currentAttempt.includes(num)) {
        currentAttempt[selectedIndex] = num;
        attemptContainer.children[selectedIndex].value = num;
        
        // Désactiver le bouton du nouveau chiffre
        tilesContainer.children[num].disabled = true;

        // Réactiver l'ancien chiffre s'il n'est plus dans la tentative
        if (oldNum !== null && !currentAttempt.includes(oldNum)) {
            tilesContainer.children[oldNum].disabled = false;
        }

        // Déplacement vers l'input suivant disponible
        let nextIndex = (selectedIndex + 1) % combinationLength;
        while (currentAttempt[nextIndex] !== null && nextIndex !== selectedIndex) {
            nextIndex = (nextIndex + 1) % combinationLength;
        }
        selectInput(nextIndex);
    }
}


  // Sélectionne le bouton "Rejouer"
const restartButton = document.getElementById('restart');

// Ajouter un event listener au bouton pour relancer une partie
restartButton.addEventListener('click', () => {
    resetGame();
    restartButton.style.display = 'none'; // Cacher à nouveau le bouton
});

function makeGuess() {
    if (!currentAttempt.includes(null)) {
        attempts++;
        const correctPositions = currentAttempt.filter((num, index) => num === combination[index]).length;
        const wrongPositions = currentAttempt.filter(num => combination.includes(num)).length - correctPositions;

        // Mise à jour de l'affichage de l'historique
        const attemptElements = historyContainer.getElementsByClassName('attempt');
        const currentAttemptElement = attemptElements[attempts - 1];

        const tilesElement = currentAttemptElement.getElementsByClassName('attempt-tiles')[0];
        for (let i = 0; i < combinationLength; i++) {
            const tile = tilesElement.children[i];
            tile.textContent = currentAttempt[i];

            // Appliquer les couleurs pour les modes faciles
            if (mode.includes('easy')) {
                if (currentAttempt[i] === combination[i]) {
                    tile.style.backgroundColor = '#A4BD01'; // Bien placé
                } else if (combination.includes(currentAttempt[i])) {
                    tile.style.backgroundColor = '#FEEAA1'; // Mal placé
                } else {
                    tile.style.backgroundColor = '#EBF2FA'; // Mauvaise réponse
                }
            }
        }

        // Affichage des résultats
        const resultElement = currentAttemptElement.getElementsByClassName('result')[0];
        resultElement.children[0].textContent = `Bien placés: ${correctPositions}`;
        resultElement.children[1].textContent = `Mal placés: ${wrongPositions}`;

        // Si le joueur gagne
        if (correctPositions === combinationLength) {
            alert(`Félicitations ! Vous avez trouvé la combinaison en ${attempts} tentatives.`);
            restartButton.style.display = 'inline-block'; // Afficher le bouton "Rejouer"
        }
        // Si le joueur perd
        else if (attempts === maxAttempts) {
            alert(`Vous avez perdu ! La combinaison était ${combination.join('')}.`);
            restartButton.style.display = 'inline-block'; // Afficher le bouton "Rejouer"
        }

        clearAll();
    }
}

function resetGame() {
    combination = generateCombination(combinationLength);
    currentAttempt = Array(combinationLength).fill(null);
    attempts = 0;
    selectedIndex = 0;

    // Réactiver tous les boutons de chiffres
    for (let button of tilesContainer.children) {
        button.disabled = false;
    }

    // Réinitialiser les inputs
    for (let input of attemptContainer.children) {
        input.value = '';
        input.style.border = '2px solid #427AA1';
    }

    selectInput(selectedIndex);

    // Effacer l'historique
    const attemptElements = historyContainer.getElementsByClassName('attempt');
    for (let attemptElement of attemptElements) {
        const tilesElement = attemptElement.getElementsByClassName('attempt-tiles')[0];
        for (let tile of tilesElement.children) {
            tile.textContent = '';
            tile.style.backgroundColor = ''; // Supprime la couleur
        }
        const resultElement = attemptElement.getElementsByClassName('result')[0];
        resultElement.children[0].textContent = '';
        resultElement.children[1].textContent = '';
    }
}

	 function clearSelected() {
        if (currentAttempt[selectedIndex] !== null) {
            const num = currentAttempt[selectedIndex];
            currentAttempt[selectedIndex] = null;
            attemptContainer.children[selectedIndex].value = '';
            tilesContainer.children[num].disabled = false;
        }
    }
	function clearAll() {
        for (let i = 0; i < combinationLength; i++) {
            selectedIndex = i;
            clearSelected();
        }
        selectedIndex = 0;
        selectInput(selectedIndex);
    }
});
// 🕒 Timer pour le mode Daily
function updateDailyTimer() {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0); // Minuit prochain

    const diff = nextMidnight - now;
    const hours = String(Math.floor(diff / 3600000)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    const seconds = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

    document.getElementById("daily-timer").textContent = `${hours}:${minutes}:${seconds}`;
}

// Mettre à jour le timer chaque seconde
setInterval(updateDailyTimer, 1000);
updateDailyTimer();





// Fonction pour démarrer un mode et générer les boutons avec les cases
function startMode(buttonId, length, isHardMode = false) {
    const buttonElement = document.getElementById(buttonId);
    buttonElement.innerHTML = ''; 

    const caseRow = document.createElement('div');
    caseRow.classList.add('case-row');

    for (let i = 0; i < length; i++) {
        const caseElement = document.createElement('div');
        caseElement.classList.add('case');

        if (isHardMode) {
            caseElement.classList.add('empty'); 
        } else {
            const randomColor = getRandomColor();
            caseElement.classList.add(randomColor);
        }

        const randomNumber = Math.floor(Math.random() * 10);
        caseElement.textContent = randomNumber;

        caseRow.appendChild(caseElement);
    }

    buttonElement.appendChild(caseRow);
	document.querySelector('.daily-button').addEventListener('click', function () {
    window.location.href = 'game.html?mode=daily';
});

    // 🔹 Redirection vers game.html avec le bon mode
    buttonElement.addEventListener('click', function () {
        const mode = `${length}${isHardMode ? 'hard' : 'easy'}`;
        window.location.href = `game.html?mode=${mode}`;
    });
}



// Fonction pour générer une couleur aléatoire parmi les options
function getRandomColor() {
    const colors = ['yellow', 'green'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Ajouter les modes facilement et difficilement lors du chargement de la page
window.onload = () => {
    // Générer les boutons pour les modes faciles et difficiles
    startMode('easy-3', 3);  // 3 chiffres pour le mode facile
    startMode('easy-4', 4);  // 4 chiffres pour le mode facile
    startMode('easy-5', 5);  // 5 chiffres pour le mode facile

    startMode('hard-3', 3, true);  // 3 chiffres pour le mode difficile (avec chiffres, mais vides visuellement)
    startMode('hard-4', 4, true);  // 4 chiffres pour le mode difficile (avec chiffres, mais vides visuellement)
    startMode('hard-5', 5, true);  // 5 chiffres pour le mode difficile (avec chiffres, mais vides visuellement)
};

