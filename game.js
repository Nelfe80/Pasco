/* ==========================================================================
   PASCO - GAME ENGINE & UI CONTROLLER
   ========================================================================== */

// --- ÉTAT DU JEU ---
let gameState = {
    playerName: "Joueur",
    targetScore: 11,
    currentRound: 1,
    scores: { human: 0, computer: 0 },
    roundScores: {
        human: { pascos: 0, cards: 0, yellows: 0, crowned: 0, sevens: 0, sixes: 0, total: 0 },
        computer: { pascos: 0, cards: 0, yellows: 0, crowned: 0, sevens: 0, sixes: 0, total: 0 }
    },
    deck: [],
    table: [],
    handHuman: [],
    handComputer: [],
    pileHuman: [],
    pileComputer: [],
    humanPascoCards: [], // Cards marked as PASCO (face up)
    computerPascoCards: [],
    lastWinner: null, // "human" or "computer" (who made the last capture)
    bonusUsedThisRound: { human: false, computer: false },
    activeTurn: "human", // "human" or "computer"
    selectedHandCard: null,
    pendingSpecialCard: null, // Card currently chosen for special effect check
    pendingSpecialCallback: null,
    history: []
};

// --- INITIALISATION DES ÉVÉNEMENTS ---
document.addEventListener("DOMContentLoaded", () => {
    // Éléments du DOM
    const startBtn = document.getElementById("start-btn");
    const rulesBtn = document.getElementById("rules-btn");
    const closeRulesBtn = document.getElementById("close-rules-btn");
    const quitBtn = document.getElementById("quit-btn");
    const handBonusBtn = document.getElementById("hand-bonus-btn");
    const nextRoundBtn = document.getElementById("next-round-btn");
    const restartBtn = document.getElementById("restart-btn");
    const gameOverHomeBtn = document.getElementById("game-over-home-btn");

    // Écrans & Modales
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const rulesModal = document.getElementById("rules-modal");
    const roundModal = document.getElementById("round-modal");
    const specialChoiceModal = document.getElementById("special-choice-modal");
    const gameOverModal = document.getElementById("game-over-modal");

    // Boutons de choix spécial
    const specialEffectBtn = document.getElementById("special-effect-btn");
    const specialNormalBtn = document.getElementById("special-normal-btn");

    // Démarrage de partie
    startBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("player-name").value.trim();
        gameState.playerName = nameInput ? nameInput : "Joueur";
        
        const targetRadio = document.querySelector('input[name="target-score"]:checked');
        gameState.targetScore = parseInt(targetRadio.value, 10);

        // Mettre à jour les noms dans le DOM
        document.getElementById("sidebar-human-name").textContent = gameState.playerName;
        document.getElementById("board-human-name").textContent = gameState.playerName;
        document.getElementById("modal-human-header").textContent = gameState.playerName;
        document.getElementById("final-name-human").textContent = gameState.playerName;
        document.getElementById("target-score-display").textContent = gameState.targetScore;

        // Transition d'écran
        homeScreen.classList.remove("active");
        gameScreen.classList.add("active");

        showToast(`Bienvenue ${gameState.playerName} ! La partie commence.`);
        startNewGame();
    });

    // Règles du jeu
    rulesBtn.addEventListener("click", () => {
        rulesModal.classList.add("active");
    });

    closeRulesBtn.addEventListener("click", () => {
        rulesModal.classList.remove("active");
    });

    // Quitter la partie
    quitBtn.addEventListener("click", () => {
        if (confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
            gameScreen.classList.remove("active");
            homeScreen.classList.add("active");
        }
    });

    // Modale de fin de manche
    nextRoundBtn.addEventListener("click", () => {
        roundModal.classList.remove("active");
        startNewRound();
    });

    // Modale de fin de partie
    restartBtn.addEventListener("click", () => {
        gameOverModal.classList.remove("active");
        startNewGame();
    });

    gameOverHomeBtn.addEventListener("click", () => {
        gameOverModal.classList.remove("active");
        gameScreen.classList.remove("active");
        homeScreen.classList.add("active");
    });

    // Bonus de main
    handBonusBtn.addEventListener("click", () => {
        if (gameState.activeTurn !== "human" || gameState.bonusUsedThisRound.human) return;
        triggerHumanHandBonus();
    });

    // Choix de cartes spéciales
    specialEffectBtn.addEventListener("click", () => {
        specialChoiceModal.classList.remove("active");
        if (gameState.pendingSpecialCallback) {
            gameState.pendingSpecialCallback(true);
        }
    });

    specialNormalBtn.addEventListener("click", () => {
        specialChoiceModal.classList.remove("active");
        if (gameState.pendingSpecialCallback) {
            gameState.pendingSpecialCallback(false);
        }
    });
});

// --- CRÉATION ET CRASH DU JEU ---

function startNewGame() {
    gameState.scores = { human: 0, computer: 0 };
    gameState.currentRound = 1;
    gameState.history = [];
    document.getElementById("total-score-human").textContent = "0";
    document.getElementById("total-score-computer").textContent = "0";
    document.getElementById("history-list").innerHTML = '<div class="empty-history">Aucune manche jouée.</div>';
    
    startNewRound();
}

function startNewRound() {
    document.getElementById("round-indicator").textContent = `Manche ${gameState.currentRound}`;
    
    // Réinitialiser les tas et les mains
    gameState.deck = createDeck();
    gameState.table = [];
    gameState.handHuman = [];
    gameState.handComputer = [];
    gameState.pileHuman = [];
    gameState.pileComputer = [];
    gameState.humanPascoCards = [];
    gameState.computerPascoCards = [];
    gameState.lastWinner = null;
    gameState.bonusUsedThisRound = { human: false, computer: false };
    gameState.activeTurn = "human";
    gameState.selectedHandCard = null;

    // Réinitialiser le décompte des points temporaires de manche
    gameState.roundScores = {
        human: { pascos: 0, cards: 0, yellows: 0, crowned: 0, sevens: 0, sixes: 0, total: 0 },
        computer: { pascos: 0, cards: 0, yellows: 0, crowned: 0, sevens: 0, sixes: 0, total: 0 }
    };

    // Mélanger le deck
    shuffle(gameState.deck);

    // Mettre en place la table initiale (4 cartes face visible)
    for (let i = 0; i < 4; i++) {
        gameState.table.push(gameState.deck.pop());
    }

    // Distribuer les mains de départ (3 cartes chacun)
    distributeCards();

    // Mettre à jour l'affichage
    updateUI();
    checkBonusEligibility();
    
    showToast("Nouvelle manche ! À vous de jouer.");
}

