// ─────────────────────────────────────────────────────────────
// VJAI Paper Hub — Session Registration Webhook
// Paste this entire file into Google Apps Script, then deploy
// as a Web App (Execute as: Me, Who has access: Anyone).
//
// Each cycle gets its own sheet tab (named after cycle_id).
// Columns: Timestamp | Name | Email | Role | Affiliation | Cycle
// ─────────────────────────────────────────────────────────────

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // ← paste your Sheet ID

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheetName = data.cycle_id || "Unknown";

    // Get or create a tab for this cycle
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Header row
      sheet.appendRow(["Timestamp", "Name", "Email", "Role", "Affiliation", "Attendance", "Cycle Label"]);
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    }

    sheet.appendRow([
      data.registered_at || new Date().toISOString(),
      data.name || "",
      data.email || "",
      data.role || "",
      data.affiliation || "",
      data.attendance || "",
      data.cycle_label || data.cycle_id || "",
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: test by running doGet
function doGet() {
  return ContentService.createTextOutput("VJAI registration webhook is running.");
}
