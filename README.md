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
