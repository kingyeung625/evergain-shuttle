# Ever Gain Plaza Shuttle - Next Bus

Shows the next Ever Gain Plaza shuttle departure based on Hong Kong time (`Asia/Hong_Kong`).

## Features

- Kwai Fong MTR ↔ Ever Gain Plaza (Mon-Fri + Sat)
- Ever Gain Plaza → Mei Foo & Lai King MTR (Mon-Fri evenings)
- Mei Foo MTR → Ever Gain Plaza (Mon-Fri mornings)
- Built-in Hong Kong public holidays for 2026-2027
- Peak-hour ~5 minute frequency for Kwai Fong weekday service

## Local preview

Open `index.html` in a browser, or run:

```bash
npx serve .
```

## Deploy to GitHub Pages

1. Create a GitHub repository (suggested name: `evergain-shuttle`)
2. Push this folder:

```bash
git init
git add .
git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m "Add Ever Gain Plaza shuttle next bus page"
git branch -M main
git remote add origin https://github.com/<username>/evergain-shuttle.git
git push -u origin main
```

3. In the repo: **Settings** → **Pages**
4. Source: **Deploy from a branch**
5. Branch: `main`, folder: `/ (root)`
6. After 1-2 minutes, visit `https://<username>.github.io/evergain-shuttle/`

## Project structure

```
├── index.html
├── css/style.css
├── js/
│   ├── timetable.js
│   ├── holidays.js
│   ├── nextBus.js
│   └── app.js
└── README.md
```

## Data source

Timetable data from the property PDF (updated 12 Oct 2023). Update `js/timetable.js` if the PDF changes. Update `js/holidays.js` from 2028 onward.

## Disclaimer

Departure times may change due to traffic and capacity. This page is for reference only.