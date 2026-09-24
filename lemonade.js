// Lemonade Stand Game
// Base: Jules's calendar + grandpa-forecast branch, finished by Sera.
// New: morning business decisions (cups + price), spoilage with Mom guilt,
// Grandpa's hidden tab (first 5 forecasts free, then $0.25 each, billed at
// season end), save/continue, high score.

/* --- Tuning --- */
const GRANDPA_FREE_ASKS = 5;
const GRANDPA_PRICE = 25;        // cents per forecast after the free ones
const GRANDPA_GRUMP_AT = 10;     // asks before Grandpa gets snippy
const CUP_COST = 25;             // cents of lemons/sugar per cup made
const MOM_SPOIL_THRESHOLD = 5;   // wasted cups that summon Mom
const MAX_CUPS = 200;
const START_MONEY = 500;         // $5.00

/* --- Global Game State --- */
const GameState = {
    company: "",
    date: null,
    money: 0,
    dailyProfit: 0,
    totalDaysOpen: 0,
    totalDaysSkipped: 0,
    consecutiveSkips: 0,
    grandpaAsks: 0,
    totalCupsSold: 0,
    totalCupsWasted: 0,
    momGuiltTrips: 0,
    bestDayProfit: 0,
    pricePerCup: 100,
    cupsToMake: 10,
    currentDayPotential: null,
    isGameOver: false
};

/* --- DOM Elements --- */
const UI = {
    setupArea: document.getElementById("setup-area"),
    dashboardContainer: document.getElementById("dashboard-container"),
    morningPanel: document.getElementById("morning-panel"),

    companyDisplay: document.getElementById("company-name-display"),
    dateDisplay: document.getElementById("date-display"),
    flavorText: document.getElementById("flavor-text"),

    weatherIcon: document.getElementById("weather-icon"),
    weatherDesc: document.getElementById("weather-desc"),
    customerCount: document.getElementById("customer-count"),
    customerVisuals: document.getElementById("customer-visuals"),
    moneyDisplay: document.getElementById("money-display"),
    dailyProfitDisplay: document.getElementById("daily-profit-display"),

    output: document.getElementById("output"),

    startButton: document.getElementById("startButton"),
    resumeButton: document.getElementById("resumeButton"),
    highScoreLine: document.getElementById("high-score"),
    openButton: document.getElementById("openButton"),
    skipButton: document.getElementById("skipButton"),
    grandpaButton: document.getElementById("grandpaButton"),
    nextDayButton: document.getElementById("nextDayButton"),
    cupsInput: document.getElementById("cups-input"),
    priceInput: document.getElementById("price-input"),
    priceDisplay: document.getElementById("price-display"),

    grandpaPopup: document.getElementById("grandpa-popup"),
    grandpaText: document.getElementById("grandpa-text"),
    momPopup: document.getElementById("mom-popup"),
    momText: document.getElementById("mom-text"),

    nameInput: document.getElementById("name")
};

