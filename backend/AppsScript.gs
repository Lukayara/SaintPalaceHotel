const SHEET_ID_PROPERTY = 'AVAILABILITY_SHEET_ID';
const ADMIN_CODES_PROPERTY = 'ADMIN_CODES';
const SHEET_NAME = 'Beschikbaarheid';
const HEADERS = ['Datum', 'Status', 'Bijgewerkt'];

/** Public, read-only availability feed and private-code admin login. */
function doGet(e) {
  const params = (e && e.parameter) || {};
  const action = params.action || 'read';
  let result;

  if (action === 'read') {
    result = { ok: true, days: readDays_() };
  } else if (action === 'auth') {
    result = { ok: isValidCode_(params.code || '') };
  } else {
    result = { ok: false, error: 'Unsupported action.' };
  }

  return respond_(result, params.callback || '');
}

/** Update all nights in [arrival, departure). The checkout day is not a night. */
function doPost(e) {
  let input;
  try {
    input = JSON.parse(e.postData.contents);
  } catch (error) {
    return json_({ ok: false, error: 'Invalid request.' });
  }

  if (!input || input.action !== 'set' || !isValidCode_(input.code || '')) {
    return json_({ ok: false, error: 'Unauthorized.' });
  }

  const start = parseIsoDate_(input.start);
  const end = parseIsoDate_(input.end);
  const status = input.status;
  if (!start || !end || end <= start || !['available', 'booked'].includes(status)) {
    return json_({ ok: false, error: 'Invalid dates or status.' });
  }
  const nights = Math.round((end - start) / 86400000);
  if (nights > 366) return json_({ ok: false, error: 'A schedule range cannot exceed one year.' });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return json_({ ok: false, error: 'Calendar is busy. Try again.' });
  try {
    const sheet = getSheet_();
    const values = sheet.getDataRange().getValues();
    const byDate = {};
    values.slice(1).forEach((row) => {
      const date = String(row[0] || '');
      if (date) byDate[date] = [date, String(row[1] || ''), row[2] || ''];
    });

    for (let offset = 0; offset < nights; offset += 1) {
      const date = formatIsoDate_(new Date(start.getTime() + offset * 86400000));
      byDate[date] = [date, status, new Date()];
    }

    const rows = Object.keys(byDate).sort().map((date) => byDate[date]);
    sheet.clearContents();
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    if (rows.length) sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
    sheet.setFrozenRows(1);
    return json_({ ok: true, days: readDays_() });
  } catch (error) {
    return json_({ ok: false, error: 'Could not update the calendar.' });
  } finally {
    lock.releaseLock();
  }
}

/** Run this once from the Apps Script editor while signed in as the owner. */
function setupAvailabilitySheet() {
  const properties = PropertiesService.getScriptProperties();
  const existingId = properties.getProperty(SHEET_ID_PROPERTY);
  if (existingId) {
    const existing = SpreadsheetApp.openById(existingId);
    Logger.log('Availability sheet is ready: ' + existing.getUrl());
    return existing.getUrl();
  }

  const spreadsheet = SpreadsheetApp.create('Palace Hotel Zandvoort — beschikbaarheid');
  const sheet = spreadsheet.getSheets()[0];
  sheet.setName(SHEET_NAME);
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  sheet.getRange('A:A').setNumberFormat('@');
  properties.setProperty(SHEET_ID_PROPERTY, spreadsheet.getId());
  Logger.log('Availability sheet is ready: ' + spreadsheet.getUrl());
  return spreadsheet.getUrl();
}

function readDays_() {
  const values = getSheet_().getDataRange().getValues();
  return values.slice(1).filter((row) => row[0] && row[1]).map((row) => ({
    date: String(row[0]),
    status: String(row[1]),
  }));
}

function getSheet_() {
  const id = PropertiesService.getScriptProperties().getProperty(SHEET_ID_PROPERTY);
  if (!id) throw new Error('Run setupAvailabilitySheet() first.');
  return SpreadsheetApp.openById(id).getSheetByName(SHEET_NAME);
}

function isValidCode_(candidate) {
  const savedCodes = PropertiesService.getScriptProperties().getProperty(ADMIN_CODES_PROPERTY) || '';
  return savedCodes.split(',').map((code) => code.trim()).filter(Boolean).some((code) => code === String(candidate));
}

function parseIsoDate_(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const date = new Date(String(value) + 'T00:00:00.000Z');
  return Number.isNaN(date.getTime()) || formatIsoDate_(date) !== value ? null : date;
}

function formatIsoDate_(date) {
  return Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function respond_(data, callback) {
  const safeCallback = /^[A-Za-z_$][\w$]{0,80}$/.test(callback) ? callback : '';
  if (safeCallback) {
    return ContentService.createTextOutput(safeCallback + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_(data);
}
