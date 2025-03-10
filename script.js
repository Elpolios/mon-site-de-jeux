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
        if (!currentAttempt.includes(num)) {
            currentAttempt[selectedIndex] = num;
            attemptContainer.children[selectedIndex].value = num;
            tilesContainer.children[num].disabled = true;

            let nextIndex = (selectedIndex + 1) % combinationLength;
            while (currentAttempt[nextIndex] !== null && nextIndex !== selectedIndex) {
                nextIndex = (nextIndex + 1) % combinationLength;
            }
            selectInput(nextIndex);
        }
    }

    function makeGuess() {
        if (!currentAttempt.includes(null)) {
            attempts++;
            const correctPositions = currentAttempt.filter((num, index) => num === combination[index]).length;
            const wrongPositions = currentAttempt.filter(num => combination.includes(num)).length - correctPositions;

            const attemptElements = historyContainer.getElementsByClassName('attempt');
            const currentAttemptElement = attemptElements[attempts - 1];

            const tilesElement = currentAttemptElement.getElementsByClassName('attempt-tiles')[0];
            for (let i = 0; i < combinationLength; i++) {
                const tile = tilesElement.children[i];
                tile.textContent = currentAttempt[i];
            }

            const resultElement = currentAttemptElement.getElementsByClassName('result')[0];
            resultElement.children[0].textContent = `Bien placés: ${correctPositions}`;
            resultElement.children[1].textContent = `Mal placés: ${wrongPositions}`;

            if (correctPositions === combinationLength) {
                alert(`Félicitations ! Vous avez trouvé la combinaison en ${attempts} tentatives.`);
                resetGame();
            } else if (attempts === maxAttempts) {
                alert(`Vous avez perdu ! La combinaison était ${combination.join('')}.`);
                resetGame();
            }

            clearAll();
        }
    }

    function resetGame() {
        combination = generateCombination(combinationLength);
        currentAttempt = Array(combinationLength).fill(null);
        attempts = 0;
        selectedIndex = 0;
        selectInput(selectedIndex);
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
