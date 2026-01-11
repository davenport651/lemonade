// Lemonade Stand Game in JavaScript
// Completely refactored for new features

/* --- Global Game State --- */
const GameState = {
    company: "",
    date: null,
    money: 0.0,
    dailyProfit: 0.0,
    totalDaysOpen: 0,
    totalDaysSkipped: 0,
    consecutiveSkips: 0,
    grandpaAsks: 0,

    // The "potential" results for the current day (pre-rolled)
    currentDayPotential: null,

    // Flags
    isGameOver: false,
    dailyMode: false // false = May weekends, true = Summer daily
};

/* --- DOM Elements --- */
const UI = {
    setupArea: document.getElementById("setup-area"),
    dashboardContainer: document.getElementById("dashboard-container"),

    // Header
    companyDisplay: document.getElementById("company-name-display"),
    dateDisplay: document.getElementById("date-display"),
    flavorText: document.getElementById("flavor-text"),

    // Stats
    weatherIcon: document.getElementById("weather-icon"),
    weatherDesc: document.getElementById("weather-desc"),
    customerCount: document.getElementById("customer-count"),
    customerVisuals: document.getElementById("customer-visuals"),
    moneyDisplay: document.getElementById("money-display"),
    dailyProfitDisplay: document.getElementById("daily-profit-display"),

    // Log
    output: document.getElementById("output"),

    // Controls
    startButton: document.getElementById("startButton"),
    openButton: document.getElementById("openButton"),
    skipButton: document.getElementById("skipButton"),
    grandpaButton: document.getElementById("grandpaButton"),
    continueButton: document.getElementById("continueButton"),

    // Grandpa Popup
    grandpaPopup: document.getElementById("grandpa-popup"),
    grandpaText: document.getElementById("grandpa-text"),

    // Input
    nameInput: document.getElementById("name")
};

/* --- Calendar System --- */
const Calendar = {
    // Start Date: Saturday, May 4th, 2024
    startDate: new Date(2024, 4, 4),

    // Daily Mode starts Monday, June 10th
    dailyModeStart: new Date(2024, 5, 10),

    // End Date: August 31st
    endDate: new Date(2024, 7, 31),

    init: function() {
        return new Date(this.startDate);
    },

    formatDate: function(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    },

    nextDay: function(currentDate) {
        const next = new Date(currentDate);

        // Check if we are in Daily Mode (Summer)
        const isDaily = currentDate >= this.dailyModeStart;

        if (isDaily) {
            next.setDate(next.getDate() + 1);
        } else {
            // Weekend Mode (May)
            // If Saturday -> Sunday (+1)
            // If Sunday -> Saturday (+6)
            const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
            if (dayOfWeek === 6) {
                next.setDate(next.getDate() + 1); // Sat -> Sun
            } else if (dayOfWeek === 0) {
                next.setDate(next.getDate() + 6); // Sun -> Sat
            } else {
                // Fallback (shouldn't happen if logic is tight)
                next.setDate(next.getDate() + 1);
            }
        }
        return next;
    },

    isGameOver: function(date) {
        return date > this.endDate;
    },

    getMonthName: function(date) {
        return date.toLocaleString('default', { month: 'long' });
    }
};

