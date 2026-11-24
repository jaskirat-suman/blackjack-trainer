
/* =========================================
   BLACKJACK SHOE TRACKER
   HI-LO COMPOSITION ENGINE
========================================= */

// CONFIGURATION

const RANKS = [
    "A", "2", "3", "4", "5", "6", "7",
    "8", "9", "10", "J", "Q", "K"
];

const CARDS_PER_DECK = 52;

// DOM ELEMENTS

const deckSelector = document.getElementById("deckSelector");
const cardButtons = document.getElementById("cardButtons");
const compositionChart = document.getElementById("compositionChart");

const totalCardsDisplay = document.getElementById("totalCards");
const remainingCardsDisplay = document.getElementById("remainingCards");
const runningCountDisplay = document.getElementById("runningCount");
const trueCountDisplay = document.getElementById("trueCount");

const decksRemainingDisplay = document.getElementById("decksRemaining");
const cardsDealtDisplay = document.getElementById("cardsDealt");
const shoeStatusDisplay = document.getElementById("shoeStatus");

const sequenceInput = document.getElementById("sequenceInput");
const sequenceBtn = document.getElementById("sequenceBtn");
const inputMessage = document.getElementById("inputMessage");

const cardHistory = document.getElementById("cardHistory");
const undoBtn = document.getElementById("undoBtn");
const resetBtn = document.getElementById("resetBtn");

// SESSION DATA

let totalDecks = 6;
let totalCards = totalDecks * CARDS_PER_DECK;

let remaining = {};
let history = [];
let runningCount = 0;

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

// INITIALIZE SHOE

function initializeShoe() {

    totalDecks = Number(deckSelector.value);
    totalCards = totalDecks * CARDS_PER_DECK;

    remaining = {};

    RANKS.forEach(rank => {
        remaining[rank] = totalDecks * 4;
    });

    history = [];
    runningCount = 0;

    sequenceInput.value = "";

    showMessage("", false);

    renderCardButtons();
    updateDisplay();
}

// RENDER CARD BUTTONS

function renderCardButtons() {

    cardButtons.innerHTML = "";

    RANKS.forEach(rank => {

        const button = document.createElement("button");

        button.className = "card-btn";
        button.textContent = rank;

        button.setAttribute(
            "aria-label",
            `Record a ${rank}`
        );

        button.addEventListener("click", () => {
            recordCard(rank);
        });

        cardButtons.appendChild(button);
    });
}

// RECORD ONE CARD

function recordCard(rank) {

    if (!RANKS.includes(rank)) {
        showMessage("Invalid card rank.", true);
        return false;
    }

    if (remaining[rank] <= 0) {
        showMessage(
            `No ${rank} cards remain in this shoe.`,
            true
        );

        return false;
    }

    remaining[rank]--;

    history.push(rank);

    runningCount += getHiLoValue(rank);

    showMessage(`${rank} recorded successfully.`, false);

    updateDisplay();

    return true;
}

// RECORD A SEQUENCE

function recordSequence() {

    const rawInput = sequenceInput.value.trim();

    if (!rawInput) {
        showMessage("Enter at least one card.", true);
        return;
    }

    // Accept commas, spaces and semicolons.
    const entries = rawInput
        .toUpperCase()
        .replace(/;/g, ",")
        .split(/[,\s]+/)
        .filter(Boolean)
        .map(rank => rank === "T" ? "10" : rank);

    // Validate all entries before recording.
    const invalidRanks = entries.filter(
        rank => !RANKS.includes(rank)
    );

    if (invalidRanks.length > 0) {
        showMessage(
            `Invalid card entries: ${invalidRanks.join(", ")}`,
            true
        );

        return;
    }

    // Count requested cards by rank.
    const requested = {};

    entries.forEach(rank => {
        requested[rank] = (requested[rank] || 0) + 1;
    });

    // Check remaining availability.
    for (const rank in requested) {

        if (requested[rank] > remaining[rank]) {

            showMessage(
                `Not enough ${rank} cards remaining. Sequence rejected.`,
                true
            );

            return;
        }
    }

    // Record all cards after successful validation.
    entries.forEach(rank => {

        remaining[rank]--;

        history.push(rank);

        runningCount += getHiLoValue(rank);

    });

    sequenceInput.value = "";

    showMessage(
        `${entries.length} cards recorded successfully.`,
        false
    );

    updateDisplay();
}

