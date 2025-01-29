// Fonction pour obtenir la date du jour en format YYYY-MM-DD
function getCurrentDate() {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Ex: "2024-01-29"
}

// Fonction pour générer un calcul unique chaque jour
function generateDailyCalculation() {
    const date = new Date();
    const seed = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate(); // Unique par jour

    // Générer des nombres pseudo-aléatoires basés sur la date
    const num1 = (seed % 10) + 1;
    const num2 = ((seed * 3) % 10) + 1;
    
    const operation = (seed % 2 === 0) ? "+" : "*"; // Alterner entre + et *
    const correctAnswer = (operation === "+") ? num1 + num2 : num1 * num2;

    return { question: `${num1} ${operation} ${num2} = ?`, answer: correctAnswer };
}

// Vérifier si l'utilisateur a déjà joué aujourd'hui
function checkPlayAvailability() {
    const lastPlayedDate = localStorage.getItem('lastPlayedDate');
    const currentDate = getCurrentDate();

    return lastPlayedDate !== currentDate; // true = peut jouer, false = doit attendre
}

// Mettre à jour le compte à rebours
function updateCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Prochain minuit

    const timeLeft = midnight - now;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    document.getElementById("countdown").textContent = `${hours}h ${minutes}m ${seconds}s`;

    setTimeout(updateCountdown, 1000); // Mettre à jour chaque seconde
}

// Initialisation du jeu
function initGame() {
    const canPlay = checkPlayAvailability();
    const dailyCalculation = generateDailyCalculation();

    document.getElementById("calculation").textContent = dailyCalculation.question;
    
    if (!canPlay) {
        document.getElementById("resultMessage").textContent = "🚫 Tu as déjà joué aujourd'hui. Reviens demain !";
        document.getElementById("submitAnswer").disabled = true;
        document.getElementById("userAnswer").disabled = true;
    } else {
        document.getElementById("submitAnswer").addEventListener("click", function() {
            const userAnswer = parseInt(document.getElementById("userAnswer").value, 10);
            
            if (userAnswer === dailyCalculation.answer) {
                document.getElementById("resultMessage").textContent = "🎉 Bravo, bonne réponse !";
            } else {
                document.getElementById("resultMessage").textContent = "❌ Mauvaise réponse, réessaie demain.";
            }

            // Enregistrer que l'utilisateur a joué aujourd'hui
            localStorage.setItem('lastPlayedDate', getCurrentDate());
            document.getElementById("submitAnswer").disabled = true;
            document.getElementById("userAnswer").disabled = true;
        });
    }

    // Lancer le compte à rebours
    updateCountdown();
}

// Démarrer le jeu quand la page est chargée
document.addEventListener("DOMContentLoaded", initGame);