/* --- Calendar System (from Jules) --- */
const Calendar = {
    startDate: new Date(2024, 4, 4),      // Sat May 4: weekends only (school!)
    dailyModeStart: new Date(2024, 5, 10),// Mon Jun 10: summer, every day
    endDate: new Date(2024, 7, 31),       // Aug 31: season over

    init: function() { return new Date(this.startDate); },

    formatDate: function(date) {
        return date.toLocaleDateString('en-US',
            { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },

    nextDay: function(currentDate) {
        const next = new Date(currentDate);
        if (currentDate >= this.dailyModeStart) {
            next.setDate(next.getDate() + 1);
        } else {
            const dow = currentDate.getDay(); // 0=Sun, 6=Sat
            if (dow === 6) next.setDate(next.getDate() + 1);      // Sat -> Sun
            else if (dow === 0) next.setDate(next.getDate() + 6); // Sun -> Sat
            else next.setDate(next.getDate() + 1);               // fallback
        }
        return next;
    },

    isGameOver: function(date) { return date > this.endDate; }
};

/* --- Weather & Simulation --- */
const Simulation = {
    // Pre-roll the day's weather + base demand (at $1.00/cup).
    generateDay: function(date) {
        const month = date.getMonth(); // 4=May, 5=Jun, 6=Jul, 7=Aug
        const day = date.getDate();

        let minTemp = 40, maxTemp = 80;
        if (month === 4)      { minTemp = 40; maxTemp = 65; }
        else if (month === 5) { minTemp = 60; maxTemp = 85; }
        else if (month === 6) { minTemp = 70; maxTemp = 98; }
        else if (month === 7) {
            if (day < 20) { minTemp = 70; maxTemp = 95; }
            else          { minTemp = 55; maxTemp = 80; }
        }

        let temp = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;
        if (month !== 4 && Math.random() < 0.1) temp += 10; // heatwave (not in May)
        if (Math.random() < 0.1) temp -= 10;                // cold snap

        // Base demand at $1.00/cup: (Temp-40)^1.5 / 6.5, +/-30% noise.
        // ~60F is roughly break-even territory.
        let baseDemand = 0;
        if (temp > 40) {
            baseDemand = Math.pow(temp - 40, 1.5) / 6.5;
            baseDemand *= (Math.random() * 0.6) + 0.7;
        }

        let flavor = "", weatherType = "";
        if (temp > 90)         { weatherType = "scorcher"; flavor = "It's a scorcher out there!"; }
        else if (temp < 55)    { weatherType = "cold";     flavor = "Brrr! Put on a jacket."; }
        else if (baseDemand > 40) { weatherType = "perfect"; flavor = "Business is booming!"; }
        else if (baseDemand < 5)  { weatherType = "bad";     flavor = "Not many people out today."; }
        else                   { weatherType = "normal";   flavor = "A nice day for lemonade."; }

        return { temp, baseDemand, flavor, weatherType };
    },

    // Resolve the business day given the player's morning choices.
    resolveDay: function(potential, cupsMade, priceCents) {
        // Price elasticity: $1.00 -> 1.0x demand, $0.50 -> 1.3x, $2.00 -> 0.4x
        const priceMult = Math.max(0, 1.6 - 0.6 * (priceCents / 100));
        const demand = Math.max(0, Math.round(potential.baseDemand * priceMult));

        const sold = Math.min(cupsMade, demand);
        const spoiled = cupsMade - sold;
        const revenue = sold * priceCents;
        const cost = cupsMade * CUP_COST;
        return { demand, sold, spoiled, revenue, cost, profit: revenue - cost };
    },

    // Grandpa's forecast: vague, folksy, and free* (*terms apply).
    getForecast: function(potential, askCount) {
        const folksy = {
            "scorcher": ["My knees are achin', gonna be a hot one!",
                         "Sun's angry tomorrow, best serve it ice cold!",
                         "Tomorrow will be a scorcher!"],
            "cold":     ["Put on your woolies, it's gonna be nippy.",
                         "Tomorrow it will be cold again.",
                         "Might snow... well, maybe not snow, but cold!"],
            "perfect":  ["I smell money in the air!",
                         "Perfect day for a stroll, I reckon.",
                         "Gonna be a busy one, kiddo."],
            "bad":      ["Quiet day ahead, I suspect.",
                         "Clouds are gathering...",
                         "Might be a good day for fishing instead."],
            "normal":   ["Just a regular ol' day.",
                         "Not too hot, not too cold.",
                         "Sun should peek out a bit."]
        };
        const grumpy = [
            "You asked me yesterday too... hot one. Happy?",
            "My knees, my back... it'll be warm. Now let an old man nap.",
            "Fine, FINE. Busy day. Are we done here?",
            "Back in my day we just looked at the sky. It'll be fine."
        ];
        if (askCount >= GRANDPA_GRUMP_AT) {
            return grumpy[Math.floor(Math.random() * grumpy.length)];
        }
        const options = folksy[potential.weatherType] || folksy["normal"];
        return options[Math.floor(Math.random() * options.length)];
    }
};

const MOM_LINES = [
    "There are starving kids in Africa who would have LOVED that lemonade!",
    "You threw away HOW many cups?! Do you know what sugar costs?",
    "Waste not, want not! Your grandmother is shaking her head right now.",
    "All that lemonade, straight down the drain. Unbelievable.",
    "I did NOT raise you to pour perfectly good lemonade into the gutter!"
];

/* --- Helpers --- */
function fmt(cents) { return `$${(cents / 100).toFixed(2)}`; }

function log(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    UI.output.appendChild(p);
    UI.output.scrollTop = UI.output.scrollHeight;
}

function clearLog() { UI.output.innerHTML = ""; }

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const REVEAL_DELAY_MS = 1000; // suspense pacing between day-result lines
let skipReveal = false;

// Reveal the day's results one line at a time, old-school suspense.
// Clicking the log at any point dumps the rest instantly.
async function revealLines(lines) {
    skipReveal = false;
    const skip = () => { skipReveal = true; };
    UI.output.addEventListener("click", skip);
    UI.output.style.cursor = "pointer";
    UI.output.title = "Click to reveal the rest of the day";
    try {
        for (let i = 0; i < lines.length; i++) {
            log(lines[i]);
            if (!skipReveal && i < lines.length - 1) await sleep(REVEAL_DELAY_MS);
        }
    } finally {
        UI.output.removeEventListener("click", skip);
        UI.output.style.cursor = "";
        UI.output.title = "";
    }
}

/* --- Save / Continue --- */
const SAVE_KEY = "lemonadeSaveV1";
const HIGHSCORE_KEY = "lemonadeHighScore";

function saveGame() {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            company: GameState.company,
            dateISO: GameState.date.toISOString(),
            money: GameState.money,
            totalDaysOpen: GameState.totalDaysOpen,
            totalDaysSkipped: GameState.totalDaysSkipped,
            consecutiveSkips: GameState.consecutiveSkips,
            grandpaAsks: GameState.grandpaAsks,
            totalCupsSold: GameState.totalCupsSold,
            totalCupsWasted: GameState.totalCupsWasted,
            momGuiltTrips: GameState.momGuiltTrips,
            bestDayProfit: GameState.bestDayProfit,
            pricePerCup: GameState.pricePerCup,
            cupsToMake: GameState.cupsToMake,
            currentDayPotential: GameState.currentDayPotential
        }));
    } catch (e) { /* private mode etc.: play on without saving */ }
}

