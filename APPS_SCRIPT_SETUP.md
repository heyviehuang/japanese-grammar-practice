# Google Sheets + Apps Script setup

The notebook data is exported to `Japanese/grammar-notes-import.xlsx`. The workbook has seven tabs: `ReadMe`, `Categories`, `CategoryRules`, `Grammar`, `Examples`, `VerbForms`, and `Ndesu`.

## 1. Import the workbook

1. Upload `Japanese/grammar-notes-import.xlsx` to Google Drive.
2. Open it with Google Sheets and let Google convert it to a spreadsheet.
3. Keep the tab names and the first row of each data tab unchanged. You can edit and add the rows below them.

## 2. Create the read-only Apps Script endpoint

1. In the spreadsheet, select **Extensions → Apps Script**.
2. Replace the starter code in `Code.gs` with the contents of `Japanese/apps-script/Code.gs` in this project, then save.
3. Select **Deploy → New deployment**.
4. Choose **Web app**, set **Execute as** to your account, and set access to **Anyone** so the website can read the notebook data. Anyone with the endpoint can read these notes, so only put content here that you are comfortable sharing. The script only reads the spreadsheet; it has no write endpoint.
5. Deploy and copy the URL ending in `/exec`.

## 3. Point the website to the endpoint

1. Open `Japanese/app-config.js`.
2. Set `window.JAPANESE_GRAMMAR_API_URL` to the copied `/exec` URL.
3. Publish the site. It will request the spreadsheet data when it opens. The browser uses the endpoint's read-only JSONP response to avoid cross-origin fetch restrictions. If the endpoint is blank or temporarily unavailable, the bundled local data remains available as a fallback.

After editing the spreadsheet, refresh the site to load the latest data. Keep the workbook and the local data backup in version control so the notebook can still be restored if the spreadsheet is changed accidentally.