// Génère un jeu de 40 cartes : 10 jaunes (1-10) et 30 bleues (1-10 répété 3 fois)
function createDeck() {
    let deck = [];
    let id = 1;

    // 10 Cartes Jaunes
    for (let val = 1; val <= 10; val++) {
        deck.push({
            id: id++,
            value: val,
            color: "yellow",
            isCrowned: val === 7 // Seul le 7 jaune est couronné
        });
    }

    // 30 Cartes Bleues (3 de chaque valeur de 1 à 10)
    for (let rep = 0; rep < 3; rep++) {
        for (let val = 1; val <= 10; val++) {
            deck.push({
                id: id++,
                value: val,
                color: "blue",
                isCrowned: false
            });
        }
    }

    return deck;
}

// Mélange Fisher-Yates
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Distribue 3 cartes à chaque joueur
function distributeCards() {
    if (gameState.deck.length >= 6) {
        for (let i = 0; i < 3; i++) {
            gameState.handHuman.push(gameState.deck.pop());
            gameState.handComputer.push(gameState.deck.pop());
        }
    }
}

// --- LOGIQUE VISUELLE (RENDU DES CARTES & UI) ---

function updateUI() {
    // Mettre à jour les compteurs
    document.getElementById("deck-card-count").textContent = gameState.deck.length;
    
    // Stats de plis
    document.getElementById("human-cards-won").textContent = gameState.pileHuman.length;
    document.getElementById("human-yellows-won").textContent = countYellows(gameState.pileHuman);
    document.getElementById("human-pasco-count").textContent = gameState.roundScores.human.pascos;

    document.getElementById("comp-cards-won").textContent = gameState.pileComputer.length;
    document.getElementById("comp-yellows-won").textContent = countYellows(gameState.pileComputer);
    document.getElementById("comp-pasco-count").textContent = gameState.roundScores.computer.pascos;

    // Rendre la table
    renderTableCards();

    // Rendre les mains
    renderHumanHand();
    renderComputerHand();
}

function countYellows(pile) {
    return pile.filter(c => c.color === "yellow").length;
}

// Rendu des cartes au centre
function renderTableCards() {
    const tableContainer = document.getElementById("table-cards");
    tableContainer.innerHTML = "";

    if (gameState.table.length === 0) {
        tableContainer.innerHTML = '<div class="empty-table-msg">La table est vide.</div>';
        return;
    }

    gameState.table.forEach(card => {
        const cardElement = createCardDOM(card);
        cardElement.addEventListener("click", () => handleTableCardClick(card, cardElement));
        tableContainer.appendChild(cardElement);
    });
}

// Rendu des cartes en main du Joueur
function renderHumanHand() {
    const handContainer = document.getElementById("human-hand");
    handContainer.innerHTML = "";

    gameState.handHuman.forEach(card => {
        const cardElement = createCardDOM(card);
        
        // Sélection de carte en main
        cardElement.addEventListener("click", () => {
            if (gameState.activeTurn !== "human") return;
            
            // Si on est en train de choisir des cibles pour un As/7 spécial, on ne change pas de carte
            if (document.querySelectorAll(".selectable-target").length > 0) {
                showToast("Veuillez d'abord sélectionner vos cibles sur la table !");
                return;
            }

            // Dé-sélectionner la précédente
            const selected = handContainer.querySelector(".selected");
            if (selected) selected.classList.remove("selected");

            if (gameState.selectedHandCard && gameState.selectedHandCard.id === card.id) {
                gameState.selectedHandCard = null;
                document.getElementById("action-prompt").textContent = "Sélectionnez une carte pour jouer";
                clearTableHighlights();
            } else {
                gameState.selectedHandCard = card;
                cardElement.classList.add("selected");
                document.getElementById("action-prompt").textContent = "Cliquez sur la table pour jouer la carte ou faire un pli";
                highlightTableCaptures(card);
            }
        });

        handContainer.appendChild(cardElement);
    });
}

// Rendu des dos de cartes de l'ordinateur
function renderComputerHand() {
    const handContainer = document.getElementById("computer-hand");
    handContainer.innerHTML = "";

    gameState.handComputer.forEach(() => {
        const cardElement = document.createElement("div");
        cardElement.className = "card card-back";
        const pattern = document.createElement("div");
        pattern.className = "card-back-pattern";
        cardElement.appendChild(pattern);
        handContainer.appendChild(cardElement);
    });
}

// Utilitaire de création de carte HTML
function createCardDOM(card) {
    const cardDiv = document.createElement("div");
    cardDiv.className = `card ${card.color} ${card.isCrowned ? 'crowned' : ''}`;
    cardDiv.dataset.id = card.id;

    // Coin supérieur
    const topCorner = document.createElement("div");
    topCorner.className = "card-corner top";
    const valueSpan = document.createElement("span");
    valueSpan.textContent = card.value === 1 ? "As" : card.value;
    const suitSpan = document.createElement("span");
    suitSpan.className = "card-suit-mini";
    suitSpan.textContent = card.color === "yellow" ? "🟡" : "🔵";
    topCorner.appendChild(valueSpan);
    topCorner.appendChild(suitSpan);

    // Centre
    const center = document.createElement("div");
    center.className = "card-center";
    center.textContent = card.value;

    // Coin inférieur
    const bottomCorner = document.createElement("div");
    bottomCorner.className = "card-corner bottom";
    const valueSpanB = document.createElement("span");
    valueSpanB.textContent = card.value === 1 ? "As" : card.value;
    const suitSpanB = document.createElement("span");
    suitSpanB.className = "card-suit-mini";
    suitSpanB.textContent = card.color === "yellow" ? "🟡" : "🔵";
    bottomCorner.appendChild(valueSpanB);
    bottomCorner.appendChild(suitSpanB);

    cardDiv.appendChild(topCorner);
    cardDiv.appendChild(center);
    cardDiv.appendChild(bottomCorner);

    return cardDiv;
}