/* --- Weather & Simulation System --- */
const Simulation = {
    generateDay: function(date) {
        const month = date.getMonth(); // 4=May, 5=June, 6=July, 7=Aug
        const day = date.getDate();

        // Temperature Logic
        let minTemp = 40;
        let maxTemp = 80;

        if (month === 4) { // May: Cooler
            minTemp = 40;
            maxTemp = 65;
        } else if (month === 5) { // June: Warming up
            minTemp = 60;
            maxTemp = 85;
        } else if (month === 6) { // July: Hot
            minTemp = 70;
            maxTemp = 98;
        } else if (month === 7) { // August
            if (day < 20) { // Early Aug: Hot
                minTemp = 70;
                maxTemp = 95;
            } else { // Late Aug: Cooling
                minTemp = 55;
                maxTemp = 80;
            }
        }

        // Generate Temp
        let temp = Math.floor(Math.random() * (maxTemp - minTemp + 1)) + minTemp;

        // Occasional extremes
        // Heatwaves are less likely in May
        if (month !== 4 && Math.random() < 0.1) temp += 10; // Heatwave (Not in May)
        if (Math.random() < 0.1) temp -= 10; // Cold snap

        // Customer Logic based on Temp
        // Mathematical formula: (Temp - 40)^1.5 / 6.5
        // Designed so 60F is roughly break-even.
        let customers = 0;
        if (temp > 40) {
            customers = Math.pow((temp - 40), 1.5) / 6.5;
        } else {
            customers = 0;
        }

        // Add randomness (+/- 30%)
        const variance = (Math.random() * 0.6) + 0.7; // 0.7 to 1.3
        customers = Math.floor(customers * variance);

        // NOTE: A season penalty (e.g., May dates * 0.7) could be added here if needed.

        // Financials
        const pricePerCup = 100; // 1.00 dollar (in cents)
        const baseCost = 200; // $2.00 fixed
        const variableCost = 25; // $0.25 per cup

        // Random cost fluctuation
        const randomness = Math.floor(Math.random() * 50);
        const cost = baseCost + (customers * variableCost) + randomness;
        const revenue = customers * pricePerCup;
        const profit = revenue - cost;

        // Flavor Text Generation
        let flavor = "";
        let weatherType = "";

        if (temp > 90) {
            weatherType = "scorcher";
            flavor = "It's a scorcher out there!";
        } else if (temp < 55) {
            weatherType = "cold";
            flavor = "Brrr! Put on a jacket.";
        } else if (customers > 40) {
            weatherType = "perfect";
            flavor = "Business is booming!";
        } else if (customers < 5) {
            weatherType = "bad";
            flavor = "Not many people out today.";
        } else {
            weatherType = "normal";
            flavor = "A nice day for lemonade.";
        }

        return {
            temp: temp,
            customers: customers,
            cost: cost,
            revenue: revenue,
            profit: profit,
            flavor: flavor,
            weatherType: weatherType
        };
    },

    getForecast: function(potential) {
        // Grandpa is vague
        const type = potential.weatherType;
        const t = potential.temp;

        const forecasts = {
            "scorcher": ["My knees are achin', gonna be a hot one!", "Sun's angry tomorrow, best serve it ice cold!", "Tomorrow will be a scorcher!"],
            "cold": ["Put on your woolies, it's gonna be nippy.", "Tomorrow it will be cold again.", "Might snow... well, maybe not snow, but cold!"],
            "perfect": ["I smell money in the air!", "Perfect day for a stroll, I reckon.", "Gonna be a busy one, kiddo."],
            "bad": ["Quiet day ahead, I suspect.", "Clouds are gathering...", "Might be a good day for fishing instead."],
            "normal": ["Just a regular ol' day.", "Not too hot, not too cold.", "Sun should peek out a bit."]
        };

        const options = forecasts[type] || forecasts["normal"];
        return options[Math.floor(Math.random() * options.length)];
    }
};

/* --- Helper Functions --- */
function log(msg) {
    const p = document.createElement("p");
    p.textContent = msg;
    UI.output.appendChild(p);
    UI.output.scrollTop = UI.output.scrollHeight;
}

function clearLog() {
    UI.output.innerHTML = "";
}

function updateDashboardUI(isOpen) {
    // Header
    UI.companyDisplay.textContent = GameState.company;
    UI.dateDisplay.textContent = Calendar.formatDate(GameState.date);

    // Stats
    UI.moneyDisplay.textContent = `$${(GameState.money / 100).toFixed(2)}`;

    if (isOpen) {
        // Show actual results
        const res = GameState.currentDayPotential;
        UI.flavorText.textContent = res.flavor;
        UI.dailyProfitDisplay.textContent = `$${(GameState.dailyProfit / 100).toFixed(2)}`;
        UI.customerCount.textContent = res.customers;

        // Weather Icon
        UI.weatherIcon.innerHTML = '';
        const icon = document.createElement('i');
        icon.className = 'fa-solid';
        if (res.temp > 90) icon.classList.add('fa-sun');
        else if (res.temp > 70) icon.classList.add('fa-sun'); // Sunny
        else if (res.temp > 50) icon.classList.add('fa-cloud-sun');
        else icon.classList.add('fa-snowflake');

        if (res.temp > 90) UI.weatherIcon.firstElementChild.style.color = "#ff4500"; // Red-orange

        UI.weatherIcon.appendChild(icon);
        UI.weatherDesc.textContent = `${res.temp}°F`;

        // Customer Visuals
        UI.customerVisuals.innerHTML = '';
        let scale = 1;
        if (res.customers > 50) scale = Math.ceil(res.customers / 20);
        const countToDraw = Math.ceil(res.customers / scale);

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
        // Morning/Planning State or Skip
        UI.flavorText.textContent = "What will you do today?";
        UI.dailyProfitDisplay.textContent = "--";
        UI.customerCount.textContent = "?";
        UI.customerVisuals.innerHTML = "";
        UI.weatherDesc.textContent = "??°F";
        UI.weatherIcon.innerHTML = '<i class="fa-solid fa-question"></i>';
    }
}

/* --- Game Control Functions --- */

function startGame() {
    const name = UI.nameInput.value.trim() || "Lemonade Stand";
    GameState.company = name;
    GameState.money = 500; // $5.00
    GameState.date = Calendar.init();
    GameState.totalDaysOpen = 0;
    GameState.totalDaysSkipped = 0;
    GameState.consecutiveSkips = 0;
    GameState.grandpaAsks = 0;
    GameState.isGameOver = false;

    UI.setupArea.style.display = "none";
    UI.dashboardContainer.style.display = "flex";

    startMorning();
}

