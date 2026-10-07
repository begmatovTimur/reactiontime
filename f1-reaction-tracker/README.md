# F1 Reaction Tracker

A Formula 1 start-lights reaction game built with Next.js (App Router) and TypeScript.

1. Register with your full name and one of the 11 teams on the 2026 grid.
2. Press **Space** (or tap the lights) to line up. Five red lights come on one per second, hold for a random 0.2–3 s, then go out. Press **Space** as soon as they do.
3. Three starts per driver. A jump start counts as 0.000 s; the average is always the total divided by 3.
4. The standings rank every driver by average. Press **Start a game** for the next driver.

Standings are saved in the browser's localStorage.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Production build: `npm run build && npm start`.

## Project layout

```
app/
  layout.tsx        fonts (Saira, JetBrains Mono) and page metadata
  page.tsx          renders <ReactionTracker />
  globals.css       all styling
components/
  ReactionTracker.tsx  screen state + standings storage
  Header.tsx           nav bar and session/clock bar
  SetupScreen.tsx      name + team registration
  RaceScreen.tsx       start lights, timing, jump starts
  StandingsScreen.tsx  classification table
  Icons.tsx            round team icon and driver avatar
lib/
  teams.ts          the 11 teams of 2026
  standings.ts      entry type, averaging, formatting, localStorage
```

Team icons are coloured placeholders. To use real logos, add image files to `public/` and render them in `components/Icons.tsx`.


Put one image per team in this folder. The app picks them up by itself.

Name each file after its team. Capitals, spaces and dashes don't matter:

McLaren          mclaren.png
Ferrari          ferrari.png
Red Bull Racing  red-bull-racing.png   (or redbull.png)
Mercedes         mercedes.png
Aston Martin     aston-martin.png
Alpine           alpine.png
Williams         williams.png
Racing Bulls     racing-bulls.png      (or rb.png, vcarb.png)
Audi             audi.png
Haas             haas.png
Cadillac         cadillac.png

Accepted formats: .png .jpg .jpeg .webp .svg .gif .avif
Square images with a transparent background look best.

Refresh the page after adding or replacing a file. No restart needed.
A team without a file shows a round icon in the team colour.