// --- SYSTÈME DE CAPTURE ET RÈGLES ---

// Trouve toutes les façons de faire une somme cible à partir des cartes du centre
function highlightTableCaptures(playedCard) {
    clearTableHighlights();

    const val = playedCard.value;
    const targets = findOptimalCaptures(val, gameState.table);

    if (targets.length > 0) {
        // Mettre en surbrillance les cartes capturables par défaut
        targets.forEach(card => {
            const cardEl = document.querySelector(`#table-cards .card[data-id="${card.id}"]`);
            if (cardEl) {
                cardEl.classList.add("selectable-target");
            }
        });
    }
}

function clearTableHighlights() {
    document.querySelectorAll("#table-cards .card").forEach(el => {
        el.className = el.className.replace(/\b(selectable-target|target-selected)\b/g, "").trim();
    });
}

// --- ALGORITHME DE RESOLUTION OPTIMALE DES COMBINAISONS ---

function findOptimalCaptures(playedValue, tableCards) {
    // On veut trouver la meilleure combinaison de sous-ensembles disjoints
    // qui somment chacun à playedValue (ou qui matchent la valeur directement)
    let bestSet = [];
    let bestScore = -1;

    // Fonction récursive de recherche
    function search(index, currentTable, currentCaptures) {
        // Évaluer le score actuel si on s'arrête
        let score = evaluateCaptureSet(currentCaptures);
        if (score > bestScore) {
            bestScore = score;
            bestSet = [...currentCaptures];
        }

        for (let i = index; i < currentTable.length; i++) {
            // Trouver tous les sous-ensembles de currentTable à partir de i qui somment à playedValue
            let subsets = findSubsetsSummingTo(playedValue, currentTable, i);
            for (let subset of subsets) {
                // Créer la nouvelle table sans le sous-ensemble choisi
                let nextTable = currentTable.filter(c => !subset.includes(c));
                search(i, nextTable, [...currentCaptures, ...subset]);
            }
        }
    }

    search(0, tableCards, []);
    return bestSet;
}

// Recherche tous les sous-ensembles d'une liste qui somment à la cible
function findSubsetsSummingTo(target, cards, startIndex) {
    let results = [];

    function backtrack(idx, currentSubset, currentSum) {
        if (currentSum === target) {
            results.push([...currentSubset]);
            return;
        }
        if (currentSum > target || idx >= cards.length) {
            return;
        }

        for (let i = idx; i < cards.length; i++) {
            currentSubset.push(cards[i]);
            backtrack(i + 1, currentSubset, currentSum + cards[i].value);
            currentSubset.pop();
        }
    }

    backtrack(startIndex, [], 0);
    return results;
}

// Calcule l'intérêt stratégique d'un ensemble de cartes capturées
function evaluateCaptureSet(cards) {
    if (cards.length === 0) return 0;
    
    let score = 0;
    cards.forEach(card => {
        score += 100; // Chaque carte vaut 100
        if (card.color === "yellow") {
            score += 1000; // Chaque carte jaune vaut +1000
        }
        if (card.isCrowned) {
            score += 100000; // Le 7 jaune couronné est la priorité absolue !
        }
        if (card.value === 7) {
            score += 500; // Les 7 normaux valent +500
        }
        if (card.value === 6) {
            score += 100; // Les 6 (bris d'égalité) valent +100
        }
    });
    return score;
}

// --- TOUR DE JEU DU JOUEUR HUMAIN ---

// Clic sur une carte de la table (centre)
function handleTableCardClick(clickedCard, cardElement) {
    if (gameState.activeTurn !== "human" || !gameState.selectedHandCard) return;

    const playedCard = gameState.selectedHandCard;

    // Cas d'une carte spéciale en cours de sélection de cible unique (As effect)
    if (gameState.pendingSpecialCard && gameState.pendingSpecialCard.value === 1) {
        // L'effet de l'As permet de voler une carte au choix du centre
        executeAceEffect(playedCard, clickedCard);
        return;
    }

    // Cas normal : Vérifier si la carte cliquée fait partie des cibles de capture optimales
    const optimalCaptures = findOptimalCaptures(playedCard.value, gameState.table);
    
    // Si la carte fait partie des cibles valides
    if (optimalCaptures.some(c => c.id === clickedCard.id)) {
        // Faire la capture de toutes les cibles optimales d'un coup (pour fluidifier)
        executeCapture(playedCard, optimalCaptures, "human");
    } else {
        // Si on clique sur la table mais qu'aucun pli n'est possible avec cette carte,
        // on défausse la carte au centre (seulement si le pli optimal global pour cette carte est vide)
        if (optimalCaptures.length === 0) {
            executeDiscard(playedCard, "human");
        } else {
            showToast("Vous pouvez faire un pli ! Sélectionnez une carte en surbrillance.");
        }
    }
}

// Permet de cliquer sur la zone vide du centre pour défausser sa carte
document.getElementById("table-cards").addEventListener("click", (e) => {
    if (gameState.activeTurn !== "human" || !gameState.selectedHandCard) return;
    
    // Si on clique sur la zone vide
    if (e.target.id === "table-cards" || e.target.classList.contains("empty-table-msg")) {
        const playedCard = gameState.selectedHandCard;
        const optimalCaptures = findOptimalCaptures(playedCard.value, gameState.table);

        if (optimalCaptures.length === 0) {
            executeDiscard(playedCard, "human");
        } else {
            showToast("Vous devez capturer les cartes possibles ! Cliquez sur une carte brillante.");
        }
    }
});

// --- EXÉCUTION DES COUPS ---

