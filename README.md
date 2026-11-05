# Japanese Grammar Practice

A static Japanese grammar review site. It uses plain HTML, CSS, and browser JavaScript; no build step or package installation is required.

## Project structure

- `index.html` contains the existing んです study table, the site navigation, and shared visual styles.
- `Japanese/grammar/grammar-data.js` stores grammar categories, unique grammar entries, references, course examples, and verb conjugation rows.
- `Japanese/exercises/question-data.js` stores practice items and creates one connection question for each grammar entry.
- `Japanese/progress/learning-records.js` stores the initial correction deck and browser-local progress helpers.
- `Japanese/app.js` renders the conjugation tables, grammar lessons, practice sessions, and progress views.

Grammar entries use a single ID and can have multiple category tags, so a conditional pattern can appear in its form category and in the conditional index without being duplicated.

## Progress storage

Answer counts and questions answered incorrectly are stored in the current browser's `localStorage`. They do not sync between devices or browsers. The progress page can clear the saved records; the supplied initial correction deck remains available.

The page can be served as static files, including from GitHub Pages. The browser scripts are ordinary local script files and do not require a bundler.
