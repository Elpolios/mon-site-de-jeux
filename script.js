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
