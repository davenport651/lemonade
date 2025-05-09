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

        function logMessage(message) {
            const p = document.createElement("p");
            p.textContent = message;
            output.appendChild(p);
            output.scrollTop = output.scrollHeight; // Auto-scroll to the bottom
        }

        function clearLog() {
            output.innerHTML = "";
        }

        function startGame() {
            document.getElementById("startButton").setAttribute("disabled", true);
            supplies = 0;
            money = 500;
            customers = 0;
            day = 0;
            //logMessage("Welcome to your Lemonade Stand!");
            company = document.getElementById("name").value;
            //company = prompt("What would you like your Lemonade Stand to be called?");
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
            day++;
            clearLog();
            logMessage(`${company} -- DAY ${day} --`);
            if (day === 1) {
                logMessage(`You're starting with $${(money / 100).toFixed(2)} dollars.`);
            } else {
                    logMessage(`You have $${(money / 100).toFixed(2)} dollars.`);
            }
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

            // OLD Determine supplies cost
            //supplies = Math.floor(Math.random() * 100) * Math.floor(Math.random() * 10);
            //logMessage(`$${(supplies / 100).toFixed(2)} supply cost.`);

            // Calculate supply cost
            const baseSupplyCost = 200; // A reasonable base cost (e.g., $2.00)
            const costPerCustomer = 25; // Cost per customer (e.g., $0.25)
            const randomness = Math.floor((100 - temp) * 0.2); // Higher cost when temp is lower
            //const randomness = Math.floor(Math.random() * 50); // old Random factor (e.g., $0.00 to $0.50)

            supplies = baseSupplyCost + (costPerCustomer * customers) + randomness;
            logMessage(`$${(supplies / 100).toFixed(2)} supply cost.`);

            // Calculate money
            money = customers * 100 + money;
            money = money - supplies;

            // End of the day
            if (money > 0 && day < 84) {
                logMessage(`Result: $${(money / 100).toFixed(2)} dollars.`);
                setTimeout(playDay, 8000); // Automatically play the next day after 8 second
            } else {
                endGame();
            }
        }

        function endGame() {
            if (money > 0) {
                logMessage(`Summer's over! You earned $${(money / 100).toFixed(2)} dollars.`);
            } else {
                logMessage(`You are bankrupt with $${(money / 100).toFixed(2)} dollars.`);
            }
            document.getElementById("startButton").removeAttribute("disabled");
            //const playAgain = confirm("Play again?");
            //if (playAgain) {
            //    startGame();
            //} else {
            //    logMessage("Thanks for playing!");
            //}
        }

        //startButton.addEventListener("click", startGame);