function loadSave() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function clearSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

function getHighScore() {
    try { return parseInt(localStorage.getItem(HIGHSCORE_KEY) || "0", 10) || 0; }
    catch (e) { return 0; }
}

/* --- Dashboard --- */
function updateDashboardUI(isOpen) {
    UI.companyDisplay.textContent = GameState.company;
    UI.dateDisplay.textContent = Calendar.formatDate(GameState.date);
    UI.moneyDisplay.textContent = fmt(GameState.money);

    if (isOpen) {
        const res = GameState.lastResult;
        const pot = GameState.currentDayPotential;
        UI.flavorText.textContent = pot.flavor;
        UI.dailyProfitDisplay.textContent = fmt(GameState.dailyProfit);
        UI.dailyProfitDisplay.style.color = GameState.dailyProfit >= 0 ? "#2e7d32" : "#c62828";
        UI.customerCount.textContent = res.sold;

        UI.weatherIcon.innerHTML = '';
        const icon = document.createElement('i');
        icon.className = 'fa-solid';
        if (pot.temp > 90) icon.classList.add('fa-sun');
        else if (pot.temp > 70) icon.classList.add('fa-sun');
        else if (pot.temp > 50) icon.classList.add('fa-cloud-sun');
        else icon.classList.add('fa-snowflake');
        if (pot.temp > 90) icon.style.color = "#ff4500";
        UI.weatherIcon.appendChild(icon);
        UI.weatherDesc.textContent = `${pot.temp}°F`;

        UI.customerVisuals.innerHTML = '';
        let scale = 1;
        if (res.sold > 50) scale = Math.ceil(res.sold / 20);
        const countToDraw = Math.ceil(res.sold / scale);
        for (let i = 0; i < countToDraw; i++) {
            const userIcon = document.createElement('i');
            userIcon.className = 'fa-solid fa-user';
            userIcon.style.marginRight = '2px';
            UI.customerVisuals.appendChild(userIcon);
        }
        if (scale > 1) {
            const info = document.createElement('div');
            info.textContent = `(1 icon = ${scale} ppl)`;
            info.style.fontSize = "0.5em";
            UI.customerVisuals.appendChild(info);
        }
    } else {
        UI.flavorText.textContent = "What will you do today?";
        UI.dailyProfitDisplay.textContent = "--";
        UI.dailyProfitDisplay.style.color = "";
        UI.customerCount.textContent = "?";
        UI.customerVisuals.innerHTML = "";
        UI.weatherDesc.textContent = "??°F";
        UI.weatherIcon.innerHTML = '<i class="fa-solid fa-question"></i>';
    }
}

/* --- Game Flow --- */
function startGame() {
    const name = UI.nameInput.value.trim() || "Lemonade Stand";
    Object.assign(GameState, {
        company: name, money: START_MONEY, date: Calendar.init(),
        dailyProfit: 0, totalDaysOpen: 0, totalDaysSkipped: 0,
        consecutiveSkips: 0, grandpaAsks: 0, totalCupsSold: 0,
        totalCupsWasted: 0, momGuiltTrips: 0, bestDayProfit: 0,
        pricePerCup: 100, cupsToMake: 10,
        currentDayPotential: null, isGameOver: false, lastResult: null
    });
    UI.setupArea.style.display = "none";
    UI.dashboardContainer.style.display = "flex";
    startMorning();
}