// UNDO LAST CARD

function undoLastCard() {

    if (history.length === 0) {
        showMessage("Nothing to undo.", true);
        return;
    }

    const lastRank = history.pop();

    remaining[lastRank]++;

    runningCount -= getHiLoValue(lastRank);

    showMessage(`${lastRank} entry undone.`, false);

    updateDisplay();
}

// CALCULATE REMAINING CARDS

function getRemainingTotal() {

    return Object.values(remaining).reduce(
        (sum, quantity) => sum + quantity,
        0
    );
}

// UPDATE ALL DISPLAYS

function updateDisplay() {

    const remainingTotal = getRemainingTotal();

    const dealtTotal = history.length;

    const remainingDecks = remainingTotal / CARDS_PER_DECK;

    const trueCount = remainingDecks > 0
        ? runningCount / remainingDecks
        : null;

    totalCardsDisplay.textContent = totalCards;

    remainingCardsDisplay.textContent = remainingTotal;

    runningCountDisplay.textContent = runningCount;

    trueCountDisplay.textContent =
        trueCount === null ? "--" : trueCount.toFixed(2);

    decksRemainingDisplay.textContent =
        remainingDecks.toFixed(2);

    cardsDealtDisplay.textContent = dealtTotal;

    shoeStatusDisplay.textContent =
        `${remainingTotal} / ${totalCards}`;

    renderCompositionChart();

    updateCardButtons();

    renderHistory();

    undoBtn.disabled = history.length === 0;
}

// RENDER COMPOSITION CHART

function renderCompositionChart() {

    compositionChart.innerHTML = "";

    RANKS.forEach(rank => {

        const initialQuantity = totalDecks * 4;

        const currentQuantity = remaining[rank];

        const percentage =
            (currentQuantity / initialQuantity) * 100;

        const row = document.createElement("div");

        row.className = "composition-row";

        const label = document.createElement("span");

        label.className = "rank-label";
        label.textContent = rank;

        const track = document.createElement("div");

        track.className = "bar-track";

        const fill = document.createElement("div");

        fill.className = "bar-fill";
        fill.style.width = `${percentage}%`;

        if (currentQuantity === 0) {
            fill.style.opacity = "0.15";
        }

        const quantity = document.createElement("span");

        quantity.className = "card-quantity";
        quantity.textContent = currentQuantity;

        track.appendChild(fill);

        row.appendChild(label);
        row.appendChild(track);
        row.appendChild(quantity);

        compositionChart.appendChild(row);
    });
}

// DISABLE EXHAUSTED CARD BUTTONS

function updateCardButtons() {

    const buttons = cardButtons.querySelectorAll("button");

    buttons.forEach((button, index) => {

        const rank = RANKS[index];

        button.disabled = remaining[rank] === 0;

    });
}

// RENDER CARD HISTORY

function renderHistory() {

    cardHistory.innerHTML = "";

    if (history.length === 0) {

        cardHistory.innerHTML = `
            <p class="helper-text">
                No cards recorded yet.
            </p>
        `;

        return;
    }

    // Display most recent 30 entries.
    const visibleHistory = history.slice(-30);

    visibleHistory.forEach((rank, index) => {

        const item = document.createElement("span");

        item.className = "history-card";

        item.textContent = rank;

        cardHistory.appendChild(item);
    });

    if (history.length > 30) {

        const note = document.createElement("p");

        note.className = "helper-text";

        note.textContent =
            `Showing the latest 30 of ${history.length} cards.`;

        cardHistory.appendChild(note);
    }
}

// DISPLAY MESSAGES

function showMessage(message, isError) {

    inputMessage.textContent = message;

    inputMessage.className = isError
        ? "message error"
        : "message";
}

// RESET SESSION

function resetSession() {

    initializeShoe();
}

// EVENT LISTENERS

deckSelector.addEventListener("change", resetSession);

sequenceBtn.addEventListener("click", recordSequence);

sequenceInput.addEventListener("keydown", event => {

    if (event.key === "Enter") {
        recordSequence();
    }

});

undoBtn.addEventListener("click", undoLastCard);

resetBtn.addEventListener("click", resetSession);

// START APPLICATION

initializeShoe();
