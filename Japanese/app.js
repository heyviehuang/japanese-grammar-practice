(function () {
  'use strict';

  var grammar = window.JapaneseGrammarData;
  var questionData = window.JapaneseQuestionData;
  var progressData = window.JapaneseProgressData;
  var records = window.JapaneseLearningRecords;
  var page = 'ndesu';
  var selectedCategory = 'te-form';
  var selectedPattern = null;
  var selectedConjugation = 'te';
  var session = null;
  var nav = document.getElementById('app-navigation');
  var ndesuView = document.getElementById('ndesu-view');
  var reviewView = document.getElementById('review-view');
  var heading = document.getElementById('review-heading');
  var content = document.getElementById('review-content');
  var conjugationPanel = document.getElementById('conjugation-panel');
  var conjugationContent = document.getElementById('conjugation-content');
  var ndesuPanel = document.querySelector('#ndesu-view > .study-panel');
  var studyHeading = document.getElementById('study-heading');

  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function action(label, handler, className) {
    var button = element('button', className || 'btn', label);
    button.type = 'button'; button.addEventListener('click', handler); return button;
  }
  function category(id) { return grammar.categories.find(function (item) { return item.id === id; }); }
  function pattern(id) { return grammar.patterns.find(function (item) { return item.id === id; }); }
  function categoryMatches(item, id) {
    if (item.categoryId === id) return true;
    if (item.patternId) {
      var linked = pattern(item.patternId);
      return !!linked && (linked.category === id || linked.tags.indexOf(id) >= 0);
    }
    return false;
  }
  function setPage(next) {
    page = next;
    var isNdesu = next === 'ndesu';
    ndesuView.hidden = !isNdesu;
    reviewView.hidden = isNdesu;
    nav.querySelectorAll('[data-app-page]').forEach(function (button) {
      var active = button.dataset.appPage === next;
      button.setAttribute('aria-current', active ? 'page' : 'false');
      button.classList.toggle('active', active);
    });
    if (isNdesu) return;
    if (next === 'conjugation') renderConjugation();
    if (next === 'grammar') renderGrammar();
    if (next === 'exercise') renderExerciseSetup();
    if (next === 'progress') renderProgress();
  }
  nav.addEventListener('click', function (event) {
    var button = event.target.closest('[data-app-page]');
    if (button) { session = null; selectedPattern = null; setPage(button.dataset.appPage); }
  });

  document.getElementById('study-modes').addEventListener('click', function (event) {
    var button = event.target.closest('[data-study-mode]');
    if (!button) return;
    var conjugationMode = button.dataset.studyMode === 'conjugation';
    ndesuPanel.hidden = conjugationMode;
    conjugationPanel.hidden = !conjugationMode;
    studyHeading.textContent = conjugationMode ? '動詞變形練習' : '～んです 變形練習';
    document.querySelectorAll('[data-study-mode]').forEach(function (tab) {
      var active = tab === button;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (conjugationMode) renderConjugation();
  });

  function renderGrammar() {
    heading.textContent = '文法複習';
    content.innerHTML = '';
    var categories = element('div', 'review-categories');
    grammar.categories.forEach(function (item) {
      var button = action(item.label, function () { selectedCategory = item.id; selectedPattern = null; renderGrammar(); }, 'chip');
      button.setAttribute('aria-pressed', selectedCategory === item.id ? 'true' : 'false');
      categories.appendChild(button);
    });
    var allButton = action('全部', function () { selectedCategory = 'all'; selectedPattern = null; renderGrammar(); }, 'chip');
    allButton.setAttribute('aria-pressed', selectedCategory === 'all' ? 'true' : 'false');
    categories.appendChild(allButton);
    content.appendChild(categories);

    if (selectedPattern) {
      renderPatternDetail(selectedPattern);
      return;
    }
    var list = element('div', 'pattern-grid');
    grammar.patterns.filter(function (item) { return selectedCategory === 'all' || item.category === selectedCategory || item.tags.indexOf(selectedCategory) >= 0; }).forEach(function (item) {
      var card = action('', function () { selectedPattern = item.id; renderGrammar(); }, 'pattern-card');
      var title = element('strong', '', item.name);
      var group = category(item.category);
      card.appendChild(title);
      card.appendChild(element('span', 'pattern-group', group ? group.label : '條件句型'));
      card.appendChild(element('span', 'pattern-connect', item.connection));
      list.appendChild(card);
    });
    content.appendChild(list);
  }

  function addReferenceTable(parent, refRows) {
    var tableWrap = element('div', 'reference-scroll');
    var table = element('table', 'reference-table');
    var body = document.createElement('tbody');
    refRows.forEach(function (row) {
      var tr = document.createElement('tr'); tr.appendChild(element('th', '', row[0])); tr.appendChild(element('td', '', row[1])); body.appendChild(tr);
    });
    table.appendChild(body); tableWrap.appendChild(table); parent.appendChild(tableWrap);
  }
  function renderPatternDetail(id) {
    var item = pattern(id);
    if (!item) return;
    var panel = element('article', 'lesson-detail');
    panel.appendChild(action('← 返回文法列表', function () { selectedPattern = null; renderGrammar(); }, 'btn ghost back-button'));
    panel.appendChild(element('h2', '', item.name));
    var labels = [category(item.category)].concat(item.tags.map(category)).filter(Boolean);
    panel.appendChild(element('p', 'lesson-tags', labels.map(function (x) { return x.label; }).join(' ・ ')));
    panel.appendChild(element('h3', '', '接續規則'));
    panel.appendChild(element('p', 'lesson-connection', item.connection));
    panel.appendChild(element('h3', '', '中文解釋'));
    panel.appendChild(element('p', '', item.explanation));
    var referenceCategories = [item.category].concat(item.tags).filter(function (id, index, ids) { return ids.indexOf(id) === index; }).map(category).filter(Boolean);
    if (referenceCategories.some(function (ref) { return ref.reference.length; })) {
      panel.appendChild(element('h3', '', '變化參考表'));
      referenceCategories.forEach(function (ref) {
        if (!ref.reference.length) return;
        panel.appendChild(element('h4', 'reference-title', ref.label));
        addReferenceTable(panel, ref.reference);
      });
    }
    panel.appendChild(element('h3', '', '例句'));
    var examples = grammar.examples.filter(function (example) { return example.patternIds.indexOf(id) >= 0; });
    if (!examples.some(function (example) { return example.japanese === item.example; })) {
      examples = examples.concat([{ japanese: item.example, chinese: item.translation, patternIds: [id] }]);
    }
    var exampleList = element('div', 'example-list');
    examples.forEach(function (example) {
      var block = element('article', 'example-item');
      block.appendChild(element('p', 'example-japanese', example.japanese));
      block.appendChild(element('p', 'example-chinese', example.chinese));
      var tags = example.patternIds.map(pattern).filter(Boolean).map(function (x) { return x.name; });
      block.appendChild(element('small', 'example-tags', '文法標籤：' + tags.join('、')));
      exampleList.appendChild(block);
    });
    panel.appendChild(exampleList);
    var buttons = element('div', 'lesson-actions');
    buttons.appendChild(action('基礎練習', function () { startExercise({ scope: 'pattern', id: item.id, type: 'all', count: '5' }); setPage('exercise'); }, 'btn'));
    buttons.appendChild(action('綜合練習', function () { startExercise({ scope: 'category', id: item.category, type: 'all', count: '10' }); setPage('exercise'); }, 'btn ghost'));
    panel.appendChild(buttons);
    content.appendChild(panel);
  }

  function speakJapaneseList(readings) {
    if (!('speechSynthesis' in window) || !readings.length) return;
    window.speechSynthesis.cancel();
    var voices = window.speechSynthesis.getVoices().filter(function (voice) { return /^ja(-|$)/i.test(voice.lang); });
    voices.sort(function (a, b) {
      var score = function (voice) { return (voice.lang.toLowerCase() === 'ja-jp' ? 2 : 0) + (voice.localService ? 1 : 0); };
      return score(b) - score(a);
    });
    readings.forEach(function (reading) {
      var utterance = new SpeechSynthesisUtterance(reading);
      utterance.lang = 'ja-JP'; utterance.rate = 0.94; utterance.pitch = 1;
      if (voices.length) utterance.voice = voices[0];
      window.speechSynthesis.speak(utterance);
    });
  }
  function speakerButton(label, handler, className) {
    var button = element('button', className || 'speaker');
    button.type = 'button'; button.setAttribute('aria-label', label);
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="M16 9a5 5 0 0 1 0 6M18.5 6.5a9 9 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    button.addEventListener('click', handler); return button;
  }
  function renderConjugation() {
    conjugationContent.innerHTML = '';
    var tableWrap = element('div', 'table-scroll');
    var table = element('table', 'study-table');
    var colgroup = document.createElement('colgroup');
    for (var col = 0; col < 5; col++) colgroup.appendChild(document.createElement('col'));
    table.appendChild(colgroup);
    var forms = [
      { id: 'te', label: 'て形' }, { id: 'ta', label: 'た形' },
      { id: 'nai', label: 'ない形' }, { id: 'masu', label: 'ます形' }
    ];
    var thead = document.createElement('thead'), header = document.createElement('tr');
    var dictionaryHeader = document.createElement('th'); dictionaryHeader.scope = 'col'; dictionaryHeader.appendChild(document.createTextNode('辭書形'));
    dictionaryHeader.appendChild(speakerButton('朗讀辭書形整欄', function () { speakJapaneseList(grammar.verbConjugations.map(function (row) { return row.reading; })); }, 'column-speaker'));
    header.appendChild(dictionaryHeader);
    forms.forEach(function (kind) {
      var th = document.createElement('th'); th.scope = 'col'; th.appendChild(document.createTextNode(kind.label));
      th.appendChild(speakerButton('朗讀' + kind.label + '整欄', function () {
        var readings = [];
        grammar.verbConjugations.forEach(function (row) { readings.push(row.reading, row.forms[kind.id][1]); });
        speakJapaneseList(readings);
      }, 'column-speaker'));
      header.appendChild(th);
    });
    thead.appendChild(header); table.appendChild(thead);
    var tbody = document.createElement('tbody');
    grammar.verbConjugations.forEach(function (row) {
      var tr = document.createElement('tr'), base = document.createElement('td');
      base.appendChild(element('span', 'row-word', row.dictionary));
      base.appendChild(speakerButton('播放' + row.dictionary, function () { speakJapaneseList([row.reading]); }));
      tr.appendChild(base);
      forms.forEach(function (kind) {
        var td = document.createElement('td'), answer = row.forms[kind.id];
        var reveal = action('', function () {
          if (reveal.dataset.revealed === 'true') { speakJapaneseList([answer[1]]); return; }
          reveal.dataset.revealed = 'true'; reveal.textContent = answer[0];
          reveal.setAttribute('aria-label', '播放' + answer[0]);
          speakJapaneseList([row.reading, answer[1]]);
        }, 'cell-button');
        reveal.innerHTML = '<span class="masked">點一下顯示</span>';
        reveal.setAttribute('aria-label', '顯示並播放' + kind.label);
        td.appendChild(reveal); tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody); tableWrap.appendChild(table); conjugationContent.appendChild(tableWrap);
  }

  function renderExerciseSetup() {
    heading.textContent = '文法練習'; content.innerHTML = '';
    if (session) { renderQuestion(); return; }
    var form = element('form', 'exercise-setup');
    var scopeLabel = element('label', 'field-label', '練習範圍');
    var scope = element('select', 'field-control'); scope.id = 'exercise-scope';
    [['single','單一文法'],['category','接續分類'],['mixed','全部文法混合'],['mistakes','只練錯題']].forEach(function (opt) { var option = element('option','',opt[1]); option.value = opt[0]; scope.appendChild(option); });
    scopeLabel.appendChild(scope); form.appendChild(scopeLabel);
    var patternLabel = element('label', 'field-label', '文法項目');
    var patternSelect = element('select', 'field-control'); patternSelect.id = 'exercise-pattern';
    grammar.patterns.forEach(function (item) { var option = element('option','',item.name); option.value = item.id; patternSelect.appendChild(option); });
    patternLabel.appendChild(patternSelect); form.appendChild(patternLabel);
    var categoryLabel = element('label', 'field-label', '接續分類');
    var categorySelect = element('select', 'field-control'); categorySelect.id = 'exercise-category';
    grammar.categories.forEach(function (item) { var option = element('option','',item.label); option.value = item.id; categorySelect.appendChild(option); });
    categoryLabel.appendChild(categorySelect); form.appendChild(categoryLabel);
    var typeLabel = element('label', 'field-label', '題型');
    var typeSelect = element('select', 'field-control'); typeSelect.id = 'exercise-type';
    [['all','全部題型'],['choice','單選題'],['fill','填空題'],['transform','文法變化題'],['correction','錯誤訂正'],['translate','中翻日']].forEach(function (opt) { var option = element('option','',opt[1]); option.value = opt[0]; typeSelect.appendChild(option); });
    typeLabel.appendChild(typeSelect); form.appendChild(typeLabel);
    var countLabel = element('label', 'field-label', '題數');
    var countSelect = element('select', 'field-control'); countSelect.id = 'exercise-count';
    [['5','5 題'],['10','10 題'],['all','全部符合題目']].forEach(function (opt) { var option = element('option','',opt[1]); option.value = opt[0]; countSelect.appendChild(option); });
    countLabel.appendChild(countSelect); form.appendChild(countLabel);
    var start = element('button', 'btn', '隨機開始'); start.type = 'submit'; form.appendChild(start);
    scope.addEventListener('change', function () { patternLabel.hidden = scope.value !== 'single'; categoryLabel.hidden = scope.value !== 'category'; typeLabel.hidden = scope.value === 'mistakes'; });
    scope.dispatchEvent(new Event('change'));
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      startExercise({ scope: scope.value, id: scope.value === 'single' ? patternSelect.value : categorySelect.value, type: typeSelect.value, count: countSelect.value });
      renderQuestion();
    });
    content.appendChild(form);
    if (scope.value === 'mistakes') renderQuestion();
  }

  function allMistakeQuestions() {
    var staticQuestions = progressData.mistakes.map(function (mistake) {
      return { id: 'review-' + mistake.id, type: 'correction', patternId: null, categoryId: mistake.categoryId, mistakeId: mistake.id, prompt: '訂正錯誤答案：「' + mistake.wrong + '」', answer: mistake.correct, accepted: mistake.accepted || [], explanation: mistake.note };
    });
    progressData.notes.forEach(function (note) {
      staticQuestions.push({ id: 'review-' + note.id, type: 'correction', patternId: null, categoryId: 'nai-form', mistakeId: note.id, prompt: '訂正動詞「いる」（存在）的否定形：「いらない」', answer: 'いない', explanation: note.text });
    });
    var extra = records.read().reviewMistakes || [];
    extra.forEach(function (item) {
      if (!staticQuestions.some(function (q) { return q.id === item.id; })) staticQuestions.push(item);
    });
    return staticQuestions;
  }
  function availableQuestions(config) {
    var list = config.scope === 'mistakes' ? allMistakeQuestions() : questionData.questions.slice();
    if (config.scope === 'pattern') list = list.filter(function (q) { return q.patternId === config.id; });
    if (config.scope === 'category') list = list.filter(function (q) { return categoryMatches(q, config.id); });
    if (config.scope === 'mistakes') list = list.filter(function (q) { return q.type === 'correction'; });
    else if (config.type !== 'all') list = list.filter(function (q) { return q.type === config.type; });
    return list;
  }
  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i -= 1) { var j = Math.floor(Math.random() * (i + 1)); var temp = list[i]; list[i] = list[j]; list[j] = temp; }
    return list;
  }
  function startExercise(config) {
    var pool = shuffle(availableQuestions(config));
    var count = config.count === 'all' ? pool.length : Number(config.count || 10);
    session = { config: config, questions: pool.slice(0, count), index: 0, correct: 0, locked: false, answer: '' };
    if (!session.questions.length) session.empty = true;
  }
  function normalizeAnswer(value) { return String(value || '').replace(/[\s\u3000。、，,.！？!?]/g, '').toLowerCase(); }
  function checkAnswer(value) {
    if (!session || session.locked) return;
    var q = session.questions[session.index];
    var candidates = [q.answer].concat(q.accepted || []);
    var correct = candidates.some(function (answer) { return normalizeAnswer(answer) === normalizeAnswer(value); });
    session.locked = true; session.answer = value;
    if (correct) session.correct += 1;
    records.record(q, correct, value);
    renderQuestion(correct);
  }
  function renderQuestion(result) {
    heading.textContent = '文法練習'; content.innerHTML = '';
    if (!session || session.empty) {
      var emptyPanel = element('section', 'lesson-detail');
      emptyPanel.appendChild(element('h2', '', '目前沒有符合條件的題目'));
      emptyPanel.appendChild(element('p', '', '可以換一個練習範圍或題型。'));
      emptyPanel.appendChild(action('返回練習設定', function () { session = null; renderExerciseSetup(); }, 'btn'));
      content.appendChild(emptyPanel); return;
    }
    if (session.index >= session.questions.length) { renderExerciseResult(); return; }
    var q = session.questions[session.index];
    var panel = element('section', 'lesson-detail question-panel');
    var focusInput = null;
    var top = element('div', 'question-meta');
    top.appendChild(element('span', '', '第 ' + (session.index + 1) + ' / ' + session.questions.length + ' 題'));
    top.appendChild(element('span', '', ({ choice:'單選題', fill:'填空題', transform:'文法變化題', correction:'錯誤訂正', translate:'中翻日' })[q.type] || '練習題'));
    panel.appendChild(top); panel.appendChild(element('h2', 'question-prompt', q.prompt));
    if (!session.locked) {
      if (q.type === 'choice') {
        var choices = element('div', 'choice-list');
        shuffle(q.options.slice()).forEach(function (option) { choices.appendChild(action(option, function () { checkAnswer(option); }, 'choice-button')); });
        panel.appendChild(choices);
      } else {
        var answerForm = element('form', 'answer-form');
        var input = element('input', 'field-control answer-input'); input.type = 'text'; input.autocomplete = 'off'; input.setAttribute('aria-label', '輸入答案');
        var submit = element('button', 'btn', '確認答案'); submit.type = 'submit';
        answerForm.appendChild(input); answerForm.appendChild(submit);
        answerForm.addEventListener('submit', function (event) { event.preventDefault(); checkAnswer(input.value); });
        panel.appendChild(answerForm); focusInput = input;
      }
    } else {
      var correct = result === true;
      panel.appendChild(element('p', correct ? 'answer-feedback correct' : 'answer-feedback incorrect', correct ? '答對了' : '再複習一次'));
      if (!correct) panel.appendChild(element('p', 'your-answer', '你的答案：' + (session.answer || '（未作答）')));
      panel.appendChild(element('p', 'correct-answer', '正確答案：' + q.answer));
      panel.appendChild(element('p', 'answer-explanation', q.explanation || (pattern(q.patternId) || {}).explanation || ''));
      panel.appendChild(action(session.index === session.questions.length - 1 ? '查看結果' : '下一題', function () { session.index += 1; session.locked = false; renderQuestion(); }, 'btn'));
    }
    content.appendChild(panel);
    if (focusInput) focusInput.focus();
  }
  function renderExerciseResult() {
    var panel = element('section', 'lesson-detail result-panel');
    panel.appendChild(element('h2', '', '練習完成'));
    panel.appendChild(element('p', 'result-score', session.correct + ' / ' + session.questions.length + ' 答對'));
    panel.appendChild(action('再練一次', function () { var config = session.config; startExercise(config); renderQuestion(); }, 'btn'));
    panel.appendChild(action('練錯題', function () { startExercise({ scope: 'mistakes', type: 'all', count: 'all' }); renderQuestion(); }, 'btn ghost'));
    panel.appendChild(action('返回練習設定', function () { session = null; renderExerciseSetup(); }, 'btn ghost'));
    content.appendChild(panel);
  }

  function renderProgress() {
    heading.textContent = '學習紀錄'; content.innerHTML = '';
    var data = records.read();
    var summary = element('div', 'progress-summary');
    summary.appendChild(element('article', 'progress-card', '作答總數：' + data.total.attempts));
    summary.appendChild(element('article', 'progress-card', '答對：' + data.total.correct));
    var rate = data.total.attempts ? Math.round(data.total.correct / data.total.attempts * 100) : 0;
    summary.appendChild(element('article', 'progress-card', '正確率：' + rate + '%'));
    content.appendChild(summary);
    content.appendChild(element('p', 'progress-date', data.lastStudied ? '最近練習：' + new Date(data.lastStudied).toLocaleString() : '尚無練習紀錄。'));
    var table = element('table', 'progress-table');
    var head = document.createElement('thead'), trh = document.createElement('tr');
    ['文法', '作答', '答對', '答錯'].forEach(function (label) { trh.appendChild(element('th', '', label)); }); head.appendChild(trh); table.appendChild(head);
    var body = document.createElement('tbody');
    grammar.patterns.forEach(function (item) {
      var stat = data.patterns[item.id] || { attempts: 0, correct: 0, wrong: 0 };
      var row = document.createElement('tr');
      [item.name, stat.attempts, stat.correct, stat.wrong].forEach(function (value) { row.appendChild(element('td', '', String(value))); });
      body.appendChild(row);
    });
    table.appendChild(body);
    var wrap = element('div', 'reference-scroll'); wrap.appendChild(table); content.appendChild(wrap);
    content.appendChild(element('h2', '', '分類紀錄'));
    var categoryTable = element('table', 'progress-table');
    var categoryHead = document.createElement('thead'), categoryHeader = document.createElement('tr');
    ['接續分類', '作答', '答對', '答錯'].forEach(function (label) { categoryHeader.appendChild(element('th', '', label)); });
    categoryHead.appendChild(categoryHeader); categoryTable.appendChild(categoryHead);
    var categoryBody = document.createElement('tbody');
    grammar.categories.forEach(function (item) {
      var stat = data.categories[item.id] || { attempts: 0, correct: 0, wrong: 0 };
      var row = document.createElement('tr');
      [item.label, stat.attempts, stat.correct, stat.wrong].forEach(function (value) { row.appendChild(element('td', '', String(value))); });
      categoryBody.appendChild(row);
    });
    categoryTable.appendChild(categoryBody);
    var categoryWrap = element('div', 'reference-scroll'); categoryWrap.appendChild(categoryTable); content.appendChild(categoryWrap);
    content.appendChild(element('h2', '', '初始錯題紀錄'));
    var mistakeTable = element('table', 'progress-table');
    var mistakeHead = document.createElement('thead'), mistakeHeader = document.createElement('tr');
    ['原錯誤', '正確答案', '練習次數', '答對'].forEach(function (label) { mistakeHeader.appendChild(element('th', '', label)); });
    mistakeHead.appendChild(mistakeHeader); mistakeTable.appendChild(mistakeHead);
    var mistakeBody = document.createElement('tbody');
    progressData.mistakes.forEach(function (item) {
      var stat = data.mistakes[item.id] || { attempts: 0, correct: 0 };
      var row = document.createElement('tr');
      [item.wrong, item.correct, stat.attempts, stat.correct].forEach(function (value) { row.appendChild(element('td', '', String(value))); });
      mistakeBody.appendChild(row);
    });
    mistakeTable.appendChild(mistakeBody);
    var mistakeWrap = element('div', 'reference-scroll'); mistakeWrap.appendChild(mistakeTable); content.appendChild(mistakeWrap);
    progressData.notes.forEach(function (note) {
      var notePanel = element('aside', 'learning-note');
      notePanel.appendChild(element('h3', '', note.title));
      notePanel.appendChild(element('p', '', note.text));
      content.appendChild(notePanel);
    });
    var mistakeStats = element('p', 'progress-date', '答錯的練習題會加入錯題複習。'); content.appendChild(mistakeStats);
    content.appendChild(action('開始錯題複習', function () { startExercise({ scope: 'mistakes', type: 'all', count: 'all' }); setPage('exercise'); renderQuestion(); }, 'btn'));
    content.appendChild(action('清除學習紀錄', function () {
      if (window.confirm('要清除所有答題紀錄嗎？')) { records.write(records.empty()); renderProgress(); }
    }, 'btn ghost'));
  }

  setPage('ndesu');
})();