function resumeGame(saved) {
    Object.assign(GameState, {
        company: saved.company, money: saved.money,
        date: new Date(saved.dateISO), dailyProfit: 0,
        totalDaysOpen: saved.totalDaysOpen, totalDaysSkipped: saved.totalDaysSkipped,
        consecutiveSkips: saved.consecutiveSkips, grandpaAsks: saved.grandpaAsks,
        totalCupsSold: saved.totalCupsSold, totalCupsWasted: saved.totalCupsWasted,
        momGuiltTrips: saved.momGuiltTrips, bestDayProfit: saved.bestDayProfit,
        pricePerCup: saved.pricePerCup, cupsToMake: saved.cupsToMake,
        currentDayPotential: saved.currentDayPotential,
        isGameOver: false, lastResult: null
    });
    UI.setupArea.style.display = "none";
    UI.dashboardContainer.style.display = "flex";
    // Re-render the saved morning (fresh forecast available).
    renderMorning();
}

function renderMorning() {
    clearLog();
    log(`-- Morning of ${Calendar.formatDate(GameState.date)} --`);
    log(`You have ${fmt(GameState.money)}. Cups cost ${fmt(CUP_COST)} each to make.`);

    UI.cupsInput.value = GameState.cupsToMake;
    UI.priceInput.value = GameState.pricePerCup;
    UI.priceDisplay.textContent = fmt(GameState.pricePerCup);

    updateDashboardUI(false);
    UI.morningPanel.style.display = "block";
    UI.nextDayButton.style.display = "none";
    UI.grandpaButton.disabled = false;
    saveGame();
}

function startMorning() {
    GameState.currentDayPotential = Simulation.generateDay(GameState.date);
    renderMorning();
}

function askGrandpa() {
    GameState.grandpaAsks++;
    const hint = Simulation.getForecast(GameState.currentDayPotential, GameState.grandpaAsks);
    UI.grandpaText.textContent = `"${hint}"`;
    UI.grandpaPopup.style.display = "block";
    UI.grandpaButton.disabled = true; // once per day
    // NOTE: the tab is settled at season end. Shhh.
}

function closeGrandpa() { UI.grandpaPopup.style.display = "none"; }
function closeMom() { UI.momPopup.style.display = "none"; }

function readMorningChoices() {
    let cups = Math.max(0, Math.min(MAX_CUPS,
        parseInt(UI.cupsInput.value, 10) || 0));
    let price = Math.max(25, Math.min(200,
        parseInt(UI.priceInput.value, 10) || 100));
    // Snap price to quarters for tidy math.
    price = Math.round(price / 25) * 25;

    const affordable = Math.floor(GameState.money / CUP_COST);
    if (cups > affordable) {
        log(`You could only afford ${affordable} cups!`);
        cups = affordable;
    }
    GameState.cupsToMake = cups;
    GameState.pricePerCup = price;
    return { cups, price };
}

async function openStand() {
    const { cups, price } = readMorningChoices();
    const pot = GameState.currentDayPotential;
    const res = Simulation.resolveDay(pot, cups, price);
    GameState.lastResult = res;

    GameState.money += res.profit;
    GameState.dailyProfit = res.profit;
    GameState.totalDaysOpen++;
    GameState.consecutiveSkips = 0;
    GameState.totalCupsSold += res.sold;
    GameState.totalCupsWasted += res.spoiled;
    if (res.profit > GameState.bestDayProfit) GameState.bestDayProfit = res.profit;

    // Day is underway: tuck the morning panel away so it can't be re-run mid-reveal.
    UI.morningPanel.style.display = "none";

    const lines = [
        `Opened for business!`,
        `Temperature: ${pot.temp}°F — ${pot.flavor}`,
        `You made ${cups} cups at ${fmt(price)} each.`,
        `Customers wanted ${res.demand} cups; you sold ${res.sold}.`,
    ];
    if (res.spoiled > 0) lines.push(`${res.spoiled} cups went unsold...`);
    lines.push(`Expenses: ${fmt(res.cost)}   Revenue: ${fmt(res.revenue)}`);
    lines.push(`Profit: ${fmt(res.profit)}`);

    await revealLines(lines);

    // Dashboard updates land with the punchline, not before — no spoilers.
    updateDashboardUI(true);

    if (res.spoiled >= MOM_SPOIL_THRESHOLD) {
        GameState.momGuiltTrips++;
        const line = MOM_LINES[Math.floor(Math.random() * MOM_LINES.length)];
        UI.momText.innerHTML = `"${line}"<br><small>(${res.spoiled} cups down the drain!)</small>`;
        UI.momPopup.style.display = "block";
    }

    endDayInteraction();
}

