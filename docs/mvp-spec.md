# Hoist the Cone — MVP Spec

**Domain:** `hoistthecone.com`  
**Working title:** **Hoist the Cone**  
**Tagline:** *The unofficial Buccos traffic report.*  
**Status:** Draft MVP v2 for review  
**Owner:** James + Marcus  

---

## Review updates in v2

This version incorporates James’s first review pass:

- Prefer **Pirates** / **Buccos** over generic “Pittsburgh baseball” where practical.
- Keep the homepage focused on **live Cone Status + Traffic Report**, not origin lore.
- Move the origin explanation into a lower-page expandable/info section.
- Keep “Acquire cones legally” as a small footer wink, not a repeated joke.
- Do not force player references unless the live data naturally supports them.
- Keep the product shape as a **dashboard-style microsite** with recap elements.
- Explore tone with concrete copy examples before locking voice.

---

## 1. Product thesis

`hoistthecone.com` should be a small, polished, funny-but-useful Pirates fan site that turns live/recent Pirates baseball into a “traffic cone” status report.

The site should feel like something a Pirates fan would send to another Pirates fan with: “lol this is actually good.”

It should **not** feel like:

- a meme page slapped together in an hour
- a gambling/stat nerd dashboard
- a generic MLB standings site
- an AI-generated content farm
- a copyright-infringing fake official Pirates site

The core idea:

> When something good happens for the Pirates, the cone gets hoisted. The site tells you whether the cone deserves to be hoisted right now — and why.

---

## 2. MVP goal

Build a one-page site that answers three questions instantly:

1. **What is the current Cone Status?**
2. **What happened in the latest/relevant Pirates game?**
3. **How hoistable is the cone right now?**

The MVP should be good enough to launch publicly at `hoistthecone.com` without embarrassment.

---

## 3. Core concept

### Primary framing

**Hoist the Cone** is the unofficial Buccos traffic report.

Alternate tagline options for final selection:

| Option | Tagline | Notes |
|---:|---|---|
| A | **The unofficial Buccos traffic report.** | Marcus recommendation. Short, local, legally safer than official branding-heavy language, still clearly Pirates-coded. |
| B | **The unofficial Pirates traffic report.** | Clearest and strongest fan-language version. Likely okay with clear unofficial disclaimer, but uses the team name directly. |
| C | **The unofficial Pittsburgh baseball traffic report.** | Safest/most generic, but less fun and less specific. Keep as fallback only. |

Working assumption for MVP: use **Option A** unless James strongly prefers Option B.

Pirates baseball events are translated into traffic/cone language:

| Baseball event | Cone/traffic framing |
|---|---|
| Pirates win | Cone hoisted |
| Big win | Full hoist |
| Close win | Cone upright |
| Loss | Cone lowered |
| Blowout loss | Cone in storage |
| Runs scored | Traffic cleared |
| Runners left on base | Congestion / gridlock |
| Home run | Lane opened |
| Stolen base | Illegal lane change, but we allow it |
| Comeback | Emergency cone deployment |
| Bullpen meltdown | Construction delay |
| Walk-off | Citywide cone deployment |
| Skenes dominance | Hazard removed |

### Tone

Smart, local, dry, and playful. Not try-hard.

The live site should probably land between **dry/professional municipal report** and **high-design minimalist absurdity**. “Fan-blog funny” can appear in small doses, but should not dominate.

#### Tone option A — dry/professional municipal report

Feels like PennDOT accidentally got assigned Pirates duty.

Example blurbs:

- “Cone Status: CONE UP. Pirates traffic cleared at an acceptable rate. No further delays reported.”
- “The Buccos generated nine runs and left limited congestion behind. Cone deployment authorized.”
- “Loss recorded. Cone lowered. Motorists should expect emotional delays through the evening commute.”
- “First pitch pending. Cone staged for possible deployment.”

Pros: funniest if executed straight-faced; feels distinctive; strong design fit.  
Cons: can become too dry if every line sounds the same.

#### Tone option B — fan-blog funny

Feels more like a sharp Pirates fan writing quick recaps.

Example blurbs:

- “Cone Status: FULL HOIST. Eleven runs on the road. That’ll do.”
- “The Buccos made it weird, survived anyway, and earned a responsible cone lift.”
- “Not enough offense, too much bullpen, cone remains sadly unhoisted.”
- “Skenes day. Cone preheated.”

Pros: accessible and human; easy to vary.  
Cons: easier to become generic sports-blog slop if we’re not disciplined.

#### Tone option C — high-design minimalist absurdity

Feels like a museum label for a traffic cone that happens to track baseball.

Example blurbs:

- “Cone Status: FULL HOIST. Orange object ascendant. Conditions favorable.”
- “Traffic became motion. Runs became evidence. Cone approved.”
- “The game produced insufficient lift. The cone rests.”
- “A scheduled contest approaches. The cone waits without emotion.”

Pros: weird, stylish, memorable.  
Cons: might be too precious if overused.

#### Recommended tone blend

Use **A as the base**, borrow **B for warmth**, use **C sparingly for polish/weirdness**.

Practical voice rule:

> Write the site like an overqualified municipal traffic office got emotionally invested in the Pirates.

Avoid:

- excessive pirate puns
- fake Gen Z brand voice
- screaming all-caps everywhere
- “yinz” abuse
- anything that sounds like a sportsbook
- forcing player references when the data does not call for them

---

## 4. MVP page structure

Single-page responsive site.

### 4.1 Hero / Current cone status

Top section should immediately show:

- Site title: **Hoist the Cone**
- Tagline: *The unofficial Buccos traffic report.*
- Current Cone Status
- Cone Index score
- One-sentence explanation

Example:

> **Cone Status: FULL HOIST**  
> **Cone Index: 87 / 100**  
> Pirates won 9–4, scored late, and cleared traffic with authority. Cone remains elevated.

#### Cone Status labels

Use a small set of labels so the site has a memorable language.

| Status | Score range | Meaning |
|---|---:|---|
| **FULL HOIST** | 80–100 | Big win, dramatic win, or excellent recent form |
| **CONE UP** | 60–79 | Good result or positive live situation |
| **CONE WATCH** | 40–59 | Game pending, neutral, or mildly promising |
| **PARTIAL HOIST** | 25–39 | Mixed result; some good, some pain |
| **CONE DOWN** | 1–24 | Loss, blown chance, or low-energy result |
| **CONE IN STORAGE** | 0 | Off day/no useful signal, or catastrophic vibes |

Note: We can tune these after seeing the real API output.

Loss-state naming options:

| Option | Label | Notes |
|---:|---|---|
| A | **CONE DOWN** | Recommended. Clear, not too goofy, pairs naturally with CONE UP. |
| B | **LOWER THE CONE** | More ceremonial, maybe a little dramatic. |
| C | **SAD CONE** | Funny, but James does not love it. Keep as fallback only. |
| D | **CONE DELAY** | More traffic-themed, less immediately legible. |

Working assumption for MVP: use **CONE DOWN** for the ordinary loss state, reserve **CONE IN STORAGE** for off-days/catastrophic vibes.

---

### 4.2 Today / latest game card

Show the most relevant Pirates game:

Priority:

1. Live game today
2. Scheduled game today
3. Completed game today
4. Most recent completed game
5. Next scheduled game

Fields:

- Opponent
- Home/away
- Score or start time
- Inning/status if live
- Venue
- Probable pitchers if available
- Result if final

Example:

> **Latest Game**  
> Pirates 11, Phillies 7 — Final  
> Road traffic successfully redirected. Cone hoisted on enemy pavement.

---

### 4.3 Traffic Report card

A compact stat translation for the game.

Fields, if available:

- Runs scored = **Traffic cleared**
- Hits / walks = **Traffic generated**
- Runners left on base = **Congestion left behind**
- Home runs = **Lanes opened**
- Stolen bases = **Lane changes**
- Strikeouts by Pirates pitchers = **Hazards removed**
- Errors = **Cone violations**

Example:

| Traffic metric | Value |
|---|---:|
| Traffic cleared | 9 runs |
| Lanes opened | 2 HR |
| Lane changes | 3 SB |
| Congestion left behind | 6 LOB |
| Hazards removed | 10 K |