// Défausser une carte au centre
function executeDiscard(playedCard, player) {
    // Retirer de la main
    if (player === "human") {
        gameState.handHuman = gameState.handHuman.filter(c => c.id !== playedCard.id);
        gameState.selectedHandCard = null;
    } else {
        gameState.handComputer = gameState.handComputer.filter(c => c.id !== playedCard.id);
    }

    // Ajouter à la table
    gameState.table.push(playedCard);
    
    showToast(`${player === "human" ? gameState.playerName : "L'ordinateur"} a posé un ${playedCard.value} au centre.`);
    
    clearTableHighlights();
    endTurn();
}

// Effectuer un pli standard
function executeCapture(playedCard, targetCards, player) {
    // Retirer de la main
    if (player === "human") {
        gameState.handHuman = gameState.handHuman.filter(c => c.id !== playedCard.id);
        gameState.selectedHandCard = null;
    } else {
        gameState.handComputer = gameState.handComputer.filter(c => c.id !== playedCard.id);
    }

    // Retirer les cartes de la table
    const targetIds = targetCards.map(c => c.id);
    gameState.table = gameState.table.filter(c => !targetIds.includes(c.id));

    // Ajouter à la pile du joueur
    const pile = player === "human" ? gameState.pileHuman : gameState.pileComputer;
    pile.push(playedCard, ...targetCards);

    // Définir le dernier gagnant de pli (pour la fin de manche)
    gameState.lastWinner = player;

    // Message
    const targetStr = targetCards.map(c => `${c.value}${c.color === "yellow" ? "🟨" : ""}`).join(" + ");
    showToast(`${player === "human" ? gameState.playerName : "L'ordinateur"} a capturé [${targetStr}] avec un ${playedCard.value}.`);

    // Gérer les effets de carte spéciale en mode normal (si non joué avec l'effet spécial)
    // Pas de logique d'effet spécial ici car c'est une capture normale.

    // Détection de PASCO
    if (gameState.table.length === 0) {
        triggerPasco(player, playedCard);
    }

    clearTableHighlights();
    endTurn();
}

// Célébration et attribution du point PASCO
function triggerPasco(player, triggerCard) {
    const roundScore = player === "human" ? gameState.roundScores.human : gameState.roundScores.computer;
    roundScore.pascos += 1;

    // Mémoriser la carte retournée face visible pour marquer le PASCO
    if (player === "human") {
        gameState.humanPascoCards.push(triggerCard);
    } else {
        gameState.computerPascoCards.push(triggerCard);
    }

    // Effet visuel
    const banner = document.getElementById("pasco-banner");
    banner.classList.add("show");
    setTimeout(() => {
        banner.classList.remove("show");
    }, 1500);

    showToast(`⚡ PASCO pour ${player === "human" ? gameState.playerName : "l'ordinateur"} ! (+1 Point)`);
}

// --- LOGIQUE DES CARTES SPÉCIALES (AS, 7 JAUNE, 7 BLEU) ---

// Vérifie si une carte est spéciale au moment où elle est sélectionnée pour être jouée
function checkSpecialCardAndPlay(card, player, onDecisionReady) {
    const val = card.value;
    
    // Si c'est un As (1) ou un 7 (bleu ou jaune couronné)
    if (val === 1 || val === 7) {
        if (player === "human") {
            // Demander au joueur via modale
            gameState.pendingSpecialCard = card;
            gameState.pendingSpecialCallback = (useEffect) => {
                gameState.pendingSpecialCard = null;
                gameState.pendingSpecialCallback = null;
                onDecisionReady(useEffect);
            };
            
            // Personnaliser la modale de choix
            const titleEl = document.getElementById("special-card-title");
            const descEl = document.getElementById("special-effect-desc");
            const normalDescEl = document.getElementById("special-normal-desc");
            
            if (val === 1) {
                titleEl.textContent = "As Spécial !";
                descEl.textContent = "Voler n'importe quelle carte du centre. L'As reste sur la table.";
                normalDescEl.textContent = "Capturer un As au centre ou faire une somme de 1.";
            } else if (card.isCrowned) {
                titleEl.textContent = "7 Jaune Couronné !";
                descEl.textContent = "Gagner TOUTES les cartes de valeur inférieure à 7. Le 7 couronné reste sur la table.";
                normalDescEl.textContent = "Capturer un 7 ou faire une somme de 7.";
            } else {
                titleEl.textContent = "7 Bleu Spécial !";
                descEl.textContent = "Gagner TOUTES les cartes de valeur supérieure à 7. Le 7 bleu reste sur la table.";
                normalDescEl.textContent = "Capturer un 7 ou faire une somme de 7.";
            }
            
            document.getElementById("special-choice-modal").classList.add("active");
        } else {
            // L'IA décide
            const useEffect = decideAISpecialEffect(card);
            onDecisionReady(useEffect);
        }
    } else {
        // Carte classique, jeu normal
        onDecisionReady(false);
    }
}

// L'As permet de voler une carte au choix, et l'As reste au centre
function executeAceEffect(playedCard, targetCard) {
    // Retirer de la main
    gameState.handHuman = gameState.handHuman.filter(c => c.id !== playedCard.id);
    gameState.selectedHandCard = null;
    gameState.pendingSpecialCard = null;

    // Retirer la cible de la table
    gameState.table = gameState.table.filter(c => c.id !== targetCard.id);

    // Ajouter la cible à la pile du joueur
    gameState.pileHuman.push(targetCard);
    gameState.lastWinner = "human";

    // L'As est posé au centre de la table
    gameState.table.push(playedCard);

    showToast(`${gameState.playerName} a utilisé l'effet de l'As pour voler le ${targetCard.value}${targetCard.color === "yellow" ? "🟨" : ""}. L'As reste au centre.`);
    
    clearTableHighlights();
    endTurn();
}

