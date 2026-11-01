# CRACK — browser replica: design phase

**Status:** design only. No game code written yet, by request.
**Target game:** [CRACK](https://store.steampowered.com/app/4312190/CRACK/) (Rafoli, released 26 Oct 2026, $7.99, 1–4 player online co-op, "Very Positive", 90% of 1,304 reviews).
**Host:** `pramodh-del.github.io`, static GitHub Pages, deployed by `.github/workflows/deploy.yml`.

---

## 1. What CRACK actually is

Established from the Steam store page plus the public Steam achievement API
(`GetGlobalAchievementPercentagesForApp`, appid `4312190`), which returns all 40
achievement IDs with global completion rates — the most reliable progression signal
available without owning the game. Community wikis fill in nouns; they are 1 week old
and unofficial, so treat the numbers as indicative, not canonical.

**Premise.** You are a contract worker in a dystopian corporate laboratory. In the
middle of it sits a giant egg. Your job is to crack it open. The egg *reacts* to you.
Nobody tells you what is inside.

**Genre stack (Steam tags).** Adventure, Simulation, Co-op, Incremental, Comedy,
Dystopian, Mystery, Cleaning, Party Game, **First-Person**, Nonlinear, **3D**,
Online Co-Op, Sci-fi, Horror, Mining, Destruction.

**Core loop.** Hit the egg → material drops → haul it in a Bucket → deposit it at the
Resource Depot and insert your Employee Badge to get paid → spend at the Company Store
→ better tool → deeper layer. Classic incremental, but the "clicker" is a first-person
body in a 3D room, and the number that goes up is gated by *material tier*, not just cost.

### 1.1 Material layers, outermost to innermost

Derived from the 27-step work-order chain. Each layer needs a strictly better tool —
this is the game's real gate, and the spine of the replica.

| # | Material | Required tool |
|---|----------|---------------|
| 1 | Shell | Pickaxe, Chisel on flashing sections |
| 2 | Membrane | Shovel |
| 3 | Tissue | Shovel Mk II |
| 4 | Blight | — |
| 5 | Calcite | — |
| 6 | Prime Tissue | Dynamite / higher-tier excavation |
| 7 | Bone | Jackhammer |
| 8 | Hatchite | Jackhammer |
| 9 | Containment Plating | Dynamite Mk III or Blowtorch |
| 10 | Containment sack → the Specimen | — |

### 1.2 Systems the achievement list proves exist

Each entry is an achievement ID with its global completion rate. The rate is a free
difficulty curve: `FIRST_CRACK` at 99.1% is the tutorial, `PERFECT_SNAKE` at 0.8% is
the deepest grind in the game.

- **Automation** — `AUTOMATION` 69.8%, `FULLY_UPGRADED` 28.9%. Workbots ($100 to
  commission) and Collector Bots ($100, pull from Buckets you leave out). Bots are
  *not* money-upgradable: they take **Chalazite**, found by upgrading the Deposit
  Scanner's depth and sensitivity. A second currency, deliberately.
- **Audit / quota** — `AUDIT_PASSED` 45.1%, `AUDIT_FAILED` 30.8%. A corporate review
  you can fail. Note both are high: failing is a normal outcome, not a game over.
- **Shift cycle** — `TENURE` 53.9%, `GOOD_SLEEPER` 6.7%. Shifts end with a progression
  report; sleeping in quarters grants a "Dream Bonus".
- **Construction** — `SCAFFOLD_COLLAPSE` 6.0%. Toolbox places Scaffolding Parts,
  Hammer tightens bolts, poles must touch the ground, build to 10m. It can collapse.
- **Scanner economy** — `STRUCK_GOLD` 50.2%. Nodules, crystals, Artery Sacks, Parasites.
- **Hazards and horror** — `ARTERY_SACK` 42.5%, `SWALLOWED` 41.5%, `YOLKED` 31.4%,
  `WELL_DONE` 27.0%, `PEST_CONTROL` 2.8%, `GAS_FALL` 2.5%, `EGG_ON_YOUR_FACE` 10.8%.
  The egg bites back. There is an agitation/sedation mechanic.
- **Gated rooms** — `PROFESSIONAL_INTERN` 21.8%, `STAFF_ONLY` 19.0%, `ACCESS_GRANTED`
  17.2%, `COLD_CASE` 21.6%, `IT_SPECIALIST` 27.4%, `BREACH` 32.2%. Catalog tiers:
  Intermediate → Advanced → Specialty → Executive → Prograde. A UV Flashlight reveals
  a per-run Redacted passcode — **procedural secrets**, not static ones.
- **Break Room arcade** — `HIGH_SCORE` 16.3%, `PLAY_THE_GAME` 1.9%, `CHAMPION` 1.7%,
  `PERFECT_SNAKE` 0.8%, `NOTHING_BUT_NET` 7.1%, `OWN_GOAL` 23.4%. Playable cabinets:
  **Eggsteroids** (needs 3,500 points as a work order), Snake, a slot machine
  ($100+ single payout unlocks the Executive Catalog), basketball.
- **Co-op texture** — `TEAM_PLAYER` 5.7%, `HOT_POTATO` 24.1%, `HIT_AND_RUN` 53.5%.
  Golf carts, passed explosives, running your friends over.
- **Meta** — `FULL_WARDROBE` 8.5% cosmetics, `PHARMACOLOGY` 1.9% pills/morale,
  `PAPER_TRAIL` 2.1% lore clipboards, `SEIZED_ASSETS` 5.0%, `FIVE_FIGURES` 17.1%,
  `JACKPOT` 11.2%.
- **Two endings** — `WELL_DONE` (cook the chicken) and a second route through the old
  Break Room door opened with the Hammer.

**Verdict on size.** This is not a weekend clone. It is a 27-step quest chain, 10
material tiers, ~15 tools, 5 catalog tiers, 2 bot types with a second currency,
4 arcade minigames, a shift loop with an audit, physics scaffolding, hazards, procedural
codes, cosmetics and 2 endings — all in first-person 3D with 4-player netcode.

---

## 2. Three hard walls, before anything else

### Wall 1 — your stack choice conflicts with the game

You chose *standalone web game, plain HTML + TS + canvas*. CRACK is tagged
**First-Person** and **3D**. Canvas 2D cannot render a first-person 3D facility. The
options are honest ones:

| Option | Fidelity | Reality |
|--------|----------|---------|
| **A. Three.js, vanilla TS, no React** | first-person 3D, true to the original | WebGL, ~600KB gzipped, you write a 3D camera controller and collision. Still "standalone, no React" — your constraint survives. **Recommended.** |
| B. Canvas 2D, side-on cutaway of the egg | wrong genre feel, but the *incremental* core is intact and visible | Fast to a playable loop. Arguably a better portfolio piece: it reads instantly in a screenshot. Not a replica. |
| C. Canvas 2D, top-down facility | middle ground | Loses the egg-as-a-wall-in-front-of-you feeling, which is the whole hook. |

### Wall 2 — assets

I will not copy Rafoli's models, textures, audio, UI art or fonts. Mechanics, systems
and layout are not copyrightable; their art is. Everything ships as original
primitives or CC0. Expect flat-shaded low-poly. The replica is of the *design*.

### Wall 3 — co-op on static hosting

GitHub Pages serves files. It cannot run a game server, hold a socket or keep state.
Four-player co-op therefore needs one of:

| Approach | Verdict |
|----------|---------|
| **Host-authoritative WebRTC mesh** + free signaling (PeerJS / a tiny Cloudflare Worker) | Recommended. One player's browser *is* the server. No hosting cost. Host leaves → session dies, which is acceptable. |
| Deterministic lockstep P2P | Elegant, but one float divergence desyncs everyone. Do not do this first. |
| Single-player only for v1 | **Strongly recommended for M0–M3.** Co-op is the single largest risk in this project and the economy must be right before it is networked. |

---

## 3. Fidelity ladder — pick a rung

"Exact replica" needs a definition before it can be built or judged.

- **Tier 1 — Systems replica.** Same layers, same tools, same work orders, same
  economy curve, same gates. Original art, 3D first-person. *This is what I would build.*
- **Tier 2 — Systems + content parity.** Add all 40 achievements, both endings, all 4
  arcade cabinets, cosmetics, lore clipboards, procedural passcodes.
- **Tier 3 — Visual replica.** Match their lighting, layout and feel from screenshots.
  Months of asset work by someone who is not primarily a 3D artist.
- **Tier 4 — Pixel-exact.** Requires their assets. Not happening, see Wall 2.

---

## 4. System decomposition

Twelve modules. For each: what it owns, and the design question that is *yours* to
answer before I write it. The boundaries are my call as the senior on this; the
mechanisms inside them are the interesting part and I am not going to hand them to you.

```
src/
  core/      loop.ts  clock.ts  events.ts  rng.ts
  sim/       egg.ts  materials.ts  economy.ts  workorders.ts  shift.ts  bots.ts
  world/     facility.ts  rooms.ts  scaffolding.ts  hazards.ts
  player/    controller.ts  inventory.ts  tools.ts  interact.ts
  render/    scene.ts  hud.ts  cabinet.ts
  net/       host.ts  peer.ts  snapshot.ts
  save/      persist.ts  migrate.ts
```

### 4.1 `core/loop` — fixed-timestep simulation
Owns: the tick. Separates simulation rate from render rate so physics and economy are
frame-rate independent.
**Your question:** `requestAnimationFrame` delivers variable `dt`. If you tick the
simulation once per frame, a 144Hz monitor mines the egg twice as fast as a 60Hz one.
Why? What is the standard fix, and what is the *accumulator spiral* failure mode when a
tab is backgrounded for 30 seconds?

### 4.2 `sim/egg` — the layer state machine
Owns: per-layer HP, the active layer, which tool is legal, flashing Chisel sections,
agitation.
**Your question:** 10 layers, each with "can this tool damage me" rules and its own
drop table. Model it as (a) an enum + switch, (b) a class hierarchy, (c) data-driven
records in a table, or (d) a state machine with explicit transitions? Defend your pick.
Then: where does *agitation* live — on the egg, on the player, or as its own system?

### 4.3 `sim/economy` — the incremental spine
Owns: prices, payouts, the curve. **This is the system that decides whether the game is
fun**, and it is pure logic with zero rendering — which makes it the one you should
write first and test hardest.
**Your question:** Work orders demand $30 Shell, then $70 Tissue, then $150 Prime
Tissue, then $300 Hatchite. Tool costs rise alongside. Derive the growth ratio. Is it
geometric? If a Shell chunk pays $1 and the Jackhammer costs $300, how many swings is
that, and is that a grind or a goal? What breaks when a player sells 10,000 Shell
instead of progressing — and which single lever in the original prevents that?
*(Hint: look again at §1.1. The gate is not price.)*

### 4.4 `sim/workorders` — the 27-step chain
Owns: objectives, completion predicates, catalog unlocks.
**Your question:** Order 10 is "score 3,500 in Eggsteroids" — a minigame. Order 17 is
"win $100 in one slot payout" — chance. Order 13 is "build to 10 meters" — physics.
Design one predicate interface that all 27 satisfy without 27 special cases.

### 4.5 `sim/shift` + audit
Owns: shift boundary, end-of-shift report, Dream Bonus, the audit you can fail.
**Your question:** `AUDIT_PASSED` 45.1% and `AUDIT_FAILED` 30.8% — most players see
both. So failing cannot be a game over. What *is* it? Design the penalty.

### 4.6 `sim/bots` — automation and the second currency
Owns: Workbots, Collector Bots, Chalazite, Scanner depth/sensitivity.
**Your question:** Why does the original refuse to let money buy bot levels, and gate
them behind a material you can only find by upgrading a scanner? Name the design
problem that solves. (It is the central problem of every incremental game.)

### 4.7 `world/scaffolding` — the physics toy
Owns: poles, floors, ladders, bolts, ground contact, collapse.
**Your question:** `SCAFFOLD_COLLAPSE` is 6.0%, so collapse is rare and memorable, not
punishing. Full rigid-body physics, or a constraint graph you validate on placement?
Which gives you "poles must touch the ground" and "untightened bolts fail" for less work?

### 4.8 `world/rooms` — gating and procedural secrets
Owns: catalog tiers, locked doors, the UV Flashlight passcode.
**Your question:** The passcode is per-run. Where does the seed live so that all 4
players in a co-op session see the *same* digits, and a page reload does not reroll them?

### 4.9 `player/controller` — first-person movement
Owns: pointer-lock camera, walk/sprint, collision, the golf cart.
### 4.10 `player/inventory` + `tools`
Owns: Bucket capacity (20 pieces), tool tiers, Employee Badge payment.
**Your question:** Partial Bucket deposits pay money but do *not* count toward a
full-Bucket work order. Model that cleanly.
### 4.11 `render/*` — scene, HUD, arcade cabinets
### 4.12 `net/*` — host-authoritative snapshots (M4+, not before)

---

## 5. Milestones

Each one ends in something playable. No milestone is "finish system X".

| M | Deliverable | Proves |
|---|-------------|--------|
| **M0** | Headless `sim/` + economy, driven by a test harness. No renderer. | The curve is fun as *numbers* before a pixel is drawn. |
| **M1** | First-person room, one egg, Pickaxe, Shell drops, Bucket, Depot, money. | The loop. |
| **M2** | Company Store, 5 catalogs, tools through Shovel Mk II, layers 1–3. | The gate. |
| **M3** | Work orders 1–14, shift loop, audit, Scanner, Nodules. | It is a *game*. |
| **M4** | Single-player save/load, then host-authoritative co-op for 2. | The risk. |
| **M5** | Scaffolding, hazards, Artery Sacks, Parasites, bots + Chalazite. | Depth. |
| **M6** | Arcade cabinets, cosmetics, clipboards, both endings, 40 achievements. | Tier 2. |

M0 is non-negotiable and it is where you start. An incremental game with a bad curve is
not rescued by good rendering.

---

## 6. Integration with this repo

`vite.config.ts` is currently single-entry. A standalone game at `/crack/` needs a
second Rollup input:

```ts
rollupOptions: { input: { main: 'index.html', crack: 'crack/index.html' } }
```

`base: './'` already keeps asset paths relative, so Pages sub-paths keep working.
`npm run lint` and `tsc -b` gate the deploy workflow, so the game must be lint-clean and
typecheck-clean or the whole site stops deploying. Three.js would be a `dependencies`
addition; it must be code-split so the portfolio home page does not pay for it.

---

## 7. Interview Q&A

Tied to the systems above, in Java 21, because these come up in backend interviews too.

**Q1. Fixed timestep vs. variable timestep — and what does this have to do with a
backend scheduler?**
A variable timestep makes behaviour depend on hardware speed; a fixed timestep
accumulates real elapsed time and runs N discrete steps of constant size, so results are
deterministic and replayable. The backend parallel is a scheduler that must do work
"every 100ms" regardless of load — and the same trap appears: if each tick takes longer
than the tick interval, the backlog grows without bound. Cap the catch-up
(`maxSteps`), and never measure elapsed time with wall-clock time:

```java
// Wrong: wall clock jumps with NTP sync and DST.
long t = System.currentTimeMillis();
// Right: monotonic, immune to clock adjustment.
long t = System.nanoTime();
```
Interviewers follow up with: *why is `nanoTime()` only valid for differences, never as a
timestamp?* Because its origin is arbitrary and unrelated to epoch time.

**Q2. Model the 10 egg layers so illegal tool/layer combinations cannot compile.**
Java 21's sealed interfaces + records + exhaustive pattern matching in `switch`:

```java
public sealed interface Layer permits Shell, Membrane, Tissue, Bone {}
public record Shell(int hp)    implements Layer {}
public record Membrane(int hp) implements Layer {}
public record Tissue(int hp)   implements Layer {}
public record Bone(int hp)     implements Layer {}

public sealed interface Tool permits Pickaxe, Shovel, Jackhammer {}

static int damage(Tool tool, Layer layer) {
    return switch (layer) {
        case Shell s    -> tool instanceof Pickaxe    ? 10 : 0;
        case Membrane m -> tool instanceof Shovel     ? 12 : 0;
        case Tissue t   -> tool instanceof Shovel     ? 8  : 0;
        case Bone b     -> tool instanceof Jackhammer ? 20 : 0;
    };
}
```
The payoff: `sealed` means the compiler knows every subtype, so the `switch` needs no
`default` and **adding an 11th layer breaks the build at every site that must handle it**.
That is the entire argument for sealed types in an interview — exhaustiveness is checked
at compile time, not discovered in production.

Verified on `openjdk 21.0.12.1` with `javac --release 21 -Xlint:all`: the snippet above
compiles warning-free, and adding `Hatchite` to the `permits` clause without adding a
`case` fails the build with exactly:

```
error: the switch expression does not cover all possible input values
        return switch (layer) {
               ^
```

Don't take that on trust — reproduce it, then delete the `sealed` keyword and watch the
same code demand a `default` branch it cannot sensibly fill.

**Q3. The egg's money counter will exceed `long` in a deep incremental run. What do you
use, and what is the trap?**
`BigDecimal`, not `double` — binary floating point cannot represent `0.1`, so money
arithmetic drifts. The trap is that `BigDecimal` is immutable and
`equals()` compares *scale*: `new BigDecimal("1.0").equals(new BigDecimal("1.00"))` is
`false`, while `compareTo` returns `0`. Use `compareTo` for value comparisons, and never
put `BigDecimal` in a `HashSet` expecting value semantics.

**Q4. Four co-op clients mutate shared facility state. In Java terms, how do you keep it
consistent — and why is "just synchronize everything" wrong?**
A single authoritative owner serialising commands beats locks spread across state.
Concretely: a command queue consumed by one thread, which is exactly the actor /
single-writer model, and the same reason the game is host-authoritative rather than a
lockstep mesh. Broad `synchronized` blocks cost you throughput and still allow lock-order
deadlock. Java 21's virtual threads make per-connection blocking I/O cheap again:

```java
try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
    for (var conn : connections) exec.submit(conn::pump); // 10k threads is fine
}
```
Follow-up they will ask: *when do virtual threads NOT help?* CPU-bound work — they
multiply concurrency, not cores — and anything holding a `synchronized` block across a
blocking call, which pins the carrier thread.

**Q5. `sim/` has zero rendering. Why is that an architectural decision and not just
tidiness?**
Because it makes the economy unit-testable, headlessly, at 10,000× speed — you can
simulate a 40-hour playthrough in a test and assert the curve never stalls. It is the
same reason backend services keep domain logic free of HTTP: the dependency arrow points
inward, so the core is testable without the shell. Hexagonal architecture, ports and
adapters, pick your name.

**Q6. Two currencies (money and Chalazite). What design problem does that solve?**
Single-currency incrementals collapse when a player finds any one high-yield loop: they
grind the cheapest action and buy everything, skipping the content. A second currency
that money *cannot* buy forces engagement with a different system — here, upgrading the
Scanner and exploring. The backend analogue is rate-limiting by a dimension the caller
cannot trade away.

---

## 8. Decisions needed before any code

1. **Stack** — Three.js first-person 3D (true replica), or canvas 2D cutaway (fast,
   honest, not a replica)? See Wall 1.
2. **Fidelity tier** — 1, 2 or 3? See §3.
3. **Co-op** — accept single-player through M3, with WebRTC at M4?
4. **M0 ownership** — you write `sim/economy` and `sim/egg` against my interfaces and I
   review them like a PR, or I scaffold the harness and you fill the derivations?

## 9. Sources

- https://store.steampowered.com/app/4312190/CRACK/
- `https://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=4312190`
- https://cogconnected.com/?p=395572
- https://crackgame.site/ (unofficial, 1 week old)
- https://crackegg.wiki/ (unofficial, 1 week old)
- https://www.sportskeeda.com/esports/crack-full-game-walkthrough