If full boxscore data is not available for a live/scheduled game, gracefully show what is available.

---

### 4.4 Cone Index explainer

A small section explaining the score.

Example:

> The Cone Index is a deeply unofficial measure of Pirates joy, calculated from score, game result, run production, homers, steals, pitching, standings context, and general orange-plastic momentum.

Include a “How it works” expandable/collapsible area or small modal later. For MVP, plain visible text is fine.

---

### 4.5 Recent Hoists

Show the last 5 completed Pirates games.

Each card:

- Date
- Opponent
- Score
- Cone grade/status
- Short traffic-style recap

Example:

> **Jun 29 — Pirates 11, Phillies 7**  
> **Grade: A- / FULL HOIST**  
> Eleven runs on the road. Traffic cleared, cone elevated, bullpen made it only slightly weird.

This makes the site feel less empty and gives it season-diary value.

---

### 4.6 Origin / What is this?

Short, careful explainer placed below the live/dashboard content.

Implementation preference: make this a small expandable section, info drawer, or compact “What is this?” card near the bottom. It should not compete with the hero status.

Draft copy:

> “Hoist the Cone” started as the kind of accidental baseball nonsense that only gets better when everyone commits to the bit. A weird Pirates shirt showed up, a traffic cone made its way into the dugout, the team started lifting it after good things happened, and fans did what Pittsburgh fans do: made it a whole thing.
>
> This site is an unofficial traffic report for that whole thing.

Mention that it is unofficial and fan-made.

Avoid overclaiming exact origin unless sourced in final copy.

---

### 4.7 Footer

Footer should include:

- “Unofficial fan project. Not affiliated with MLB or the Pittsburgh Pirates.”
- “Data from MLB Stats API.”
- Tiny line: “Acquire cones legally.” Keep it subtle; do not repeat the joke elsewhere unless it naturally fits.

No ads. No newsletter. No account system.

---

## 5. Cone Index scoring — MVP version

We want something deterministic, explainable, and easy to tune.

### 5.1 Inputs

Use MLB Stats API for:

- latest/relevant game status
- score
- runs
- hits
- home runs if available
- stolen bases if available
- strikeouts if available
- recent games
- standings/record/streak if available

### 5.2 Basic score algorithm

Start with base by game state:

| Situation | Base score |
|---|---:|
| Pirates won latest game | 60 |
| Pirates lost latest game | 20 |
| Live and Pirates leading | 55 |
| Live and tied | 45 |
| Live and trailing | 30 |
| Scheduled today | 42 |
| Off day after win | 55 |
| Off day after loss | 25 |

Add/subtract modifiers:

| Modifier | Points |
|---|---:|
| Pirates win by 5+ | +15 |
| Pirates win by 3–4 | +10 |
| Pirates win by 1–2 | +5 |
| Pirates lose by 5+ | -10 |
| Pirates score 8+ | +12 |
| Pirates score 5–7 | +7 |
| Pirates score 0–1 | -10 |
| Pirates hit 2+ HR | +8 |
| Pirates hit 1 HR | +4 |
| Pirates steal 2+ bases | +5 |
| Pirates pitchers allow 0–2 runs | +8 |
| Pirates pitchers allow 7+ runs | -8 |
| Pirates on winning streak W2+ | +5 |
| Pirates on losing streak L2+ | -5 |
| Walk-off win | +20 |
| Blown lead / walk-off loss | -15 |

Clamp to 0–100.

### 5.3 Status mapping

| Score | Label |
|---:|---|
| 80–100 | FULL HOIST |
| 60–79 | CONE UP |
| 40–59 | CONE WATCH |
| 25–39 | PARTIAL HOIST |
| 1–24 | CONE DOWN |
| 0 | CONE IN STORAGE |

### 5.4 Explanation generation

Use template-based copy, not LLM-generated copy at runtime.

Examples:

- Win + high score: “Pirates cleared traffic early and often. Full hoist authorized.”
- Low-scoring win: “Not pretty, but the road reopened. Cone up.”
- Loss with offense: “Traffic moved, but not enough. Partial hoist denied.”
- Loss: “Traffic backed up. Cone down pending further review.”
- Blowout loss: “Major delays. Cone returned to storage.”
- Scheduled game: “Cone staged for deployment. First pitch pending.”

---

## 6. Data/API plan

Use free MLB Stats API directly from server-side code.

### 6.1 Team ID

Pirates team ID: `134`

### 6.2 Likely endpoints

Schedule:

```text
https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=134&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&hydrate=probablePitcher,linescore,team
```

Live game feed:

```text
https://statsapi.mlb.com/api/v1/game/{gamePk}/feed/live
```

Boxscore:

```text
https://statsapi.mlb.com/api/v1/game/{gamePk}/boxscore
```

Linescore:

```text
https://statsapi.mlb.com/api/v1/game/{gamePk}/linescore
```

Standings:

```text
https://statsapi.mlb.com/api/v1/standings?leagueId=104&season=2026&standingsTypes=regularSeason
```

Team stats:

```text
https://statsapi.mlb.com/api/v1/teams/134/stats?stats=season&group=hitting&season=2026
https://statsapi.mlb.com/api/v1/teams/134/stats?stats=season&group=pitching&season=2026
```

### 6.3 Caching

Use server-side caching/revalidation.

Suggested MVP cache behavior:

| Game state | Cache duration |
|---|---:|
| Live game | 30–60 seconds |
| Scheduled today | 5 minutes |
| Final/off day | 15–60 minutes |
| Historical recent games | 6–24 hours |

No database needed for MVP.

---

## 7. Design direction

### 7.1 Visual identity

Not official Pirates branding. Inspired by Pittsburgh baseball + traffic cone imagery.

Palette:

| Color | Use |
|---|---|
| Near-black | Background / main text contrast |
| Warm cream | Page background / cards |
| Safety orange | Cone status / accents |
| Gold/yellow | Pittsburgh nod / highlights |
| Asphalt gray | secondary UI |

Possible CSS variables:

```css
--black: #12100d;
--cream: #fff4df;
--orange: #ff6a00;
--gold: #f6c344;
--asphalt: #2b2b2b;
--muted: #7a7468;
```

### 7.2 Typography

Desired feel: sharp editorial + municipal sign system.

Potential choices:

- Headings: `Space Grotesk`, `Archivo Black`, or `Barlow Condensed`
- Body: `Inter`, `Public Sans`, or `IBM Plex Sans`
- Mono/stat labels: `IBM Plex Mono` or `Roboto Mono`

### 7.3 Components

- Large status badge
- Circular/vertical Cone Index meter
- Traffic report stat cards
- Recent game cards
- Tiny road-sign labels
- Subtle cone/roadwork iconography via CSS/SVG

### 7.4 Quality bar

The site should feel like a finished little object.

Requirements:

- Fully responsive
- No layout shift/jank
- Fast load
- Good empty/loading/error states
- Accessible contrast
- Looks good on mobile first
- No dependency on official logos

---

## 8. MVP content/copy draft

### Hero copy

```text
Hoist the Cone
The unofficial Buccos traffic report.
```

### Origin copy

```text
A weird shirt became a dugout bit. A dugout bit became a fan ritual. Now every Pirates rally comes with orange-plastic implications.

This is the unofficial traffic report for the cone era.
```

### Footer copy

```text
Unofficial fan project. Not affiliated with MLB or the Pittsburgh Pirates.
Data via MLB Stats API. Acquire cones legally.
```

### Status examples

```text
FULL HOIST
Pirates cleared traffic early and often. Cone fully authorized.
```

```text
CONE UP
Not a masterpiece, but the lane is open. Cone remains elevated.
```

```text
CONE WATCH
First pitch pending. Cone staged near the dugout.
```

```text
CONE DOWN
Traffic backed up. Cone lowered pending further review.
```

### Tone sample set for final selection

Use these examples to pick the final voice before build.

#### Dry municipal report

```text
FULL HOIST
The Buccos cleared nine runs of traffic with limited residual congestion. Cone deployment authorized.
```

