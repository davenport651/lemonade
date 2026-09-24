# Lemonade Game — Feature Ideas

## Bugs
- "Cups to make" input has no affordability cap: the field's `max` is a static 200, so a broke player can type 200 cups and only finds out via the "You could only afford N cups!" log line after opening. Set the input's `max` dynamically each morning to `floor(money / CUP_COST)` (current money ÷ cost-per-cup), matching the clamp already in `readMorningChoices`.

## Balance
- No fail state: worst possible day is making 200 cups and selling zero = $50 lost, and making 0 cups is always free — so once the bankroll passes ~$50 (a few good days from the $5.00 start), bankruptcy becomes mathematically impossible and the rest of the season is risk-free. Possible fixes: fixed daily costs (stand permit / table fee) so turtling still bleeds, ingredient costs that scale with volume, or scoring that rewards efficiency over hoarding.

Potential features and tweaks. Nothing here is scheduled; it's a parking lot for playtesting notes.

## Mom guilt trip v2 (playtesting note, 2026-09-24)
- Mom currently guilt-trips on waste alone (5+ cups unsold), even on wildly profitable days.
- Make her business-savvy: only guilt-trip when the waste actually hurt — e.g. the day lost money or margins were bad.
- On profitable days with leftovers, flip it: she could be proud instead ("doubled your money" → praise, not scolding).

## Multi-cup customers (playtesting note, 2026-09-24)
- Currently demand is faceless "cups wanted" (1 customer = 1 cup, always). Model individual customers instead: each buys at least 1 cup, with a chance of a 2nd or 3rd.
- Second/third-cup chance scales with temperature (scorchers → thirstier customers) and inversely with price (cheap → people stock up; $2.00 → almost nobody doubles).
- Every roll needs inherent noise, like the existing `(temp-40)^1.5/6.5 ±30%` demand formula — nothing deterministic, so days stay unpredictable.
- Possible starting formula (draft): `p2 = clamp(0.10 + max(0, temp-75)*0.02 − (price−1.00)*0.15, 0, 0.5)`, jittered ±30%; third cup at half that chance, only if they bought a second.
- Wording fix rides along: log "N customers bought M cups" instead of "Customers wanted M cups", so the text stops implying one-cup customers.

## Variable input costs / lemon inventory (design musing, 2026-09-24)
- Input costs are currently a flat 25¢/cup. Real grocery prices barely drift over one summer, so dramatic swings need a game-design justification, not a realism one.
- Full version: fresh-lemon inventory system — buy lemons in bulk for per-unit discounts, but unused lemons spoil. Genuine decision (bulk savings vs. rot risk), but it's an entire subsystem: stock counts, spoilage timers, bulk pricing tiers.
- Light version: event-based cost shocks instead of inventory. E.g. "Heatwave wilted the lemon crop — cups cost 40¢ this week." One flavor line + one variable tweak, no tracking overhead.