// Le 7 Couronné vole tout < 7, le 7 reste au centre
function executeCrowned7Effect(playedCard, player) {
    const pile = player === "human" ? gameState.pileHuman : gameState.pileComputer;
    
    // Capturer toutes les cartes < 7 du centre
    const captured = gameState.table.filter(c => c.value < 7);
    const capturedIds = captured.map(c => c.id);
    
    gameState.table = gameState.table.filter(c => !capturedIds.includes(c.id));
    pile.push(...captured);

    if (captured.length > 0) {
        gameState.lastWinner = player;
    }

    // Le 7 reste au centre
    gameState.table.push(playedCard);

    // Retirer de la main
    if (player === "human") {
        gameState.handHuman = gameState.handHuman.filter(c => c.id !== playedCard.id);
        gameState.selectedHandCard = null;
    } else {
        gameState.handComputer = gameState.handComputer.filter(c => c.id !== playedCard.id);
    }

    const name = player === "human" ? gameState.playerName : "L'ordinateur";
    showToast(`${name} a joué le 7 Jaune Couronné et a volé toutes les cartes < 7 (${captured.length} cartes).`);

    clearTableHighlights();
    endTurn();
}

// Le 7 Bleu vole tout > 7, le 7 reste au centre
function executeBlue7Effect(playedCard, player) {
    const pile = player === "human" ? gameState.pileHuman : gameState.pileComputer;
    
    // Capturer toutes les cartes > 7 du centre
    const captured = gameState.table.filter(c => c.value > 7);
    const capturedIds = captured.map(c => c.id);
    
    gameState.table = gameState.table.filter(c => !capturedIds.includes(c.id));
    pile.push(...captured);

    if (captured.length > 0) {
        gameState.lastWinner = player;
    }

    // Le 7 reste au centre
    gameState.table.push(playedCard);

    // Retirer de la main
    if (player === "human") {
        gameState.handHuman = gameState.handHuman.filter(c => c.id !== playedCard.id);
        gameState.selectedHandCard = null;
    } else {
        gameState.handComputer = gameState.handComputer.filter(c => c.id !== playedCard.id);
    }

    const name = player === "human" ? gameState.playerName : "L'ordinateur";
    showToast(`${name} a joué le 7 Bleu et a volé toutes les cartes > 7 (${captured.length} cartes).`);

    clearTableHighlights();
    endTurn();
}

// --- BONUS DE MAIN ---

function checkBonusEligibility() {
    const btn = document.getElementById("hand-bonus-btn");
    btn.classList.add("disabled");
    btn.disabled = true;

    if (gameState.bonusUsedThisRound.human || gameState.handHuman.length !== 3) return;

    // Condition 1 : 3 cartes identiques
    const val0 = gameState.handHuman[0].value;
    const val1 = gameState.handHuman[1].value;
    const val2 = gameState.handHuman[2].value;
    const allIdentical = (val0 === val1 && val1 === val2);

    // Condition 2 : Somme <= 7
    const sum = val0 + val1 + val2;
    const sumLow = (sum <= 7);

    if (allIdentical || sumLow) {
        btn.classList.remove("disabled");
        btn.disabled = false;
    }
}

function triggerHumanHandBonus() {
    gameState.bonusUsedThisRound.human = true;
    document.getElementById("hand-bonus-btn").classList.add("disabled");
    document.getElementById("hand-bonus-btn").disabled = true;

    // Demander de choisir une carte à mettre dans sa pile personnelle
    showToast("Bonus de main activé ! Sélectionnez une carte de votre main à mettre dans votre pile.");
    
    // Modifier temporairement le comportement des cartes en main pour le bonus
    const cardsEl = document.querySelectorAll("#human-hand .card");
    
    // Supprimer les écouteurs précédents en clonant les nœuds
    cardsEl.forEach(cardEl => {
        const id = parseInt(cardEl.dataset.id, 10);
        const cardObj = gameState.handHuman.find(c => c.id === id);
        
        const newEl = cardEl.cloneNode(true);
        newEl.addEventListener("click", () => {
            // Mettre la carte choisie dans la pile personnelle
            gameState.handHuman = gameState.handHuman.filter(c => c.id !== cardObj.id);
            gameState.pileHuman.push(cardObj);

            showToast(`Bonus de main : vous avez placé un ${cardObj.value} directement dans vos gains. Votre tour prend fin.`);
            
            // Re-rendre la main normalement et finir le tour
            renderHumanHand();
            endTurn();
        });
        cardEl.parentNode.replaceChild(newEl, cardEl);
    });
}

// --- TOUR DE L'ORDINATEUR (IA) ---

function runComputerTurn() {
    document.getElementById("action-prompt").textContent = "L'ordinateur réfléchit...";
    
    setTimeout(() => {
        // 1. Vérifier si l'ordinateur est éligible au Bonus de Main
        if (checkAIBonusEligibility()) {
            executeAIBonus();
            return;
        }

        // 2. Évaluer les coups possibles
        let bestPlay = evaluateAICoups();

        if (bestPlay) {
            // Exécuter le meilleur coup
            if (bestPlay.useSpecialEffect) {
                if (bestPlay.card.value === 1) {
                    // Effet de l'As : Capturer la carte ciblée de la table
                    executeAceEffectAI(bestPlay.card, bestPlay.targetCard);
                } else if (bestPlay.card.isCrowned) {
                    executeCrowned7Effect(bestPlay.card, "computer");
                } else {
                    executeBlue7Effect(bestPlay.card, "computer");
                }
            } else {
                // Jeu normal (pli ou défausse)
                if (bestPlay.targets.length > 0) {
                    executeCapture(bestPlay.card, bestPlay.targets, "computer");
                } else {
                    executeDiscard(bestPlay.card, "computer");
                }
            }
        } else {
            // Cas de secours (ne devrait jamais arriver si main non vide)
            if (gameState.handComputer.length > 0) {
                executeDiscard(gameState.handComputer[0], "computer");
            } else {
                endTurn();
            }
        }
    }, 1500); // Petit délai pour simuler la réflexion
}

// As joué par l'ordinateur pour son effet
function executeAceEffectAI(playedCard, targetCard) {
    gameState.handComputer = gameState.handComputer.filter(c => c.id !== playedCard.id);
    gameState.table = gameState.table.filter(c => c.id !== targetCard.id);
    gameState.pileComputer.push(targetCard);
    gameState.lastWinner = "computer";
    gameState.table.push(playedCard);

    showToast(`L'ordinateur a utilisé l'effet de l'As pour voler le ${targetCard.value}${targetCard.color === "yellow" ? "🟨" : ""}. L'As reste au centre.`);
    endTurn();
}

