# Google Sheets + Apps Script setup

The connected Google spreadsheet is the source of truth. The local JavaScript data copy and the original import workbook have been removed from the site repository. To keep an offline backup, use **File → Download → Microsoft Excel (.xlsx)** in Google Sheets.

## 1. Restore a spreadsheet copy if needed

If setting up a new copy, import the downloaded `.xlsx` into Google Sheets. Keep the tab names and the first row of each data tab unchanged; you can edit and add rows below them.

## 2. Create the read-only Apps Script endpoint

1. In the spreadsheet, select **Extensions → Apps Script**.
2. Replace the starter code in `Code.gs` with the contents of `Japanese/apps-script/Code.gs` in this project, then save. This version also returns each `exampleId` and links any sentence modules to that example.
3. Select **Deploy → New deployment**.
4. Choose **Web app**, set **Execute as** to your account, and set access to **Anyone** so the website can read the notebook data. Anyone with the endpoint can read these notes, so only put content here that you are comfortable sharing. The script only reads the spreadsheet; it has no write endpoint.
5. Deploy and copy the URL ending in `/exec`.

If the web app was already deployed, use **Deploy → Manage deployments**, edit the existing deployment, select **New version**, and deploy the update.

## Adding content in the spreadsheet

- Add a grammar row in `Grammar` and fill its name and content. When the `name` cell is entered, Apps Script fills an empty `patternId` such as `pattern-001`. Grammar rows contain rules and explanations; keep example sentences in `Examples` only.
- When a grammar item has an example, add that sentence once in `Examples` and put the grammar row's `patternId` in its `patternIds` cell. Multiple grammar IDs can point to the same example.
- Add an example row in `Examples` and fill its Japanese sentence and content. Apps Script fills an empty `exampleId` such as `example-102`.
- Keep each Japanese sentence in one `Examples` row. Link it to multiple grammar items by separating their IDs in `patternIds` with `|`; the example list combines matching tags and notes instead of showing duplicate sentences.
- Add or edit verb conjugations in `VerbForms`. Include a `meaning` column for the Chinese meaning shown in the last column of the verb conjugation table. To include a verb in the `んです` table, set `ndesuCategory` to `verb`; use `special` for special rows such as ある. Its `んです` forms are generated from these shared conjugations. `Ndesu` is for adjective and noun entries only.
- Add a `SentenceExerciseModules` tab with these headers: `exampleId`, `moduleId`, `moduleLabel`, `moduleOrder`, `correctOption`, `options`. Add one row per language module and use the existing example's `exampleId` to link it. Put module choices in `options`, separated by `|`. The exercise reads its prompt, answer, translation, and grammar tags from that example row, so do not copy the sentence into the module sheet.
- Example module rows linked to the existing `example-002` sentence in `Examples`:

  | exampleId | moduleId | moduleLabel | moduleOrder | correctOption | options |
  | --- | --- | --- | --- | --- | --- |
  | example-002 | te-form | 動詞て形 | 1 | 疲れていて | 疲れていて\|疲れて\|疲れていた |
  | example-002 | grammar | 文法接續 | 2 | も | も\|から\|が |
  | example-002 | verb | 動詞變化 | 3 | 勉強します。 | 勉強します。\|勉強しました。\|勉強しています。 |
- To add another sentence to the optional word-piece assembly practice:
  1. Add its Japanese sentence and Chinese prompt once in `Examples`. Keep the generated `exampleId`.
  2. Add one row per sentence piece in `SentenceExerciseModules`, repeating that `exampleId` on every row. Use `moduleOrder` to set the assembly order and a distinct `moduleId` for each piece in that exercise.
  3. Enter the correct piece in `correctOption` and include that exact text among the `options` separated by `|`. The correct pieces in order should form the Japanese sentence in `Examples`.
  4. Save the sheet and refresh the website. Its example card will show the heart icon for opening the word-piece assembly exercise.
- Keep IDs on existing rows unchanged. To link an example to a grammar item, copy its generated `patternId` into `patternIds`; separate multiple IDs with `|`. Enter the sentence and translation only once in `Examples`.
- After pasting multiple rows, if any IDs remain blank, reload the sheet and select **日文文法筆記 → 補齊空白 ID**. Repeat the same `exampleId` in each module row belonging to that sentence. Examples without module rows stay in the example list and do not show the practice icon.
- For ordinary content edits, save the sheet and refresh the website. No Git push is needed.

## 3. Point the website to the endpoint

1. Open `Japanese/app-config.js`.
2. Set `window.JAPANESE_GRAMMAR_API_URL` to the copied `/exec` URL.
3. Publish the site. It will request the spreadsheet data when it opens. The browser uses the endpoint's read-only JSONP response to avoid cross-origin fetch restrictions. If the endpoint is blank or unavailable, the page displays a cloud-data error instead of loading a local copy.

The site includes a built-in demonstration linked to `example-002` until module rows are available from Apps Script. To load exercise modules from Sheets, add the `SentenceExerciseModules` tab and deploy the updated `Code.gs` as a **New version** using **Deploy → Manage deployments**. The existing `/exec` URL normally stays the same. After editing the spreadsheet, refresh the site to load the latest data.
