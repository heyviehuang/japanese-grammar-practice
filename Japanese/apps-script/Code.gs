/**
 * Read-only JSON endpoint for the Japanese grammar notebook.
 * Bind this script to the imported spreadsheet and deploy as a web app.
 */
function doGet(request) {
  var data = readNotebookData_();
  var prefix = request && request.parameter ? request.parameter.prefix : '';
  if (prefix) {
    if (!/^JapaneseGrammarCallback_[A-Za-z0-9_]+$/.test(prefix)) {
      throw new Error('Invalid JSONP callback name.');
    }
    return ContentService
      .createTextOutput(prefix + '(' + JSON.stringify(data) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('日文文法筆記')
    .addItem('補齊空白 ID', 'fillMissingIds')
    .addToUi();
}

/** Assign a stable ID when a new grammar or example is entered. */
function onEdit(event) {
  if (!event || !event.range || event.range.getRow() < 2) return;

  var sheet = event.range.getSheet();
  var config = idConfigForSheet_(sheet.getName());
  if (!config) return;

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var contentColumn = headers.indexOf(config.contentHeader) + 1;
  if (!contentColumn) return;
  var firstEditedColumn = event.range.getColumn();
  var lastEditedColumn = firstEditedColumn + event.range.getNumColumns() - 1;
  if (contentColumn < firstEditedColumn || contentColumn > lastEditedColumn) return;

  assignMissingIds_(sheet, config);
}

/** A menu action for bulk pastes that skipped the normal edit event. */
function fillMissingIds() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  assignMissingIds_(spreadsheet.getSheetByName('Grammar'), idConfigForSheet_('Grammar'));
  assignMissingIds_(spreadsheet.getSheetByName('Examples'), idConfigForSheet_('Examples'));
  spreadsheet.toast('已補齊文法與例句 ID。', '日文文法筆記', 5);
}

function idConfigForSheet_(sheetName) {
  if (sheetName === 'Grammar') return { idHeader: 'patternId', contentHeader: 'name', prefix: 'pattern' };
  if (sheetName === 'Examples') return { idHeader: 'exampleId', contentHeader: 'japanese', prefix: 'example' };
  return null;
}

function assignMissingIds_(sheet, config) {
  if (!sheet || !config) return;
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  if (lastRow < 2 || lastColumn < 1) return;

  var headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
  var idColumn = headers.indexOf(config.idHeader) + 1;
  var contentColumn = headers.indexOf(config.contentHeader) + 1;
  if (!idColumn || !contentColumn) return;

  var rowCount = lastRow - 1;
  var ids = sheet.getRange(2, idColumn, rowCount, 1).getDisplayValues();
  var content = sheet.getRange(2, contentColumn, rowCount, 1).getDisplayValues();
  var matcher = new RegExp('^' + config.prefix + '-(\\d+)$');
  var nextNumber = 0;
  ids.forEach(function (cell) {
    var match = cell[0].match(matcher);
    if (match) nextNumber = Math.max(nextNumber, Number(match[1]));
  });

  var changed = false;
  for (var index = 0; index < rowCount; index++) {
    if (content[index][0].trim() && !ids[index][0].trim()) {
      nextNumber += 1;
      ids[index][0] = config.prefix + '-' + ('000' + nextNumber).slice(-3);
      changed = true;
    }
  }
  if (changed) sheet.getRange(2, idColumn, rowCount, 1).setValues(ids);
}

function readNotebookData_() {
  var categories = readRows_('Categories').map(function (row) {
    return {
      id: row.categoryId,
      label: row.label,
      description: row.description,
      reference: []
    };
  });

  readRows_('CategoryRules').forEach(function (row) {
    var category = categories.filter(function (item) { return item.id === row.categoryId; })[0];
    if (category) category.reference.push([row.ruleName, row.rule]);
  });

  var patterns = readRows_('Grammar').map(function (row) {
    return {
      id: row.patternId,
      name: row.name,
      category: row.categoryId,
      tags: splitList_(row.additionalCategoryIds),
      connection: row.connection,
      explanation: row.explanation,
      notes: splitLines_(row.notes),
      example: row.example,
      translation: row.translation
    };
  });

  var examples = readRows_('Examples').map(function (row) {
    return {
      japanese: row.japanese,
      chinese: row.chinese,
      patternIds: splitList_(row.patternIds),
      tags: splitList_(row.tags),
      note: row.note,
      source: row.source
    };
  });

  var formNames = ['masu', 'te', 'ta', 'nai', 'potential', 'volitional', 'conditional', 'imperative'];
  var verbConjugations = readRows_('VerbForms').map(function (row) {
    var forms = {};
    formNames.forEach(function (name) {
      forms[name] = [row[name], row[name + 'Reading']];
    });
    return {
      dictionary: row.dictionary,
      reading: row.reading,
      type: row.type,
      forms: forms
    };
  });

  var ndesuGroups = [];
  var groupsById = {};
  readRows_('Ndesu').forEach(function (row) {
    if (!groupsById[row.categoryId]) {
      groupsById[row.categoryId] = { id: row.categoryId, label: row.category, rows: [] };
      ndesuGroups.push(groupsById[row.categoryId]);
    }
    groupsById[row.categoryId].rows.push([
      row.masu,
      removeEnding_(row.ndesu, 'んです'),
      removeEnding_(row.naiNdesu, 'んです'),
      removeEnding_(row.taNdesu, 'んです'),
      removeEnding_(row.nakattaNdesu, 'んです'),
      row.masu,
      row.reading
    ]);
  });

  return {
    categories: categories,
    patterns: patterns,
    examples: examples,
    verbConjugations: verbConjugations,
    ndesuGroups: ndesuGroups
  };
}

function readRows_(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) throw new Error('Missing sheet: ' + sheetName);

  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];
  var headers = values.shift();
  return values.filter(function (cells) {
    return cells.some(function (value) { return value !== ''; });
  }).map(function (cells) {
    var row = {};
    headers.forEach(function (header, index) { row[header] = cells[index] || ''; });
    return row;
  });
}

function splitList_(value) {
  return String(value || '').split('|').map(function (item) { return item.trim(); }).filter(Boolean);
}

function splitLines_(value) {
  return String(value || '').split(/\r?\n/).map(function (item) { return item.trim(); }).filter(Boolean);
}

function removeEnding_(value, ending) {
  var text = String(value || '');
  return text.slice(-ending.length) === ending ? text.slice(0, -ending.length) : text;
}
