
REM ********Lemonade Stand************
10 REM --CLEAR VARIABLES--
11 supplies = 0
12 MONEY = 0
13 customers = 0
14 temp = 0
15 DAY = 0

REM --INTRO--
50 PRINT "Welcome to your Lemonade Stand"
51 INPUT "What would you like your Lemonade Stand to be called?"; company$
52 CLS
53 MONEY = 500

REM --DAY--
100 DAY += 1
101 PRINT company$; " -- DAY"; DAY; "--"
102 IF DAY = 1 THEN PRINT "You're starting with"; MONEY/100; " dollars."
103 PRINT "You have"; MONEY/100; " dollars."

REM --TEMP--
150 temp = INT(RND * 100)
151 IF temp < 25 THEN GOTO 150
152 IF temp > 90 THEN PRINT "It's a scorcher!"
153 IF temp < 45 THEN PRINT "Put on you're jacket!"
154 PRINT temp; " degrees."

REM --CUSTOMERS--
200 IF temp < 50 THEN customers = INT(RND * 1)
201 IF temp > 50 < 80 THEN customers = INT(RND * 11)
202 IF temp > 80 THEN customers = INT(RND * 25)
203 IF customers < 8 THEN PRINT "Not much business."
204 IF customers > 20 THEN PRINT "Good business!"
205 IF customers = 25 THEN PRINT "JACKPOT!"
206 PRINT customers; " customers."

REM --SUPPLIES--
250 supplies = INT(RND * 100) * INT(RND * 10)
251 PRINT supplies/100; " supply cost."

REM --MONEY--
300 MONEY = customers * 50 + MONEY
301 MONEY = MONEY - supplies

REM --ENDday--
350 PRINT "Result: "; MONEY/100; " dollars."
351 INPUT "ENTER to continue"; d$
352 CLS
353 IF MONEY > 0 THEN GOTO 100

REM --ENDGAME--
400 PRINT "You are bankrupt with"; MONEY/100; " dollars."
405 INPUT "Play again? (y | n)"; e$
410 CLS
420 IF e$ = "y" THEN GOTO 10
425 IF e$ = "Y" THEN GOTO 10