function startMorning() {
    clearLog();
    log(`-- Morning of ${Calendar.formatDate(GameState.date)} --`);

    // Check for skipped days (Weekdays in May)
    // This logic is actually handled by the Calendar system transitions,
    // but we might want to log if we skipped a chunk.

    // Roll the potential day
    GameState.currentDayPotential = Simulation.generateDay(GameState.date);

    updateDashboardUI(false);

    // Show controls
    UI.openButton.style.display = "inline-block";
    UI.skipButton.style.display = "inline-block";
    UI.grandpaButton.style.display = "inline-block";
    UI.continueButton.style.display = "none";

    UI.openButton.disabled = false;
    UI.skipButton.disabled = false;
    UI.grandpaButton.disabled = false;
}

function askGrandpa() {
    GameState.grandpaAsks++;
    const hint = Simulation.getForecast(GameState.currentDayPotential);
    UI.grandpaText.textContent = `"${hint}"`;
    UI.grandpaPopup.style.display = "block";
    UI.grandpaButton.disabled = true; // Can only ask once per day
}

function closeGrandpa() {
    UI.grandpaPopup.style.display = "none";
}

function openStand() {
    const res = GameState.currentDayPotential;

    // Update State
    GameState.money += res.profit;
    GameState.dailyProfit = res.profit;
    GameState.totalDaysOpen++;
    GameState.consecutiveSkips = 0;

    // Logging
    log(`Opened for business!`);
    log(`Temperature: ${res.temp}°F`);
    log(`Customers: ${res.customers}`);
    log(`Expenses: $${(res.cost/100).toFixed(2)}`);
    log(`Revenue: $${(res.revenue/100).toFixed(2)}`);
    log(`Profit: $${(res.profit/100).toFixed(2)}`);

    updateDashboardUI(true);
    endDayInteraction();
}

function skipDay() {
    GameState.totalDaysSkipped++;
    GameState.consecutiveSkips++;

    const penaltyThreshold = 3;
    let penalty = 0;

    if (GameState.consecutiveSkips > penaltyThreshold) {
        penalty = 200; // $2.00 fixed cost for maintenance/spoilage
        GameState.money -= penalty;
        log(`Warning: Skipped more than 3 days in a row. Fixed costs incurred: $${(penalty/100).toFixed(2)}`);
    }

    // Report what they missed
    const res = GameState.currentDayPotential;
    log(`You skipped today.`);
    log(`(Missed Opportunity: Temp ${res.temp}°F, ${res.customers} customers, Potential Profit $${(res.profit/100).toFixed(2)})`);

    updateDashboardUI(false); // Keeps ? icons
    UI.flavorText.textContent = "Stand closed today.";
    UI.moneyDisplay.textContent = `$${(GameState.money / 100).toFixed(2)}`; // Update money in case of penalty

    endDayInteraction();
}

function endDayInteraction() {
    // Hide Choice Buttons
    UI.openButton.style.display = "none";
    UI.skipButton.style.display = "none";
    UI.grandpaButton.style.display = "none";

    // Check Game Over
    if (GameState.money <= 0) {
        log("BANKRUPT! You ran out of money.");
        triggerGameOver("Bankrupt");
        return;
    }

    // Check Date Limit
    if (Calendar.isGameOver(Calendar.nextDay(GameState.date))) {
        // Technically this checks if TOMORROW is out of bounds
        // If we want to play until Aug 31, we check after advancing.
        // Let's allow the user to click "Next Day" to see the Game Over screen.
    }

    UI.continueButton.style.display = "inline-block";
}

function nextDay() {
    const prevDate = new Date(GameState.date);
    GameState.date = Calendar.nextDay(GameState.date);

    // Check for skipped time (e.g. May weekdays)
    const diffTime = Math.abs(GameState.date - prevDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
        log(`...Skipping ${diffDays - 1} weekdays (School is in session)...`);
    }

    if (Calendar.isGameOver(GameState.date)) {
        triggerGameOver("Season End");
    } else {
        startMorning();
    }
}

function triggerGameOver(reason) {
    clearLog();
    UI.dashboardContainer.style.display = "none";
    UI.continueButton.style.display = "none";

    const summaryDiv = document.createElement("div");
    summaryDiv.innerHTML = `
        <h2>Game Over: ${reason}</h2>
        <p>Total Money: $${(GameState.money/100).toFixed(2)}</p>
        <p>Days Open: ${GameState.totalDaysOpen}</p>
        <p>Days Skipped: ${GameState.totalDaysSkipped}</p>
        <p>Grandpa Advice: ${GameState.grandpaAsks} times</p>
        <button onclick="location.reload()">Play Again</button>
    `;
    // Replace dashboard with summary
    UI.setupArea.innerHTML = "";
    UI.setupArea.appendChild(summaryDiv);
    UI.setupArea.style.display = "block";
}
