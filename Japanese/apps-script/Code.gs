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
