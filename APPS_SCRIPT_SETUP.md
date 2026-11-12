# Google Sheets + Apps Script setup

The connected Google spreadsheet is the source of truth. The local JavaScript data copy and the original import workbook have been removed from the site repository. To keep an offline backup, use **File → Download → Microsoft Excel (.xlsx)** in Google Sheets.

## 1. Restore a spreadsheet copy if needed

If setting up a new copy, import the downloaded `.xlsx` into Google Sheets. Keep the tab names and the first row of each data tab unchanged; you can edit and add rows below them.

## 2. Create the read-only Apps Script endpoint

1. In the spreadsheet, select **Extensions → Apps Script**.
2. Replace the starter code in `Code.gs` with the contents of `Japanese/apps-script/Code.gs` in this project, then save. This version also adds automatic IDs for new grammar and example rows.
3. Select **Deploy → New deployment**.
4. Choose **Web app**, set **Execute as** to your account, and set access to **Anyone** so the website can read the notebook data. Anyone with the endpoint can read these notes, so only put content here that you are comfortable sharing. The script only reads the spreadsheet; it has no write endpoint.
5. Deploy and copy the URL ending in `/exec`.

If the web app was already deployed, use **Deploy → Manage deployments**, edit the existing deployment, select **New version**, and deploy the update.

## Adding content in the spreadsheet

- Add a grammar row in `Grammar` and fill its name and content. When the `name` cell is entered, Apps Script fills an empty `patternId` such as `pattern-001`.
- Add an example row in `Examples` and fill its Japanese sentence and content. Apps Script fills an empty `exampleId` such as `example-102`.
- Keep IDs on existing rows unchanged. To link an example to a grammar item, copy its generated `patternId` into `patternIds`; separate multiple IDs with `|`.
- After pasting multiple rows, if any IDs remain blank, reload the sheet and select **日文文法筆記 → 補齊空白 ID**.
- For ordinary content edits, save the sheet and refresh the website. No Git push is needed.

## 3. Point the website to the endpoint

1. Open `Japanese/app-config.js`.
2. Set `window.JAPANESE_GRAMMAR_API_URL` to the copied `/exec` URL.
3. Publish the site. It will request the spreadsheet data when it opens. The browser uses the endpoint's read-only JSONP response to avoid cross-origin fetch restrictions. If the endpoint is blank or unavailable, the page displays a cloud-data error instead of loading a local copy.

After editing the spreadsheet, refresh the site to load the latest data. Keep the workbook and the local data backup in version control so the notebook can still be restored if the spreadsheet is changed accidentally.