function skipDay() {
    GameState.totalDaysSkipped++;
    GameState.consecutiveSkips++;

    if (GameState.consecutiveSkips > 3) {
        const penalty = 200; // $2.00: lemons don't buy themselves
        GameState.money -= penalty;
        log(`Skipped ${GameState.consecutiveSkips} days in a row — fixed costs: ${fmt(penalty)}.`);
    }

    const pot = GameState.currentDayPotential;
    log(`You skipped today. (Missed: ${pot.temp}°F, ~${Math.round(pot.baseDemand)} thirsty people)`);
    updateDashboardUI(false);
    UI.flavorText.textContent = "Stand closed today.";
    UI.moneyDisplay.textContent = fmt(GameState.money);

    endDayInteraction();
}

function endDayInteraction() {
    UI.morningPanel.style.display = "none";

    if (GameState.money <= 0) {
        log("BANKRUPT! You ran out of money.");
        triggerGameOver("Bankrupt");
        return;
    }
    UI.nextDayButton.style.display = "inline-block";
}

function nextDay() {
    const prevDate = new Date(GameState.date);
    GameState.date = Calendar.nextDay(GameState.date);

    const diffDays = Math.ceil(Math.abs(GameState.date - prevDate) / 86400000);
    if (diffDays > 1) log(`...skipping ${diffDays - 1} weekdays (school is in session)...`);

    if (Calendar.isGameOver(GameState.date)) triggerGameOver("Season End");
    else startMorning();
}

function triggerGameOver(reason) {
    clearSave();
    GameState.isGameOver = true;
    clearLog();
    UI.dashboardContainer.style.display = "none";
    UI.morningPanel.style.display = "none";
    UI.nextDayButton.style.display = "none";

    // --- Grandpa settles his tab. He was keeping count the whole time. ---
    const asks = GameState.grandpaAsks;
    const free = Math.min(asks, GRANDPA_FREE_ASKS);
    const billed = Math.max(0, asks - GRANDPA_FREE_ASKS);
    const tab = billed * GRANDPA_PRICE;
    GameState.money -= tab;

    let grandpaLine;
    if (asks === 0) {
        grandpaLine = `Grandpa is a little hurt you never asked him for the forecast.`;
    } else if (billed === 0) {
        grandpaLine = `Grandpa's tab: ${asks} forecasts, all free. What a guy.`;
    } else {
        grandpaLine = `Grandpa's tab: ${asks} forecasts (${free} free) — ${fmt(tab)}. He says you're welcome.`;
    }

    const high = getHighScore();
    const isRecord = GameState.money > high;
    if (isRecord) {
        try { localStorage.setItem(HIGHSCORE_KEY, String(GameState.money)); } catch (e) {}
    }

    const summaryDiv = document.createElement("div");
    summaryDiv.innerHTML = `
        <h2>Game Over: ${reason}</h2>
        <p><strong>Final money: ${fmt(GameState.money)}</strong>${isRecord ? " 🏆 New high score!" : ""}</p>
        <p><em>${grandpaLine}</em></p>
        <hr>
        <p>Days open: ${GameState.totalDaysOpen} &nbsp;•&nbsp; Days skipped: ${GameState.totalDaysSkipped}</p>
        <p>Cups sold: ${GameState.totalCupsSold} &nbsp;•&nbsp; Cups wasted: ${GameState.totalCupsWasted}</p>
        <p>Mom guilt trips: ${GameState.momGuiltTrips} &nbsp;•&nbsp; Best day: ${fmt(GameState.bestDayProfit)}</p>
        <button onclick="location.reload()">Play Again</button>
    `;
    UI.setupArea.innerHTML = "";
    UI.setupArea.appendChild(summaryDiv);
    UI.setupArea.style.display = "block";
}

/* --- Boot --- */
(function init() {
    UI.priceInput.addEventListener("input", () => {
        const v = Math.round((parseInt(UI.priceInput.value, 10) || 100) / 25) * 25;
        UI.priceDisplay.textContent = fmt(v);
    });

    const saved = loadSave();
    const high = getHighScore();
    if (high > 0) {
        UI.highScoreLine.textContent = `🏆 High score: ${fmt(high)}`;
        UI.highScoreLine.style.display = "block";
    }
    if (saved && saved.dateISO) {
        UI.resumeButton.style.display = "inline-block";
        const d = new Date(saved.dateISO);
        UI.resumeButton.textContent = `Continue — ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${fmt(saved.money)})`;
        UI.resumeButton.onclick = () => resumeGame(saved);
    }
})();
