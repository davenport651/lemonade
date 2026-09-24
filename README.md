# 🍋 Lemonade Stand

A lemonade stand tycoon game for kids, descended from a QBasic original
(`lemonade.bas`). Run the stand from the first Saturday of May through
August 31st: weekends only while school's in session, every day in summer.

## How to play

Open `index.html` in any browser (or play it on GitHub Pages).

Each morning you decide:
- **Cups to make** — each costs 25¢ in lemons & sugar. Unsold cups spoil!
- **Price per cup** — 25¢ to $2.00. Higher prices mean fewer customers.

Then **Open Stand** or **Skip Day** (skip 4+ days in a row and fixed
costs pile up).

## The grown-ups

- **🧓 Grandpa** gives a folksy weather forecast before you decide. Ask
  once a day. It's free* — *first 5 forecasts free, then 25¢ each,
  tallied silently and **billed at season end**. Ask too often and he
  gets a little snippy.
- **👩 Mom** appears whenever you waste 5+ cups, with timeless wisdom
  about starving kids in Africa.

## Also inside

- Season calendar (May weekends → summer daily → Aug 31 finale)
- Random heatwaves & cold snaps
- Save/continue (localStorage) and a persistent high score
- End-of-season report card: profit, cups sold/wasted, mom guilt trips,
  best day, and Grandpa's tab

## Files

- `index.html` / `lemonade.js` — the game
- `lemonade.bas` — the QBasic ancestor
- `lemonade.jpeg`, `lemonadegrandpa.png`, `lemonademom.png` — artwork

Built from the `feature/calendar-and-grandpa-*` branch (Google Jules's
calendar/forecast refactor) plus the missing grandpa-tab mechanic,
the business decision loop, and Mom.
