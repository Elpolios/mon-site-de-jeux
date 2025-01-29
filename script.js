window.onload = function() {
    // Génère deux nombres aléatoires pour le calcul
    const number1 = Math.floor(Math.random() * 10) + 1;
    const number2 = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = number1 + number2;

    // Affiche la question sur la page
    document.getElementById("question").textContent = `Quel est le résultat de ${number1} + ${number2} ?`;

    // Écoute l'événement sur le bouton "Soumettre"
    document.getElementById("submit-answer").addEventListener("click", function() {
        // Récupère la réponse de l'utilisateur
        const userAnswer = document.getElementById("answer").value;

        // Vérifie si la réponse est correcte
        const resultElement = document.getElementById("result");
        if (parseInt(userAnswer) === correctAnswer) {
            resultElement.textContent = "Bravo, tu as trouvé la bonne réponse !";
            resultElement.style.color = "green";  // Couleur verte pour la victoire
        } else {
            resultElement.textContent = `Dommage ! La bonne réponse était ${correctAnswer}.`;
            resultElement.style.color = "red";  // Couleur rouge pour l'échec
        }

        // Désactive l'input et le bouton après soumission
        document.getElementById("answer").disabled = true;
        document.getElementById("submit-answer").disabled = true;
    });
};
// Fonction pour obtenir la date actuelle au format YYYY-MM-DD
function getCurrentDate() {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format : "YYYY-MM-DD"
}

// Vérifier si l'utilisateur peut jouer
function checkPlayAvailability() {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate'); // Récupère la dernière date de jeu enregistrée

    const currentDate = getCurrentDate();

    if (lastPlayedDate) {
        // Si la date du dernier jeu est aujourd'hui, on empêche l'utilisateur de jouer
        if (lastPlayedDate === currentDate) {
            alert("Tu as déjà joué aujourd'hui. Viens revenir demain !");
            return false;
        }
    }
    
    // Si l'utilisateur peut jouer, on enregistre la date du jour actuel
    localStorage.setItem('lastPlayedDate', currentDate);
    return true;
}

// Exemple d'utilisation
function startGame() {
    if (checkPlayAvailability()) {
        // L'utilisateur peut jouer, commence le jeu ici
        console.log("Tu peux jouer maintenant !");
        // Ton code de jeu ici...
    } else {
        // L'utilisateur doit attendre jusqu'au jour suivant
        console.log("Attends jusqu'au jour suivant.");
    }
}

// Appeler la fonction pour démarrer le jeu
startGame();
