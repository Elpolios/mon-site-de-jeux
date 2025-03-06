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
            attemptContainer.children[i].style.border = i === index ? '2px solid blue' : '1px solid black';
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
            attempts++;
            const correctPositions = currentAttempt.filter((num, index) => num === combination[index]).length;
            const wrongPositions = currentAttempt.filter(num => combination.includes(num)).length - correctPositions;

            const historyItem = document.createElement('div');
            historyItem.textContent = `Tentative ${attempts}: ${currentAttempt.join('')} - Bien placés: ${correctPositions}, Mal placés: ${wrongPositions}`;
            historyContainer.appendChild(historyItem);

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
        historyContainer.innerHTML = '';
        for (let button of tilesContainer.children) {
            button.disabled = false;
        }
        for (let input of attemptContainer.children) {
            input.value = '';
            input.style.border = '1px solid black';
        }
        selectInput(selectedIndex);
    }
});