// Décide si l'ordinateur active ou non le bonus de main
function checkAIBonusEligibility() {
    if (gameState.bonusUsedThisRound.computer || gameState.handComputer.length !== 3) return false;
    const val0 = gameState.handComputer[0].value;
    const val1 = gameState.handComputer[1].value;
    const val2 = gameState.handComputer[2].value;
    const allIdentical = (val0 === val1 && val1 === val2);
    const sumLow = (val0 + val1 + val2 <= 7);

    // L'ordinateur l'utilise s'il n'a pas de bons plis à faire avec sa main actuelle
    if (allIdentical || sumLow) {
        let bestPlay = evaluateAICoups();
        // Si le meilleur pli rapporte moins de 300 points d'évaluation
        if (!bestPlay || bestPlay.evalScore < 300) {
            return true;
        }
    }
    return false;
}

// Exécute le bonus de main pour l'ordinateur
function executeAIBonus() {
    gameState.bonusUsedThisRound.computer = true;
    
    // Choisir la carte la moins utile à mettre dans la pile (ex. plus faible valeur bleue)
    let sortedHand = [...gameState.handComputer].sort((a, b) => {
        // Priorité de préservation : Crowned 7 > Jaunes > 7 normaux > valeur
        if (a.isCrowned) return 1;
        if (b.isCrowned) return -1;
        if (a.color === "yellow" && b.color !== "yellow") return 1;
        if (b.color === "yellow" && a.color !== "yellow") return -1;
        return a.value - b.value;
    });

    let chosenCard = sortedHand[0];
    gameState.handComputer = gameState.handComputer.filter(c => c.id !== chosenCard.id);
    gameState.pileComputer.push(chosenCard);

    showToast(`🤖 L'ordinateur a activé son Bonus de main et a sécurisé un ${chosenCard.value}. Son tour prend fin.`);
    endTurn();
}

// Décide de l'effet spécial pour l'ordinateur (renvoie true ou false)
function decideAISpecialEffect(card) {
    if (card.value === 1) {
        // Pour l'As : l'utiliser si la table contient une carte de valeur >= 7 ou une jaune intéressante
        return gameState.table.some(c => c.value >= 7 || c.color === "yellow");
    } else if (card.isCrowned) {
        // 7 jaune : l'utiliser s'il y a au moins 2 cartes de valeur < 7 ou une jaune < 7
        const count = gameState.table.filter(c => c.value < 7).length;
        const hasYellow = gameState.table.some(c => c.value < 7 && c.color === "yellow");
        return (count >= 2 || hasYellow);
    } else if (card.value === 7) {
        // 7 bleu : l'utiliser s'il y a au moins 2 cartes de valeur > 7 ou une jaune > 7
        const count = gameState.table.filter(c => c.value > 7).length;
        const hasYellow = gameState.table.some(c => c.value > 7 && c.color === "yellow");
        return (count >= 2 || hasYellow);
    }
    return false;
}

// Analyse toutes les combinaisons possibles de l'ordinateur et retourne le meilleur coup
function evaluateAICoups() {
    let plays = [];

    gameState.handComputer.forEach(card => {
        // Option A : Coup Normal (Capture de somme / valeur identique)
        const targets = findOptimalCaptures(card.value, gameState.table);
        let normalScore = evaluateCaptureSet(targets);
        
        // Si la capture vide la table (PASCO)
        if (targets.length === gameState.table.length && gameState.table.length > 0) {
            normalScore += 10000;
        }

        plays.push({
            card: card,
            useSpecialEffect: false,
            targets: targets,
            targetCard: null,
            evalScore: normalScore
        });

        // Option B : Coup Spécial (si As ou 7)
        if (card.value === 1) {
            // Effet As : Choisir la carte du centre la plus intéressante
            gameState.table.forEach(tableCard => {
                let specScore = evaluateCaptureSet([tableCard]) - 50; // Malus car l'As reste au centre
                plays.push({
                    card: card,
                    useSpecialEffect: true,
                    targets: [],
                    targetCard: tableCard,
                    evalScore: specScore
                });
            });
        } else if (card.isCrowned && card.value === 7) {
            // Effet 7 Jaune Couronné : gagne tout < 7, le 7 reste au centre
            const targetsSpec = gameState.table.filter(c => c.value < 7);
            let specScore = evaluateCaptureSet(targetsSpec) - 100; // Malus car le 7 reste au centre
            plays.push({
                card: card,
                useSpecialEffect: true,
                targets: [],
                targetCard: null,
                evalScore: specScore
            });
        } else if (card.value === 7) {
            // Effet 7 Bleu : gagne tout > 7, le 7 reste au centre
            const targetsSpec = gameState.table.filter(c => c.value > 7);
            let specScore = evaluateCaptureSet(targetsSpec) - 100; // Malus
            plays.push({
                card: card,
                useSpecialEffect: true,
                targets: [],
                targetCard: null,
                evalScore: specScore
            });
        }
    });

    // Trier les coups par score d'évaluation décroissant
    plays.sort((a, b) => b.evalScore - a.evalScore);

    // Si le meilleur score est > 0, on choisit ce coup
    if (plays.length > 0 && plays[0].evalScore > 0) {
        return plays[0];
    }

    // Sinon, on doit défausser. On évalue la carte la moins dangereuse à défausser
    let sortedDiscards = [...gameState.handComputer].sort((a, b) => {
        // Préserver le 7 couronné, puis les jaunes, puis les 7
        if (a.isCrowned) return 1;
        if (b.isCrowned) return -1;
        if (a.color === "yellow" && b.color !== "yellow") return 1;
        if (b.color === "yellow" && a.color !== "yellow") return -1;
        if (a.value === 7 && b.value !== 7) return 1;
        if (b.value === 7 && a.value !== 7) return -1;
        return a.value - b.value; // Défausser les plus petites valeurs en priorité
    });

    return {
        card: sortedDiscards[0],
        useSpecialEffect: false,
        targets: [],
        targetCard: null,
        evalScore: 0
    };
}

// --- GESTION DES TOURS ET FIN DE MANCHE ---