```text
CONE DOWN
Loss recorded. North Shore traffic remains emotionally congested. Cone lowered until further notice.
```

#### Fan-sharp recap

```text
FULL HOIST
Pirates 9, Reds 4. Runs early, runs late, no need to overthink it. Hoist the damn cone.
```

```text
CONE DOWN
Pirates had chances, did not cash them, and the cone does not reward theoretical traffic.
```

#### Minimal absurdity

```text
FULL HOIST
Orange object ascendant. Conditions favorable.
```

```text
CONE DOWN
The cone observed the evidence and declined to rise.
```

Marcus recommendation: mostly **dry municipal report**, with occasional **fan-sharp recap** lines so it does not become sterile.

---

## 9. Non-goals for MVP

Do **not** build these yet:

- user accounts
- comments
- merch
- newsletter
- CMS/admin panel
- database-backed season archive
- social scraping
- gambling odds
- official logos/marks
- complicated charts
- AI-generated recaps at runtime
- push notifications

Keep it tight.

---

## 10. Nice-to-have later

Possible V2 ideas:

1. **Season Cone Ledger** — archive every game with cone grade.
2. **Share cards** — generate social images after wins.
3. **Skenes Day mode** — special styling on Paul Skenes starts.
4. **Bring a Cone?** — home game/weather/opponent/game-importance recommendation.
5. **Cone glossary** — funny fan lexicon.
6. **Cone map** — users submit legal cone sightings/photos, maybe too much moderation.
7. **PNC Park mode** — quick game-day card for people heading to the ballpark.
8. **Discord/Telegram alert** — “FULL HOIST” after big wins.
9. **Historical cone chart** — rolling 7-day cone momentum.
10. **Tiny API** — `/api/cone-status` returns current cone status as JSON.

---

## 11. Suggested tech stack

Assuming James wants easy Vercel deployment:

- Next.js / React
- TypeScript
- Tailwind CSS or CSS Modules
- Server-side MLB API fetches
- Vercel deployment
- No database for MVP
- Optional: `@vercel/analytics`

Repository could be:

```text
goleb1/hoist-the-cone
```

---

## 12. MVP acceptance criteria

Before launch, the site must:

- [ ] Load at a public Vercel URL
- [ ] Fetch real Pirates schedule/game data from MLB Stats API
- [ ] Show current/relevant game correctly
- [ ] Calculate a Cone Index from deterministic logic
- [ ] Show status label and explanation
- [ ] Show Traffic Report metrics when available
- [ ] Show last 5 completed games
- [ ] Handle off day, scheduled game, live game, final game, and API failure states
- [ ] Avoid official Pirates/MLB logos or misleading affiliation
- [ ] Look polished on mobile and desktop
- [ ] Have clean footer disclaimers
- [ ] Pass basic build/lint checks

---

## 13. Decisions from James review

1. **Tagline/team naming:** Prefer **Pirates** or **Buccos** over generic “Pittsburgh baseball.” Use safer wording only if needed.
2. **Legal posture:** Avoid official logos/marks and use a clear unofficial disclaimer. Team names may appear in normal fan-site context.
3. **Tone:** James wants concrete examples before locking this. Current recommendation is municipal-report base with occasional fan-sharp warmth.
4. **Origin placement:** Live status and traffic report are the focus. Origin belongs lower on the page in an expandable/info section.
5. **Loss state:** Need a loss label. “Sad Cone” is acceptable but not ideal. Current recommendation: **CONE DOWN**.
6. **Footer joke:** “Acquire cones legally” is approved as a subtle footer wink only.
7. **Player references:** No forced player references. Use names only when data/news context naturally calls for it.
8. **Product shape:** Dashboard-style microsite is the lean, with light recap/microsite elements.

---

## 14. Marcus recommendation

Build the MVP as a **dashboard-style microsite**:

1. Hero Cone Status
2. Current/latest game
3. Cone Index explanation
4. Traffic Report
5. Recent Hoists
6. Short origin/footer

This is the tightest version. It has enough live utility to be worth revisiting, enough joke to justify the domain, and enough design surface to make it feel special without turning into a giant unpaid sports media project.
