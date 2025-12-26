// Lemonade Stand Game in JavaScript
// Code from lemonade.js adapted for DOM display
let supplies = 0;
let money = 0;
let customers = 0;
let temp = 0;
let day = 0;
let company = "";

const output = document.getElementById("output");
const startButton = document.getElementById("startButton");
const nextDayButton = document.getElementById("nextDayButton");
const dashboard = document.getElementById("dashboard");
const setupArea = document.getElementById("setup-area");

function logMessage(message) {
    const p = document.createElement("p");
    p.textContent = message;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
}

function clearLog() {
    output.innerHTML = "";
}

function updateGraphics() {
    // Show dashboard
    dashboard.style.display = "flex";

    // Update Weather
    const weatherIcon = document.getElementById("weather-icon");
    const weatherDesc = document.getElementById("weather-desc");

    // Clear previous icon
    weatherIcon.innerHTML = '';
    const icon = document.createElement('i');
    icon.className = 'fa-solid';

    if (temp > 90) {
        icon.classList.add('fa-sun');
        weatherDesc.textContent = "Scorcher!";
    } else if (temp > 70) {
        icon.classList.add('fa-sun'); // Or cloud-sun if you want variety for sunny but not hot
        weatherDesc.textContent = "Sunny";
    } else if (temp > 50) {
        icon.classList.add('fa-cloud-sun');
        weatherDesc.textContent = "Cloudy";
    } else {
        icon.classList.add('fa-snowflake');
        weatherDesc.textContent = "Cold";
    }
    weatherIcon.appendChild(icon);

    weatherDesc.textContent += ` (${temp}°F)`;

    // Update Customers
    const customerCount = document.getElementById("customer-count");
    const customerVisuals = document.getElementById("customer-visuals");
    customerCount.textContent = customers;

    // Create visual representation of customers
    customerVisuals.innerHTML = ''; // Clear previous

    let scale = 1;
    if (customers > 50) {
        scale = Math.ceil(customers / 20); // Each icon represents 'scale' customers
    }

    const countToDraw = Math.ceil(customers / scale);
    for (let i = 0; i < countToDraw; i++) {
        const userIcon = document.createElement('i');
        userIcon.className = 'fa-solid fa-user';
        userIcon.style.marginRight = '2px';
        customerVisuals.appendChild(userIcon);
    }

    if (scale > 1) {
        const info = document.createElement('div');
        info.textContent = `(1 icon = ${scale} ppl)`;
        info.style.fontSize = "0.5em";
        customerVisuals.appendChild(info);
    }

    // Update Finances
    const moneyDisplay = document.getElementById("money-display");
    moneyDisplay.textContent = `$${(money / 100).toFixed(2)}`;
}

function startGame() {
    startButton.style.display = "none";
    setupArea.style.display = "none";

    supplies = 0;
    money = 500;
    customers = 0;
    day = 0;

    if (company == "") { company = document.getElementById("name").value || "Lemonade Stand"; }

    clearLog();
    playDay();
}

function generateTemperature(days) {
    if (days <= 20) {
        return Math.floor(Math.random() * 50); // Range: 0 - 50
    } else if (days > 20 && days <= 60) {
        return Math.floor(50 + Math.random() * 50); // Range: 50 - 100
    } else {
        return Math.floor(Math.random() * 100); // Range: 0 - 100
    }
}

function playDay() {
    nextDayButton.style.display = "none"; // Hide button while processing
    day++;
    clearLog();
    logMessage(`${company} -- DAY ${day} --`);

    // Determine temperature
    temp = generateTemperature(day);
    while (temp < 35) {
        temp = generateTemperature(day);
    }
    if (temp > 90) {
        logMessage("It's a scorcher! " + `${temp} degrees.`);
    } else if (temp < 45) {
        logMessage("Put on your jacket!");
    }
    logMessage(`${temp} degrees.`);

    // Determine customers
    if (temp < 50) {
        customers = Math.floor(Math.random() * 5);
    } else if (temp >= 50 && temp < 70) {
        customers = Math.floor(Math.random() * 11);
    } else if (temp >= 70) {
        customers = Math.floor(Math.random() * 40);
    }

    if (customers < 4) {
        logMessage("Not much business.");
    } else if (customers > 9) {
        logMessage("Good business!");
    } else if (customers > 20) {
        logMessage("JACKPOT!");
    }
    logMessage(`${customers} customers.`);

    // Calculate supply cost
    const baseSupplyCost = 200; // A reasonable base cost (e.g., $2.00)
    const costPerCustomer = 25; // Cost per customer (e.g., $0.25)
    const randomness = Math.floor((100 - temp) * 0.2); // Higher cost when temp is lower

    supplies = baseSupplyCost + (costPerCustomer * customers) + randomness;
    logMessage(`$${(supplies / 100).toFixed(2)} supply cost.`);

    // Calculate money
    money = customers * 100 + money;
    money = money - supplies;

    logMessage(`Result: $${(money / 100).toFixed(2)} dollars.`);

    // Update visuals
    updateGraphics();

    // Check game over or continue
    if (money > 0 && day < 84) {
        nextDayButton.style.display = "inline-block"; // Show button for user to proceed
    } else {
        endGame();
    }
}

function endGame() {
    nextDayButton.style.display = "none";
    if (money > 0) {
        logMessage(`Summer's over! You earned $${(money / 100).toFixed(2)} dollars.`);
    } else {
        logMessage(`You are bankrupt with $${(money / 100).toFixed(2)} dollars.`);
    }
    startButton.textContent = "Restart Game";
    startButton.style.display = "inline-block";
    startButton.removeAttribute("disabled");
}
