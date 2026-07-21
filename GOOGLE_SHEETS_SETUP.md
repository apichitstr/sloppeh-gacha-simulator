# Google Sheets Logging Setup

This project can send usage events to Google Sheets through Google Apps Script.

## 1) Create the target sheet

1. Create a new Google Sheet.
2. Rename the first sheet to `events`.
3. In row 1, add these headers:

- `ts`
- `event`
- `sessionId`
- `page`
- `drawCount`
- `pearlBalance`
- `totalTopupBaht`
- `blissPoints`
- `currencyCode`
- `imRich`
- `userAgent`
- `details_json`

## 2) Create Apps Script Web App

1. Open the sheet.
2. Go to Extensions > Apps Script.
3. Replace script content with:

```javascript
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("events") || ss.insertSheet("events");

    var body = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    var payload = JSON.parse(body);

    var known = {
      ts: payload.ts || "",
      event: payload.event || "",
      sessionId: payload.sessionId || "",
      page: payload.page || "",
      drawCount: Number(payload.drawCount || 0),
      pearlBalance: Number(payload.pearlBalance || 0),
      totalTopupBaht: Number(payload.totalTopupBaht || 0),
      blissPoints: Number(payload.blissPoints || 0),
      currencyCode: payload.currencyCode || "",
      imRich: String(Boolean(payload.imRich)),
      userAgent: payload.userAgent || ""
    };

    var details = {
      referrer: payload.referrer || "",
      drawsRequested: payload.drawsRequested,
      legendaryInBatch: payload.legendaryInBatch,
      epicInBatch: payload.epicInBatch,
      rareInBatch: payload.rareInBatch,
      lastResult: payload.lastResult || "",
      blissPointsAfter: payload.blissPointsAfter,
      packs: payload.packs,
      topupBaht: payload.topupBaht,
      topupPearl: payload.topupPearl,
      reason: payload.reason || "",
      enabled: payload.enabled
    };

    sheet.appendRow([
      known.ts,
      known.event,
      known.sessionId,
      known.page,
      known.drawCount,
      known.pearlBalance,
      known.totalTopupBaht,
      known.blissPoints,
      known.currencyCode,
      known.imRich,
      known.userAgent,
      JSON.stringify(details)
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

4. Deploy > New deployment.
5. Type: Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Deploy and copy the Web App URL.

## 3) Put URL into the app

Open `app.js` and set this value:

```javascript
const ANALYTICS_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
```

## 4) Events that will be recorded

- `session_start`
- `draw`
- `topup`
- `reset`
- `currency_change`
- `rich_toggle`

## Notes

- The client sends requests in fire-and-forget mode (`no-cors`), so gameplay is never blocked by network delay.
- Avoid logging sensitive personal data.
