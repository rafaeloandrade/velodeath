# CHANGELOG

## v0.4.5 — FLOW MUST WIN

### Core fix
- High cadence while properly tucked in Draft no longer counts automatically as ATTACK.
- Attack stamina cost now requires actual attack intent:
  - recent lane change / overtaking move; or
  - high cadence while exposed.

### Flow recovery
- Draft + Flow >= 70 now strongly recovers stamina:
  - <=108 rpm: +7.0 stamina/s
  - 109–118 rpm: +4.5 stamina/s
  - >118 rpm while still in Draft: +2.0 stamina/s
- Partial Draft recovery:
  - <=110 rpm: +3.0 stamina/s
  - >110 rpm: +1.0 stamina/s
- Exhausted recovery in Draft increased to +3.5 stamina/s.

### Goal
A rider who correctly spends two fast laps in Flow should preserve or recover stamina instead of reaching zero. Stamina should be spent mainly by real attacks, sprints, and exposed riding.