function endTurn() {
    updateUI();

    // Vérifier si la manche est terminée (mains et pioche vides)
    if (gameState.handHuman.length === 0 && gameState.handComputer.length === 0) {
        if (gameState.deck.length > 0) {
            // Si la pioche n'est pas vide, redistribuer
            distributeCards();
            updateUI();
            checkBonusEligibility();
            gameState.activeTurn = "human";
            document.getElementById("action-prompt").textContent = "Sélectionnez une carte pour jouer";
        } else {
            // Fin de la manche
            endRound();
        }
    } else {
        // Alterner les tours
        if (gameState.activeTurn === "human") {
            gameState.activeTurn = "computer";
            runComputerTurn();
        } else {
            gameState.activeTurn = "human";
            checkBonusEligibility();
            document.getElementById("action-prompt").textContent = "Sélectionnez une carte pour jouer";
        }
    }
}

function endRound() {
    // 1. Les cartes restantes au centre sont gagnées par le dernier joueur ayant fait un pli
    if (gameState.table.length > 0 && gameState.lastWinner) {
        const pile = gameState.lastWinner === "human" ? gameState.pileHuman : gameState.pileComputer;
        pile.push(...gameState.table);
        showToast(`Dernier pli : les cartes restantes au centre sont remportées par ${gameState.lastWinner === "human" ? gameState.playerName : "l'ordinateur"}.`);
        gameState.table = [];
    }

    updateUI();

    // 2. Calcul des points de manche
    const pts = calculateRoundPoints();
    
    // 3. Ajouter les points au score cumulé total
    gameState.scores.human += pts.human;
    gameState.scores.computer += pts.computer;

    document.getElementById("total-score-human").textContent = gameState.scores.human;
    document.getElementById("total-score-computer").textContent = gameState.scores.computer;

    // 4. Ajouter à l'historique des manches
    addRoundToHistory(gameState.currentRound, pts.human, pts.computer);

    // 5. Afficher la modale de fin de manche
    showRoundSummaryModal(pts);
}

// Calcul des points selon les règles de PASCO
function calculateRoundPoints() {
    let hPoints = 0;
    let cPoints = 0;

    // Détail pour le débogage et l'affichage dans la modale
    const hCardsCount = gameState.pileHuman.length;
    const cCardsCount = gameState.pileComputer.length;

    const hYellowsCount = countYellows(gameState.pileHuman);
    const cYellowsCount = countYellows(gameState.pileComputer);

    const hasHCrowned = gameState.pileHuman.some(c => c.isCrowned);
    const hasCCrowned = gameState.pileComputer.some(c => c.isCrowned);

    const hSevensCount = gameState.pileHuman.filter(c => c.value === 7).length;
    const cSevensCount = gameState.pileComputer.filter(c => c.value === 7).length;

    const hSixesCount = gameState.pileHuman.filter(c => c.value === 6).length;
    const cSixesCount = gameState.pileComputer.filter(c => c.value === 6).length;

    // Points PASCO cumulés en cours de jeu
    let hPascoPts = gameState.roundScores.human.pascos;
    let cPascoPts = gameState.roundScores.computer.pascos;

    // Majorité de cartes (1 pt)
    let hCardsPt = 0, cCardsPt = 0;
    if (hCardsCount > cCardsCount) hCardsPt = 1;
    else if (cCardsCount > hCardsCount) cCardsPt = 1;

    // Majorité de jaunes (1 pt)
    let hYellowsPt = 0, cYellowsPt = 0;
    if (hYellowsCount > cYellowsCount) hYellowsPt = 1;
    else if (cYellowsCount > hYellowsCount) cYellowsPt = 1;

    // 7 Jaune Couronné (1 pt)
    let hCrownedPt = hasHCrowned ? 1 : 0;
    let cCrownedPt = hasCCrowned ? 1 : 0;

    // Majorité de 7 (1 pt) - Bris d'égalité par les 6
    let hSevensPt = 0, cSevensPt = 0;
    if (hSevensCount > cSevensCount) {
        hSevensPt = 1;
    } else if (cSevensCount > hSevensCount) {
        cSevensPt = 1;
    } else if (hSevensCount === cSevensCount && hSevensCount > 0) {
        // Égalité des 7 : départager par les 6
        if (hSixesCount > cSixesCount) hSevensPt = 1;
        else if (cSixesCount > hSixesCount) cSevensPt = 1;
    }

    // Totaux de manche
    const humanTotal = hPascoPts + hCardsPt + hYellowsPt + hCrownedPt + hSevensPt;
    const compTotal = cPascoPts + cCardsPt + cYellowsPt + cCrownedPt + cSevensPt;

    return {
        human: {
            pascos: hPascoPts, cards: hCardsPt, yellows: hYellowsPt, crowned: hCrownedPt, sevens: hSevensPt,
            cardsCount: hCardsCount, yellowsCount: hYellowsCount, sevensCount: hSevensCount, sixesCount: hSixesCount,
            total: humanTotal
        },
        computer: {
            pascos: cPascoPts, cards: cCardsPt, yellows: cYellowsPt, crowned: cCrownedPt, sevens: cSevensPt,
            cardsCount: cCardsCount, yellowsCount: cYellowsCount, sevensCount: cSevensCount, sixesCount: cSixesCount,
            total: compTotal
        }
    };
}

