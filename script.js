
// =====================================
// BLACKJACK TRAINER
// HI-LO CARD COUNTING ENGINE
// =====================================

const TOTAL_DECKS = 6;
const CARDS_PER_DECK = 52;

// DOM ELEMENTS
const runningCountDisplay = document.getElementById("runningCount");
const trueCountDisplay = document.getElementById("trueCount");
const cardDisplay = document.getElementById("cardDisplay");
const cardsDealtDisplay = document.getElementById("cardsDealt");
const decksRemainingDisplay = document.getElementById("decksRemaining");

const dealBtn = document.getElementById("dealBtn");
const resetBtn = document.getElementById("resetBtn");

// CARD DATA
const suits = [
    { symbol: "♠", color: "black" },
    { symbol: "♥", color: "red" },
    { symbol: "♦", color: "red" },
    { symbol: "♣", color: "black" }
];

const ranks = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

// HI-LO VALUES
function getHiLoValue(rank) {
    if (["2", "3", "4", "5", "6"].includes(rank)) {
        return 1;
    }

    if (["7", "8", "9"].includes(rank)) {
        return 0;
    }

    return -1;
}

// CREATE A SIX-DECK SHOE
function createShoe() {
    const shoe = [];

    for (let deck = 0; deck < TOTAL_DECKS; deck++) {
        for (const suit of suits) {
            for (const rank of ranks) {
                shoe.push({
                    rank: rank,
                    suit: suit.symbol,
                    color: suit.color,
                    value: getHiLoValue(rank)
                });
            }
        }
    }

    return shuffleShoe(shoe);
}

// SHUFFLE CARDS
function shuffleShoe(shoe) {
    for (let i = shoe.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shoe[i], shoe[j]] = [shoe[j], shoe[i]];
    }

    return shoe;
}

// SESSION VARIABLES
let shoe = [];
let runningCount = 0;
let cardsDealt = 0;
let dealtCards = [];

// START NEW SESSION
function resetSession() {
    shoe = createShoe();

    runningCount = 0;
    cardsDealt = 0;
    dealtCards = [];

    updateDisplay();

    dealBtn.disabled = false;
    dealBtn.textContent = "Deal Card";
}

// DEAL ONE CARD
function dealCard() {
    if (shoe.length === 0) {
        dealBtn.disabled = true;
        dealBtn.textContent = "Shoe Empty";
        return;
    }

    const card = shoe.pop();

    dealtCards.push(card);

    runningCount += card.value;
    cardsDealt++;

    updateDisplay();
}

// UPDATE THE INTERFACE
function updateDisplay() {
    const remainingCards = shoe.length;

    const remainingDecks = remainingCards / CARDS_PER_DECK;

    // Calculate true count
    let trueCount = 0;

    if (remainingDecks > 0) {
        trueCount = runningCount / remainingDecks;
    }

    runningCountDisplay.textContent = runningCount;

    trueCountDisplay.textContent =
        remainingCards > 0 ? trueCount.toFixed(2) : "--";

    cardsDealtDisplay.textContent = cardsDealt;

    decksRemainingDisplay.textContent =
        remainingDecks.toFixed(2);

    renderCards();

    if (remainingCards === 0) {
        dealBtn.disabled = true;
        dealBtn.textContent = "Shoe Empty";
    }
}

// DISPLAY DEALT CARDS
function renderCards() {
    cardDisplay.innerHTML = "";

    if (dealtCards.length === 0) {
        cardDisplay.innerHTML = `
            <p class="empty-message">
                Start dealing to begin your session.
            </p>
        `;
        return;
    }

    // Show the latest 12 cards
    const visibleCards = dealtCards.slice(-12);

    visibleCards.forEach(card => {
        const cardElement = document.createElement("div");

        cardElement.className =
            `playing-card ${card.color}`;

        cardElement.innerHTML = `
            <span>${card.rank}</span>
            <span class="card-bottom">${card.suit}</span>
        `;

        cardDisplay.appendChild(cardElement);
    });
}

// BUTTON EVENTS
dealBtn.addEventListener("click", dealCard);

resetBtn.addEventListener("click", resetSession);

// INITIALIZE TRAINER
resetSession();
