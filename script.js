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

    // Create tiles
    for (let i = 0; i < 10; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => addToAttempt(i));
        tilesContainer.appendChild(button);
    }

    // Create attempt inputs
    for (let i = 0; i < combinationLength; i++) {
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.readOnly = true;
        input.addEventListener('click', () => selectInput(i));
        attemptContainer.appendChild(input);
    }

    // Pre-select the first input
    selectInput(selectedIndex);

    // Initialize history with 10 empty attempts
    for (let i = 0; i < maxAttempts; i++) {
        const attemptElement = document.createElement('div');
        attemptElement.className = 'attempt';

        const tilesElement = document.createElement('div');
        tilesElement.className = 'attempt-tiles';

        for (let j = 0; j < combinationLength; j++) {
            const tile = document.createElement('div');
            tile.className = 'attempt-tile';
            tilesElement.appendChild(tile);
        }

        const resultElement = document.createElement('div');
        resultElement.className = 'result';

        attemptElement.appendChild(tilesElement);
        attemptElement.appendChild(resultElement);
        historyContainer.appendChild(attemptElement);
    }

    clearButton.addEventListener('click', clearSelected);
    clearAllButton.addEventListener('click', clearAll);
    guessButton.addEventListener('click', makeGuess);
    backButton.addEventListener('click', () => window.location.href = 'index.html');

    function generateCombination(length) {
        const arr = [];
        while (arr.length < length) {
            const num = Math.floor(Math.random() * 10);
            if (!arr.includes(num)) {
                arr.push(num);
            }
        }
        return arr;
    }

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

            // Move to the next empty input or stay if all are filled
            let nextIndex = (selectedIndex + 1) % combinationLength;
            while (currentAttempt[nextIndex] !== null && nextIndex !== selectedIndex) {
                nextIndex = (nextIndex + 1) % combinationLength;
            }
            selectInput(nextIndex);
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

    function makeGuess() {
        if (!currentAttempt.includes(null)) {
            const correctPositions = currentAttempt.filter((num, index) => num === combination[index]).length;
            const wrongPositions = currentAttempt.filter(num => combination.includes(num)).length - correctPositions;

            // Fill the history from the bottom up
            const attemptElements = historyContainer.getElementsByClassName('attempt');
            const currentAttemptElement = attemptElements[attempts];

            const tilesElement = currentAttemptElement.getElementsByClassName('attempt-tiles')[0];
            for (let i = 0; i < combinationLength; i++) {
                tilesElement.children[i].textContent = currentAttempt[i];
            }

            const resultElement = currentAttemptElement.getElementsByClassName('result')[0];
            resultElement.textContent = `Bien placés: ${correctPositions}, Mal placés: ${wrongPositions}`;

            attempts++;

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
        for (let button of tilesContainer.children) {
            button.disabled = false;
        }
        for (let input of attemptContainer.children) {
            input.value = '';
            input.style.border = '2px solid #427AA1';
        }
        selectInput(selectedIndex);

        // Clear history
        const attemptElements = historyContainer.getElementsByClassName('attempt');
        for (let attemptElement of attemptElements) {
            const tilesElement = attemptElement.getElementsByClassName('attempt-tiles')[0];
            for (let tile of tilesElement.children) {
                tile.textContent = '';
            }
            const resultElement = attemptElement.getElementsByClassName('result')[0];
            resultElement.textContent = '';
        }
    }
});