// Affiche la modale de récapitulatif
function showRoundSummaryModal(pts) {
    document.getElementById("modal-round-num").textContent = gameState.currentRound;

    // Points PASCO
    document.getElementById("summary-h-pascos").textContent = `${pts.human.pascos}`;
    document.getElementById("summary-c-pascos").textContent = `${pts.computer.pascos}`;

    // Cartes
    document.getElementById("summary-h-cards-pt").textContent = pts.human.cards;
    document.getElementById("summary-c-cards-pt").textContent = pts.computer.cards;
    document.getElementById("cards-count-details").textContent = `(${pts.human.cardsCount} vs ${pts.computer.cardsCount})`;

    // Jaunes
    document.getElementById("summary-h-yellows-pt").textContent = pts.human.yellows;
    document.getElementById("summary-c-yellows-pt").textContent = pts.computer.yellows;
    document.getElementById("yellows-count-details").textContent = `(${pts.human.yellowsCount} vs ${pts.computer.yellowsCount})`;

    // 7 Couronné
    document.getElementById("summary-h-crowned-pt").textContent = pts.human.crowned;
    document.getElementById("summary-c-crowned-pt").textContent = pts.computer.crowned;

    // Majorité de 7 (bris de 6)
    document.getElementById("summary-h-sevens-pt").textContent = pts.human.sevens;
    document.getElementById("summary-c-sevens-pt").textContent = pts.computer.sevens;
    document.getElementById("sevens-count-details").textContent = `(7s: ${pts.human.sevensCount}vs${pts.computer.sevensCount} | 6s: ${pts.human.sixesCount}vs${pts.computer.sixesCount})`;

    // Totaux
    document.getElementById("summary-h-round-total").textContent = pts.human.total;
    document.getElementById("summary-c-round-total").textContent = pts.computer.total;

    document.getElementById("summary-h-cumulative").textContent = gameState.scores.human;
    document.getElementById("summary-c-cumulative").textContent = gameState.scores.computer;

    // Événement bouton modale
    const nextBtn = document.getElementById("next-round-btn");
    
    // Vérifier si la partie est finie
    if (gameState.scores.human >= gameState.targetScore || gameState.scores.computer >= gameState.targetScore) {
        nextBtn.textContent = "Voir le Vainqueur";
        nextBtn.onclick = () => {
            document.getElementById("round-modal").classList.remove("active");
            triggerGameOver();
        };
    } else {
        nextBtn.textContent = "Manche Suivante";
        nextBtn.onclick = () => {
            document.getElementById("round-modal").classList.remove("active");
            gameState.currentRound += 1;
            startNewRound();
        };
    }

    document.getElementById("round-modal").classList.add("active");
}

// Fin de partie
function triggerGameOver() {
    const isHumanWinner = gameState.scores.human >= gameState.scores.computer;
    
    const announcement = document.getElementById("winner-announcement");
    if (isHumanWinner) {
        announcement.textContent = `Félicitations ${gameState.playerName}, vous avez gagné ! 🏆`;
    } else {
        announcement.textContent = "L'ordinateur a gagné la partie ! 🤖";
    }

    document.getElementById("final-score-human").textContent = gameState.scores.human;
    document.getElementById("final-score-computer").textContent = gameState.scores.computer;

    document.getElementById("game-over-modal").classList.add("active");
}

// Ajoute une ligne dans l'historique de la barre latérale
function addRoundToHistory(roundNum, humanPts, compPts) {
    const list = document.getElementById("history-list");
    const emptyMsg = list.querySelector(".empty-history");
    if (emptyMsg) {
        list.innerHTML = "";
    }

    const item = document.createElement("div");
    item.className = "history-item";
    item.innerHTML = `
        <span>Manche ${roundNum}</span>
        <span>${gameState.playerName}: <strong>+${humanPts.total}</strong> | Robot: <strong>+${compPts.total}</strong></span>
    `;
    list.appendChild(item);
    list.scrollTop = list.scrollHeight;
}

// Notification d'état flottante
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Clic pour jouer une carte spéciale (gestionnaire de choix d'effet)
function handleSpecialCardChoice(card, player, onDone) {
    checkSpecialCardAndPlay(card, player, (useEffect) => {
        if (useEffect) {
            // Appliquer l'effet spécial
            if (card.value === 1) {
                // Pour l'As : l'effet demande au joueur de sélectionner une cible sur la table.
                // Donc on ne finit pas le coup immédiatement. On met la table en surbrillance d'une autre couleur
                // et on passe en mode attente de sélection de cible.
                if (player === "human") {
                    showToast("Sélectionnez une carte du centre à voler.");
                    clearTableHighlights();
                    // Mettre en surbrillance toutes les cartes de la table
                    document.querySelectorAll("#table-cards .card").forEach(el => {
                        el.classList.add("selectable-target");
                    });
                    // On garde la carte en main sélectionnée et on attend le clic table
                } else {
                    // Pour l'ordinateur, l'IA a déjà choisi sa cible dans bestPlay
                    onDone(true);
                }
            } else if (card.isCrowned) {
                // 7 couronné : voler tout < 7, le 7 reste
                executeCrowned7Effect(card, player);
            } else {
                // 7 bleu : voler tout > 7, le 7 reste
                executeBlue7Effect(card, player);
            }
        } else {
            // Jeu normal : Pli normal ou défausse standard
            onDone(false);
        }
    });
}

// Ré-écriture de handleTableCardClick pour intégrer les décisions de cartes spéciales du Joueur Humain
const originalTableCardClick = handleTableCardClick;
handleTableCardClick = function(clickedCard, cardElement) {
    if (gameState.activeTurn !== "human" || !gameState.selectedHandCard) return;
    const playedCard = gameState.selectedHandCard;

    // Si on a déjà choisi d'activer l'effet de l'As
    if (gameState.pendingSpecialCard && gameState.pendingSpecialCard.value === 1) {
        executeAceEffect(playedCard, clickedCard);
        return;
    }

    // Si c'est un As ou un 7 non encore décidé
    if ((playedCard.value === 1 || playedCard.value === 7) && !gameState.pendingSpecialCard) {
        handleSpecialCardChoice(playedCard, "human", (useEffect) => {
            if (!useEffect) {
                // Si jeu normal, on exécute comme d'habitude
                const optimalCaptures = findOptimalCaptures(playedCard.value, gameState.table);
                if (optimalCaptures.some(c => c.id === clickedCard.id)) {
                    executeCapture(playedCard, optimalCaptures, "human");
                } else {
                    if (optimalCaptures.length === 0) {
                        executeDiscard(playedCard, "human");
                    } else {
                        showToast("Vous pouvez faire un pli ! Sélectionnez une carte en surbrillance.");
                    }
                }
            } else {
                // Si As spécial activé, on attend le clic sur la cible
                if (playedCard.value === 1) {
                    gameState.pendingSpecialCard = playedCard;
                }
            }
        });
    } else {
        // Carte classique, comportement normal
        originalTableCardClick(clickedCard, cardElement);
    }
};
