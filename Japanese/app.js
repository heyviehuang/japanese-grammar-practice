(function () {
  'use strict';

  try { window.localStorage.removeItem('japanese-grammar-learning-records-v1'); } catch (error) {}

  var grammar = null;
  var currentPage = 'ndesu';
  var selectedCategory = 'te-form';
  var selectedExampleCategory = 'all';
  var selectedPattern = null;
  var selectedVerbType = 'all';
  var selectedNdesuGroup = 'verb';
  var nav = document.getElementById('app-navigation');
  var ndesuView = document.getElementById('ndesu-view');
  var reviewView = document.getElementById('review-view');
  var heading = document.getElementById('review-heading');
  var content = document.getElementById('review-content');
  var conjugationPanel = document.getElementById('conjugation-panel');
  var conjugationContent = document.getElementById('conjugation-content');
  var ndesuPanel = document.querySelector('#ndesu-view > .study-panel');
  var studyHeading = document.getElementById('study-heading');
  var dataStatus = document.getElementById('data-status');

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
  function setPage(next) {
    currentPage = next;
    var isNdesu = next === 'ndesu';
    ndesuView.hidden = !isNdesu;
    reviewView.hidden = isNdesu;
    nav.querySelectorAll('[data-app-page]').forEach(function (button) {
      var active = button.dataset.appPage === next;
      button.setAttribute('aria-current', active ? 'page' : 'false');
      button.classList.toggle('active', active);
    });
    if (isNdesu) return;
    if (!grammar) return;
    if (next === 'grammar') renderGrammar();
    if (next === 'examples') renderExamples();
  }
  nav.addEventListener('click', function (event) {
    var button = event.target.closest('[data-app-page]');
    if (button) { selectedPattern = null; setPage(button.dataset.appPage); }
  });

  document.getElementById('study-modes').addEventListener('click', function (event) {
    var button = event.target.closest('[data-study-mode]');
    if (!button) return;
    var conjugationMode = button.dataset.studyMode === 'conjugation';
    ndesuPanel.hidden = conjugationMode;
    conjugationPanel.hidden = !conjugationMode;
    studyHeading.textContent = conjugationMode ? '動詞基礎變化' : '～んです變化';
    document.querySelectorAll('[data-study-mode]').forEach(function (tab) {
      var active = tab === button;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (!grammar) return;
    if (conjugationMode) renderConjugation();
    else renderNdesu();
  });

  function renderGrammar() {
    heading.textContent = '文法筆記';
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

  function allExamples() {
    var items = grammar.examples.map(function (example) {
      return Object.assign({}, example, { patternIds: (example.patternIds || []).slice() });
    });
    grammar.patterns.forEach(function (item) {
      var existing = items.find(function (example) { return example.japanese === item.example; });
      if (existing) {
        if (existing.patternIds.indexOf(item.id) < 0) existing.patternIds.push(item.id);
      } else {
        items.push({ japanese: item.example, chinese: item.translation, patternIds: [item.id] });
      }
    });
    return items;
  }

  function makeExampleCard(example) {
    var block = element('article', 'example-item');
    block.appendChild(element('p', 'example-japanese', example.japanese));
    block.appendChild(element('p', 'example-chinese', example.chinese));
    var tags = (example.patternIds || []).map(pattern).filter(Boolean).map(function (item) { return item.name; });
    tags = tags.concat(example.tags || []).filter(function (tag, index, values) { return values.indexOf(tag) === index; });
    if (tags.length) block.appendChild(element('small', 'example-tags', '標籤：' + tags.join('、')));
    if (example.note) block.appendChild(element('p', 'example-note', example.note));
    if (example.source) block.appendChild(element('small', 'example-source', example.source));
    return block;
  }

  function renderExamples() {
    heading.textContent = '課堂與生活例句';
    content.innerHTML = '';
    var filters = [{ id: 'all', label: '全部' }, { id: 'life', label: '生活造句' }, { id: 'ndesu', label: 'んです' }].concat(
      grammar.categories.map(function (item) { return { id: item.id, label: item.label }; })
    );
    var tabs = element('div', 'review-categories');
    filters.forEach(function (filter) {
      var button = action(filter.label, function () { selectedExampleCategory = filter.id; renderExamples(); }, 'chip');
      button.setAttribute('aria-pressed', selectedExampleCategory === filter.id ? 'true' : 'false');
      tabs.appendChild(button);
    });
    content.appendChild(tabs);
    var items = allExamples().filter(function (example) {
      if (selectedExampleCategory === 'all') return true;
      if (selectedExampleCategory === 'life') return (example.tags || []).some(function (tag) { return tag.indexOf('生活造句') >= 0 || tag.indexOf('生活日文') >= 0; });
      if (selectedExampleCategory === 'ndesu') return (example.tags || []).indexOf('んです') >= 0;
      return (example.patternIds || []).some(function (id) {
        var item = pattern(id);
        return item && (item.category === selectedExampleCategory || item.tags.indexOf(selectedExampleCategory) >= 0);
      });
    });
    var list = element('div', 'example-list');
    items.forEach(function (example) { list.appendChild(makeExampleCard(example)); });
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
    if (item.notes && item.notes.length) {
      panel.appendChild(element('h3', '', '補充與容易混淆處'));
      var notes = element('ul', 'lesson-notes');
      item.notes.forEach(function (note) { notes.appendChild(element('li', '', note)); });
      panel.appendChild(notes);
    }
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
    var examples = allExamples().filter(function (example) { return example.patternIds.indexOf(id) >= 0; });
    var exampleList = element('div', 'example-list');
    examples.forEach(function (example) { exampleList.appendChild(makeExampleCard(example)); });
    panel.appendChild(exampleList);
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
  function renderNdesu() {
    var groups = grammar.ndesuGroups || [];
    var tabs = document.getElementById('categories');
    var tbody = document.getElementById('tableRows');
    tabs.innerHTML = '';
    tbody.innerHTML = '';
    groups.forEach(function (group) {
      var button = action(group.label, function () { selectedNdesuGroup = group.id; renderNdesu(); }, 'chip');
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', selectedNdesuGroup === group.id ? 'true' : 'false');
      button.setAttribute('aria-pressed', selectedNdesuGroup === group.id ? 'true' : 'false');
      tabs.appendChild(button);
    });
    var active = groups.find(function (group) { return group.id === selectedNdesuGroup; }) || groups[0];
    if (!active) return;
    selectedNdesuGroup = active.id;
    active.rows.forEach(function (row) {
      var tr = document.createElement('tr'), base = document.createElement('td');
      base.appendChild(element('span', 'row-word', row[6]));
      base.appendChild(speakerButton('播放' + row[6], function () { speakJapaneseList([row[6]]); }));
      tr.appendChild(base);
      for (var index = 1; index <= 4; index++) {
        var td = document.createElement('td');
        var answer = row[index] + 'んです';
        var reveal = element('button', 'cell-button');
        reveal.type = 'button';
        reveal.innerHTML = '<span class="masked">點一下顯示</span>';
        reveal.setAttribute('aria-label', '顯示並播放變形');
        reveal.addEventListener('click', function (target, button, dictionaryReading) {
          return function () {
            if (button.dataset.revealed === 'true') { speakJapaneseList([target]); return; }
            button.dataset.revealed = 'true';
            button.textContent = target;
            button.setAttribute('aria-label', '播放' + target);
            speakJapaneseList([dictionaryReading, target]);
          };
        }(answer, reveal, row[6]));
        td.appendChild(reveal);
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    });
  }
  document.querySelectorAll('#ndesu-view [data-column]').forEach(function (control) {
    control.addEventListener('click', function () {
      var column = Number(control.dataset.column), group = grammar && (grammar.ndesuGroups || []).find(function (item) { return item.id === selectedNdesuGroup; });
      if (!group) return;
      var readings = [];
      group.rows.forEach(function (row) {
        if (column === 0) readings.push(row[6]);
        else readings.push(row[6], row[column] + 'んです');
      });
      speakJapaneseList(readings);
    });
  });
  function renderConjugation() {
    conjugationContent.innerHTML = '';
    var typeFilters = [
      { id: 'all', label: '全部' }, { id: 'godan', label: '五段動詞' },
      { id: 'ichidan', label: '一段動詞' }, { id: 'irregular', label: '不規則・特例' }
    ];
    var filterNav = element('nav', 'category-tabs conjugation-filters');
    filterNav.setAttribute('aria-label', '動詞類型');
    typeFilters.forEach(function (filter) {
      var button = action(filter.label, function () { selectedVerbType = filter.id; renderConjugation(); }, 'chip');
      button.setAttribute('aria-pressed', selectedVerbType === filter.id ? 'true' : 'false');
      filterNav.appendChild(button);
    });
    conjugationContent.appendChild(filterNav);
    var rows = grammar.verbConjugations.filter(function (row) {
      if (selectedVerbType === 'all') return true;
      if (selectedVerbType === 'irregular') return row.type === 'irregular' || row.type === 'special';
      return row.type === selectedVerbType;
    });
    var tableWrap = element('div', 'table-scroll');
    var scrollTools = element('div', 'table-scroll-tools');
    scrollTools.appendChild(element('span', 'table-scroll-label', '表格可左右移動'));
    var scrollButtons = element('div', 'table-scroll-buttons');
    var moveLeft = action('←', function () { tableWrap.scrollBy({ left: -tableWrap.clientWidth * 0.75, behavior: 'smooth' }); }, 'btn ghost scroll-control');
    var moveRight = action('→', function () { tableWrap.scrollBy({ left: tableWrap.clientWidth * 0.75, behavior: 'smooth' }); }, 'btn ghost scroll-control');
    moveLeft.setAttribute('aria-label', '表格向左移動');
    moveRight.setAttribute('aria-label', '表格向右移動');
    scrollButtons.appendChild(moveLeft);
    scrollButtons.appendChild(moveRight);
    scrollTools.appendChild(scrollButtons);
    conjugationContent.appendChild(scrollTools);
    var table = element('table', 'study-table');
    var colgroup = document.createElement('colgroup');
    for (var col = 0; col < 9; col++) colgroup.appendChild(document.createElement('col'));
    table.appendChild(colgroup);
    var forms = [
      { id: 'masu', label: 'ます形' }, { id: 'te', label: 'て形' },
      { id: 'ta', label: 'た形' }, { id: 'nai', label: 'ない形' },
      { id: 'potential', label: '可能形' }, { id: 'volitional', label: '意向形' },
      { id: 'conditional', label: '条件形（ば）' }
    ];
    forms.push({ id: 'imperative', label: '命令形' });
    var thead = document.createElement('thead'), header = document.createElement('tr');
    var dictionaryHeader = document.createElement('th'); dictionaryHeader.scope = 'col'; dictionaryHeader.appendChild(document.createTextNode('辭書形'));
    dictionaryHeader.appendChild(speakerButton('朗讀辭書形整欄', function () { speakJapaneseList(rows.map(function (row) { return row.reading; })); }, 'column-speaker'));
    header.appendChild(dictionaryHeader);
    forms.forEach(function (kind) {
      var th = document.createElement('th'); th.scope = 'col'; th.appendChild(document.createTextNode(kind.label));
      th.appendChild(speakerButton('朗讀' + kind.label + '整欄', function () {
        var readings = [];
        rows.forEach(function (row) { readings.push(row.reading, row.forms[kind.id][1]); });
        speakJapaneseList(readings);
      }, 'column-speaker'));
      header.appendChild(th);
    });
    thead.appendChild(header); table.appendChild(thead);
    var tbody = document.createElement('tbody');
    rows.forEach(function (row) {
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

  window.JapaneseGrammarDataReady.then(function (data) {
    grammar = data;
    dataStatus.hidden = true;
    renderNdesu();
    var activeMode = document.querySelector('[data-study-mode][aria-selected="true"]');
    if (activeMode) activeMode.click();
    if (currentPage === 'grammar') renderGrammar();
    if (currentPage === 'examples') renderExamples();
  }).catch(function (error) {
    dataStatus.textContent = '雲端筆記目前無法載入，請確認 Apps Script 部署狀態與網路連線後重新整理。';
    dataStatus.classList.add('error');
    console.error('Unable to load Japanese grammar data.', error);
  });
})();
