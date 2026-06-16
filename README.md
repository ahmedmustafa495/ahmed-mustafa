# Free Trial Runner

A complete, dependency-free browser running game. The player gets a 60-second free trial to jump over obstacles, collect coins, and chase a high score.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Gameplay

- Press `Space`, `ArrowUp`, `W`, or tap/click the canvas to jump.
- Press `P` to pause or resume.
- Press `R` to restart.
- The best score is saved in `localStorage`.

## Trial download / install

The app includes a small trial app store panel:

- **Install trial app** uses the browser's Progressive Web App install prompt when supported.
- **Download trial file** exports a single-file HTML copy of the 60-second trial that can be opened offline.
- The downloadable build keeps the full game locked and only exposes the timed trial experience.
