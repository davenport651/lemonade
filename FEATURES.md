# Lemonade Game — Feature Ideas

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
