# Japanese Grammar Notes

A static Japanese grammar notebook built with plain HTML, CSS, and browser JavaScript. No build step or package installation is required.

## Project structure

- `index.html` contains the navigation for word forms, grammar notes, and example notes.
- `Japanese/styles.css` contains the responsive dark theme and all page styles.
- `Japanese/apps-script/Code.gs` serves spreadsheet rows as read-only JSON; see `APPS_SCRIPT_SETUP.md` to deploy it.
- `Japanese/app-config.js` stores the Apps Script `/exec` URL; `Japanese/data-source.js` loads data from Apps Script.
- `Japanese/app.js` renders the grammar notebook, conjugation tables, filterable example library, and responsive sentence-building exercise.
- `Japanese/grammar-icon.png` is the transparent site icon.

The Google spreadsheet is the content source. `Examples` is the single source for sentences and translations; grammar entries and sentence-building modules link to examples by ID. Verb conjugations in `VerbForms` also provide the verb data used by the `んです` table, while `Ndesu` stores adjective and noun variations.

The site is a reading focused notebook for word forms, grammar points, and example sentences, with a one-question sentence-building exercise demo on the examples page.

The page can be served as static files, including from GitHub Pages.
