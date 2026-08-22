# CHANGELOG

## v0.5.1 — FATE FLOW / SELECTED RIDER / ENGLISH UI

### Fate
- Restored the previously approved Fate format:
  - 2D6 rolled sequentially for each of the 7 riders.
  - Animated dice.
  - Highest total gets the best line-up position.
  - Ties use the highest individual die, then random tiebreak.
- Added a dedicated LINE-UP screen before the race.
- Line-up result is stored and used by the Death Pacer formation.

### Rider selection
- The rider chosen on Rider Select is now the actual player rider.
- Player marker follows the selected color instead of always marking BLUE.
- Fate order reorganizes all seven riders behind Death.

### Race start
- SPACE / ENTER from Line-up now transitions cleanly to the race.
- PacerScene now safely loads selected rider + Fate order before creating sprites.
- SPACE starts the Death Pacer phase normally.

### Language
- Standardized gameplay and interface copy to English.
- Official approved Japanese strings remain unchanged.
