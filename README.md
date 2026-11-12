# Japanese Grammar Notes

A static Japanese grammar notebook built with plain HTML, CSS, and browser JavaScript. No build step or package installation is required.

## Project structure

- `index.html` contains the navigation for word forms, grammar notes, and example notes.
- `Japanese/styles.css` contains the responsive dark theme and all page styles.
- `Japanese/apps-script/Code.gs` serves spreadsheet rows as read-only JSON; see `APPS_SCRIPT_SETUP.md` to deploy it.
- `Japanese/app-config.js` stores the Apps Script `/exec` URL; `Japanese/data-source.js` loads data from Apps Script.
- `Japanese/app.js` renders the grammar notebook, conjugation tables, and filterable example library.
- `Japanese/grammar-icon.png` is the transparent site icon.

The site is a reading focused notebook for word forms, grammar points, and example sentences. It has no quizzes or progress tracking.

The page can be served as static files, including from GitHub Pages.
