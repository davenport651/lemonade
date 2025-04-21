// Lemonade Stand Game in JavaScript

let supplies = 0;
let money = 0;
let customers = 0;
let temp = 0;
let day = 0;

function startGame() {
    supplies = 0;
    money = 500;
    customers = 0;
    day = 0;
    console.log("Welcome to your Lemonade Stand!");
    let company = prompt("What would you like your Lemonade Stand to be called?");
    //console.clear();
    playDay(company);
}

function playDay(company) {
    day++;
    console.log(`${company} -- DAY ${day} --`);
    if (day === 1) {
        console.log(`You're starting with $${money / 100} dollars.`);
    }
    console.log(`You have $${money / 100} dollars.`);

    // Determine temperature
    temp = Math.floor(Math.random() * 100);
    while (temp < 25) {
        temp = Math.floor(Math.random() * 100);
    }
    if (temp > 90) {
        console.log("It's a scorcher!");
    } else if (temp < 45) {
        console.log("Put on your jacket!");
    }
    console.log(`${temp} degrees.`);

    // Determine customers
    if (temp < 50) {
        customers = Math.floor(Math.random() * 1);
    } else if (temp >= 50 && temp < 80) {
        customers = Math.floor(Math.random() * 11);
    } else if (temp >= 80) {
        customers = Math.floor(Math.random() * 25);
    }
    if (customers < 8) {
        console.log("Not much business.");
    } else if (customers > 20) {
        console.log("Good business!");
    } else if (customers === 25) {
        console.log("JACKPOT!");
    }
    console.log(`${customers} customers.`);

    // Determine supplies cost
    supplies = Math.floor(Math.random() * 100) * Math.floor(Math.random() * 10);
    console.log(`$${supplies / 100} supply cost.`);

    // Calculate money
    money = customers * 50 + money;
    money = money - supplies;

    // End of the day
    console.log(`Result: $${money / 100} dollars.`);
    if (money > 0 && day < 84) {
        //let next = prompt("Press ENTER to continue...");
        //console.clear();
        playDay(company);
    } else {
        endGame();
    }
}

function endGame() {
    if (money > 0) {
	    console.log(`Summer's over! You earned $${money / 100} dollars.`);
    } else {
	    console.log(`You are bankrupt with $${money / 100} dollars.`);
    }
    let playAgain = prompt("Play again? (y | n)");
    if (playAgain.toLowerCase() === "y") {
        console.clear()
	startGame();
    } else {
        console.log("Thanks for playing!");
    }
}

// Start the game
//startGame();
