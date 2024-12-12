const API_URL_PRICES = "https://prices.runescape.wiki/api/v1/osrs/latest";
const API_URL_MAPPING = "https://prices.runescape.wiki/api/v1/osrs/mapping";

// Elements
const item1Name = document.getElementById("item1-name");
const item1Price = document.getElementById("item1-price");
const item1Img = document.getElementById("item1-img");
const item2Name = document.getElementById("item2-name");
const item2Price = document.getElementById("item2-price");
const item2Img = document.getElementById("item2-img");
const resultText = document.getElementById("result");
const scoreDisplay = document.getElementById("score");
const resetButton = document.getElementById("reset-btn");

// State
let itemMappings = []; // Stores the two items for comparison
let currentItems = []; // Stores the two items for comparison
let score = 0; // tracks players score starting on 0

// Fetch Item Mappings
async function fetchItemMappings() {
    try {
        const response = await fetch(API_URL_MAPPING);
        if (!response.ok) throw new Error(`Error fetching mappings: ${response.status}`);
        const data = await response.json();
        return data.reduce((map, item) => {
            map[item.id] = {
                name: item.name,
                wiki_url: item.url,
                icon: `https://oldschool.runescape.wiki/images/${item.name.replace(/ /g, '_')}_detail.png`,
            };
            return map;
        }, {});
    } catch (error) {
        console.error("Failed to fetch item mappings:", error);
        return {};
    }
}

// Fetch Item Prices
async function fetchItemPrices() {
    try {
        const response = await fetch(API_URL_PRICES);
        if (!response.ok) throw new Error(`Error fetching prices: ${response.status}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Failed to fetch item prices:", error);
        return {};
    }
}

// Display Items
function displayItems(items) {
    const [item1, item2] = items;

    item1Name.textContent = itemMappings[item1.id]?.name || "Unknown Item";
    item1Img.src = itemMappings[item1.id]?.icon || "default-image.png";
    item1Price.textContent = "???";

    item2Name.textContent = itemMappings[item2.id]?.name || "Unknown Item";
    item2Img.src = itemMappings[item2.id]?.icon || "default-image.png";
    item2Price.textContent = "???";
}

// Handle Guess
let isGameLocked = false; // Prevents multiple clicks per round

function handleGuess(choice) {
    if (isGameLocked) return;
    isGameLocked = true; // Locks the game after the first click
    // logic to check if the guess is correct.
    const item1 = currentItems[0];
    const item2 = currentItems[1];
    const isCorrect = (choice === "left" && item1.high > item2.high) || (choice === "right" && item2.high > item1.high);

    // Reveal both prices
    item1Price.textContent = (item1.high || 0).toLocaleString('fr-FR');
    item2Price.textContent = (item2.high || 0).toLocaleString('fr-FR');

    // Add feedback animations
    if (choice === "left") {
        document.getElementById("item1").classList.add(isCorrect ? "correct" : "incorrect");
    } else {
        document.getElementById("item2").classList.add(isCorrect ? "correct" : "incorrect");
    }

    if (isCorrect) {
        score++;
         // Proceed to the next round after a delay.
        resultText.textContent = "Correct!";
        resultText.style.color = "green";
        resultText.style.opacity = "1";

        scoreDisplay.textContent = score;

        setTimeout(() => {
            isGameLocked = false;
            document.getElementById("item1").classList.remove("correct", "incorrect");
            document.getElementById("item2").classList.remove("correct", "incorrect");
            startGame();
        }, 3000);

    } else {  // End the game and show the reset button.
        resultText.textContent = `Wrong! Final Score: ${score}`;
        resultText.style.color = "red";
        resultText.style.opacity = "1";

        // Keep images and prices visible, but fade out the container visually
        document.querySelector(".game-container").classList.add("fade-out");

        // Show reset button after a delay
        setTimeout(() => {
            resetButton.style.display = "block";
        }, 500);
    }
}

// Resets the score and restarts the game.
function resetGame() { 
    score = 0;
    scoreDisplay.textContent = score;
    resultText.textContent = "";
    resultText.style.opacity = "0";

    resetButton.style.display = "none";

    // Remove fade-out effect and reset feedback classes
    document.querySelector(".game-container").classList.remove("fade-out");
    document.getElementById("item1").classList.remove("correct", "incorrect");
    document.getElementById("item2").classList.remove("correct", "incorrect");

    isGameLocked = false;

    startGame();
}

// Start Game
async function startGame() {
    const prices = await fetchItemPrices();
    if (!prices || Object.keys(prices).length < 2) return;

    const priceEntries = Object.entries(prices).map(([id, data]) => ({
        id: parseInt(id),
        high: data.high,
        low: data.low,
    }));

    currentItems = [
        priceEntries[Math.floor(Math.random() * priceEntries.length)],
        priceEntries[Math.floor(Math.random() * priceEntries.length)],
    ];

    displayItems(currentItems);
}

// initialise the  game
async function init() {
    resetButton.style.display = "none"; // Hide the reset button initially
    itemMappings = await fetchItemMappings(); // fetches item data
    startGame(); //starts the game, duuh
}

// Start
init();
