(function () {
  'use strict';

  try { window.localStorage.removeItem('japanese-grammar-learning-records-v1'); } catch (error) {}

  var grammar = null;
  var currentPage = 'ndesu';
  var selectedCategory = 'te-form';
  var selectedExampleCategory = 'all';
  var selectedExampleMode = 'list';
  var favoriteExampleIds = loadFavoriteExampleIds();
  var selectedExerciseId = null;
  var selectedExerciseAnswers = {};
  var exerciseResult = null;
  var selectedPattern = null;
  var selectedVerbType = 'all';
  var selectedNdesuGroup = 'verb';
  var speechSessionId = 0;
  var categoryPlaybackButton = null;
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
  var demoSentenceExercises = [{
    id: 'example-002',
    prompt: '即使很累也要讀書。',
    answer: '疲れていても、勉強します。',
    explanation: '「疲れていても」表示即使很累；「勉強します」表示讀書。',
    modules: [
      { id: 'te-form', label: '動詞て形', order: 1, correct: '疲れていて', options: ['疲れていて', '疲れて', '疲れていた'] },
      { id: 'grammar', label: '文法接續', order: 2, correct: 'も', options: ['も', 'から', 'が'] },
      { id: 'verb', label: '動詞變化', order: 3, correct: '勉強します。', options: ['勉強します。', '勉強しました。', '勉強しています。'] }
    ]
  }];

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
    var patterns = grammar.patterns.filter(function (item) {
      return selectedCategory === 'all' || item.category === selectedCategory || item.tags.indexOf(selectedCategory) >= 0;
    });
    if (!patterns.some(function (item) { return item.id === selectedPattern; })) {
      selectedPattern = patterns.length ? patterns[0].id : null;
    }

    var layout = element('div', 'grammar-layout');
    var sidebar = element('aside', 'grammar-sidebar');
    sidebar.appendChild(element('h2', 'grammar-sidebar-title', '文法分類'));
    var categories = element('div', 'review-categories grammar-categories');
    grammar.categories.forEach(function (item) {
      var button = action(item.label, function () { selectedCategory = item.id; selectedPattern = null; renderGrammar(); }, 'chip');
      button.setAttribute('aria-pressed', selectedCategory === item.id ? 'true' : 'false');
      categories.appendChild(button);
    });
    var allButton = action('全部', function () { selectedCategory = 'all'; selectedPattern = null; renderGrammar(); }, 'chip');
    allButton.setAttribute('aria-pressed', selectedCategory === 'all' ? 'true' : 'false');
    categories.appendChild(allButton);
    sidebar.appendChild(categories);

    var list = element('div', 'grammar-pattern-list');
    patterns.forEach(function (item) {
      var card = action('', function () { selectedPattern = item.id; renderGrammar(); }, 'grammar-list-item');
      card.setAttribute('aria-pressed', selectedPattern === item.id ? 'true' : 'false');
      card.setAttribute('aria-current', selectedPattern === item.id ? 'true' : 'false');
      card.appendChild(element('strong', '', item.name));
      var group = category(item.category);
      card.appendChild(element('span', 'pattern-group', group ? group.label : '條件句型'));
      if (item.connection) card.appendChild(element('span', 'grammar-list-connection', item.connection));
      list.appendChild(card);
    });
    sidebar.appendChild(list);
    layout.appendChild(sidebar);

    var detailPane = element('section', 'grammar-detail-pane');
    if (selectedPattern) renderPatternDetail(selectedPattern, detailPane);
    else detailPane.appendChild(element('p', 'empty-state', '目前沒有這個分類的文法內容。'));
    layout.appendChild(detailPane);
    content.appendChild(layout);
  }

  function allExamples() {
    var items = grammar.examples.map(function (example) {
      return Object.assign({}, example, { patternIds: (example.patternIds || []).slice() });
    });
    var uniqueItems = [];
    items.forEach(function (example) {
      var existing = uniqueItems.find(function (item) { return item.japanese === example.japanese; });
      if (!existing) {
        uniqueItems.push(example);
        return;
      }
      (example.patternIds || []).forEach(function (id) {
        if (existing.patternIds.indexOf(id) < 0) existing.patternIds.push(id);
      });
      (example.tags || []).forEach(function (tag) {
        if (!existing.tags) existing.tags = [];
        if (existing.tags.indexOf(tag) < 0) existing.tags.push(tag);
      });
      ['note', 'source'].forEach(function (key) {
        if (example[key] && existing[key] !== example[key]) {
          existing[key] = existing[key] ? existing[key] + '／' + example[key] : example[key];
        }
      });
    });
    return uniqueItems;
  }

  function loadFavoriteExampleIds() {
    try {
      var stored = JSON.parse(window.localStorage.getItem('japanese-grammar-favorites-v1') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (error) {
      return [];
    }
  }

  function exampleFavoriteId(example) {
    return String(example.id || example.japanese || '');
  }

  function isExampleFavorite(example) {
    return favoriteExampleIds.indexOf(exampleFavoriteId(example)) >= 0;
  }

  function saveFavoriteExampleIds() {
    try { window.localStorage.setItem('japanese-grammar-favorites-v1', JSON.stringify(favoriteExampleIds)); } catch (error) {}
  }

  function makeExampleCard(example) {
    var block = element('article', 'example-item');
    var topLine = element('div', 'example-topline');
    topLine.appendChild(element('p', 'example-japanese', example.japanese));
    var audioButton = speakerButton('朗讀日文例句與中文翻譯', function () { speakExample(example); }, 'example-audio');
    audioButton.disabled = !('speechSynthesis' in window);
    topLine.appendChild(audioButton);
    var favoriteButton = action('', function () {
      var favoriteId = exampleFavoriteId(example);
      var favoriteIndex = favoriteExampleIds.indexOf(favoriteId);
      if (favoriteIndex >= 0) favoriteExampleIds.splice(favoriteIndex, 1);
      else favoriteExampleIds.push(favoriteId);
      saveFavoriteExampleIds();
      var favorite = isExampleFavorite(example);
      favoriteButton.setAttribute('aria-pressed', favorite ? 'true' : 'false');
      favoriteButton.setAttribute('aria-label', favorite ? '取消收藏例句' : '收藏例句');
      favoriteButton.title = favorite ? '取消收藏例句' : '收藏例句';
      if (selectedExampleCategory === 'favorites') {
        stopSpeech();
        renderExamples();
      }
    }, 'example-favorite');
    var isFavorite = isExampleFavorite(example);
    favoriteButton.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
    favoriteButton.setAttribute('aria-label', isFavorite ? '取消收藏例句' : '收藏例句');
    favoriteButton.title = isFavorite ? '取消收藏例句' : '收藏例句';
    favoriteButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.1 10.55 18.8C5.4 14.12 2 11.03 2 7.25 2 4.16 4.42 1.75 7.5 1.75c1.74 0 3.41.81 4.5 2.08 1.09-1.27 2.76-2.08 4.5-2.08 3.08 0 5.5 2.41 5.5 5.5 0 3.78-3.4 6.87-8.55 11.56L12 20.1Z" transform="translate(0 1)" fill="currentColor"/></svg>';
    topLine.appendChild(favoriteButton);
    var linkedExercise = sentenceExercises().find(function (item) {
      return item.id === example.id || (!example.id && item.answer === example.japanese);
    });
    if (linkedExercise) {
      var practiceButton = action('', function () {
        stopSpeech();
        selectedExampleMode = 'exercise';
        selectedExerciseId = linkedExercise.id;
        selectedExerciseAnswers = {};
        exerciseResult = null;
        setPage('examples');
      }, 'example-practice');
      practiceButton.setAttribute('aria-label', '用這句進行詞塊拼句練習');
      practiceButton.title = '用這句進行詞塊拼句練習';
      practiceButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h5a3 3 0 1 1 6 0h5v5a3 3 0 1 0 0 6v5h-5a3 3 0 1 1-6 0H4v-5a3 3 0 1 0 0-6V4Z" fill="currentColor"/></svg>';
      topLine.appendChild(practiceButton);
    }
    block.appendChild(topLine);
    block.appendChild(element('p', 'example-chinese', example.chinese));
    var tags = (example.patternIds || []).map(pattern).filter(Boolean).map(function (item) { return item.name; });
    tags = tags.concat(example.tags || []).filter(function (tag, index, values) { return values.indexOf(tag) === index; });
    if (tags.length) block.appendChild(element('small', 'example-tags', '標籤：' + tags.join('、')));
    if (example.note) block.appendChild(element('p', 'example-note', example.note));
    if (example.source) block.appendChild(element('small', 'example-source', example.source));
    return block;
  }

  function sentenceExercises() {
    if (grammar && Array.isArray(grammar.exercises) && grammar.exercises.length) {
      var firstExercise = grammar.exercises[0];
      if (firstExercise && Array.isArray(firstExercise.modules) && firstExercise.modules.length) return grammar.exercises;
    }
    return demoSentenceExercises;
  }

  function renderExampleModeTabs() {
    var tabs = element('nav', 'example-modes category-tabs');
    tabs.setAttribute('aria-label', '例句頁面內容');
    tabs.setAttribute('role', 'tablist');
    var modes = [
      { id: 'list', label: '例句列表' },
      { id: 'exercise', label: '組句練習' }
    ];
    modes.forEach(function (mode) {
      var button = action(mode.label, function () {
        stopSpeech();
        selectedExampleMode = mode.id;
        renderExamples();
      }, 'chip');
      button.setAttribute('role', 'tab');
      button.setAttribute('aria-selected', selectedExampleMode === mode.id ? 'true' : 'false');
      button.setAttribute('aria-pressed', selectedExampleMode === mode.id ? 'true' : 'false');
      tabs.appendChild(button);
    });
    content.appendChild(tabs);
  }

  function renderSentenceExercise() {
    var exercises = sentenceExercises();
    var exercise = exercises.filter(function (item) { return item.id === selectedExerciseId; })[0] || exercises[0];
    if (!exercise || !Array.isArray(exercise.modules) || !exercise.modules.length) {
      content.appendChild(element('p', 'empty-state', '目前還沒有組句練習題。'));
      return;
    }

    var modules = exercise.modules.slice().sort(function (a, b) { return Number(a.order) - Number(b.order); });
    var complete = modules.every(function (module) { return !!selectedExerciseAnswers[module.id]; });
    var assembled = modules.map(function (module) { return selectedExerciseAnswers[module.id] || ''; }).join('');
    var exercisePanel = element('section', 'sentence-exercise');
    var top = element('div', 'sentence-exercise-top');
    var titleGroup = element('div', 'sentence-exercise-title');
    titleGroup.appendChild(element('h2', '', '日文組句練習'));
    titleGroup.appendChild(element('p', '', '請選擇各語言模塊，組成完整句子。'));
    top.appendChild(titleGroup);
    top.appendChild(element('span', 'exercise-progress', '01 / 01'));
    exercisePanel.appendChild(top);

    var prompt = element('section', 'exercise-prompt');
    prompt.appendChild(element('p', 'exercise-eyebrow', '請將以下中文組成日文'));
    prompt.appendChild(element('p', 'exercise-prompt-text', exercise.prompt));
    exercisePanel.appendChild(prompt);

    var builder = element('section', 'exercise-builder');
    var builderHeading = element('div', 'exercise-section-heading');
    builderHeading.appendChild(element('h3', '', '目前組成的句子'));
    builderHeading.appendChild(element('span', '', '依序選擇積木'));
    builder.appendChild(builderHeading);
    var sentence = element('div', 'sentence-pieces');
    modules.forEach(function (module) {
      var selected = selectedExerciseAnswers[module.id];
      if (selected) {
        var piece = action(selected, function () {
          delete selectedExerciseAnswers[module.id];
          exerciseResult = null;
          renderExamples();
        }, 'sentence-piece');
        piece.setAttribute('aria-label', '移除' + selected);
        sentence.appendChild(piece);
      } else {
        sentence.appendChild(element('span', 'sentence-piece is-empty', '＋'));
      }
    });
    builder.appendChild(sentence);
    if (assembled) builder.appendChild(element('p', 'assembled-reading', assembled));
    exercisePanel.appendChild(builder);

    var modulesHeading = element('div', 'exercise-section-heading');
    modulesHeading.appendChild(element('h3', '', '選擇語言模塊'));
    exercisePanel.appendChild(modulesHeading);
    var moduleGrid = element('div', 'exercise-module-grid');
    modules.forEach(function (module) {
      var moduleCard = element('section', 'exercise-module');
      moduleCard.appendChild(element('h4', '', module.label));
      var options = element('div', 'exercise-options');
      (module.options || []).forEach(function (option) {
        var optionButton = action(option, function () {
          selectedExerciseAnswers[module.id] = option;
          exerciseResult = null;
          renderExamples();
        }, 'exercise-option');
        optionButton.setAttribute('aria-pressed', selectedExerciseAnswers[module.id] === option ? 'true' : 'false');
        options.appendChild(optionButton);
      });
      moduleCard.appendChild(options);
      moduleGrid.appendChild(moduleCard);
    });
    exercisePanel.appendChild(moduleGrid);

    var actions = element('div', 'exercise-actions');
    var confirm = action('確認答案', function () {
      var correct = modules.every(function (module) {
        return selectedExerciseAnswers[module.id] === module.correct;
      });
      exerciseResult = { correct: correct };
      renderExamples();
    }, 'btn');
    confirm.disabled = !complete;
    actions.appendChild(confirm);
    var reset = action('清除重組', function () {
      selectedExerciseAnswers = {};
      exerciseResult = null;
      renderExamples();
    }, 'btn ghost');
    actions.appendChild(reset);
    exercisePanel.appendChild(actions);

    if (exerciseResult) {
      var feedback = element('div', 'exercise-feedback ' + (exerciseResult.correct ? 'is-correct' : 'is-incorrect'));
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      feedback.appendChild(element('strong', '', exerciseResult.correct ? '答對了！' : '再試一次，這是正確答案：'));
      feedback.appendChild(element('p', 'exercise-answer', exercise.answer));
      if (exercise.explanation) feedback.appendChild(element('p', 'exercise-explanation', exercise.explanation));
      var playAnswer = speakerButton('朗讀正確答案', function () { speakJapaneseList([exercise.answer]); }, 'exercise-audio');
      playAnswer.disabled = !('speechSynthesis' in window);
      feedback.appendChild(playAnswer);
      exercisePanel.appendChild(feedback);
    }

    content.appendChild(exercisePanel);
  }

  function renderExamples() {
    heading.textContent = '課堂與生活例句';
    content.innerHTML = '';
    renderExampleModeTabs();
    if (selectedExampleMode === 'exercise') {
      renderSentenceExercise();
      return;
    }
    var filters = [{ id: 'all', label: '全部' }, { id: 'favorites', label: '收藏' }, { id: 'life', label: '生活造句' }, { id: 'ndesu', label: 'んです' }].concat(
      grammar.categories.map(function (item) { return { id: item.id, label: item.label }; })
    );
    var tabs = element('div', 'review-categories');
    filters.forEach(function (filter) {
      var button = action(filter.label, function () { stopSpeech(); selectedExampleCategory = filter.id; renderExamples(); }, 'chip');
      button.setAttribute('aria-pressed', selectedExampleCategory === filter.id ? 'true' : 'false');
      tabs.appendChild(button);
    });
    content.appendChild(tabs);
    var items = allExamples().filter(function (example) {
      if (selectedExampleCategory === 'all') return true;
      if (selectedExampleCategory === 'favorites') return isExampleFavorite(example);
      if (selectedExampleCategory === 'life') return (example.tags || []).some(function (tag) { return tag.indexOf('生活造句') >= 0 || tag.indexOf('生活日文') >= 0; });
      if (selectedExampleCategory === 'ndesu') return (example.tags || []).indexOf('んです') >= 0;
      return (example.patternIds || []).some(function (id) {
        var item = pattern(id);
        return item && (item.category === selectedExampleCategory || item.tags.indexOf(selectedExampleCategory) >= 0);
      });
    });
    var playbackControls = element('div', 'example-playback-controls');
    var cycleButton = action('循環朗讀本類別', function () {
      if (categoryPlaybackButton === cycleButton) { stopSpeech(); return; }
      startCategoryPlayback(items, cycleButton);
    }, 'btn ghost');
    cycleButton.disabled = items.length === 0 || !('speechSynthesis' in window);
    cycleButton.setAttribute('aria-label', '依序朗讀目前分類的所有例句');
    playbackControls.appendChild(cycleButton);
    content.appendChild(playbackControls);
    var list = element('div', 'example-list');
    items.forEach(function (example) { list.appendChild(makeExampleCard(example)); });
    if (!items.length) list.appendChild(element('p', 'empty-state', selectedExampleCategory === 'favorites' ? '還沒有收藏的例句。' : '這個分類目前沒有例句。'));
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
  function renderPatternDetail(id, parent) {
    var item = pattern(id);
    if (!item) return;
    var panel = element('article', 'lesson-detail');
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
    parent.appendChild(panel);
  }

  function stopSpeech() {
    speechSessionId += 1;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (categoryPlaybackButton) {
      categoryPlaybackButton.textContent = '循環朗讀本類別';
      categoryPlaybackButton = null;
    }
  }
  function speechVoice(lang) {
    if (!('speechSynthesis' in window)) return null;
    var prefix = lang.split('-')[0].toLowerCase();
    var voices = window.speechSynthesis.getVoices().filter(function (voice) {
      return voice.lang.toLowerCase().indexOf(prefix) === 0;
    });
    voices.sort(function (a, b) {
      var score = function (voice) {
        var voiceLang = voice.lang.toLowerCase();
        return (voiceLang === lang.toLowerCase() ? 4 : 0) +
          (prefix === 'zh' && (voiceLang === 'zh-tw' || voiceLang === 'zh-hant-tw') ? 3 : 0) +
          (voice.localService ? 1 : 0);
      };
      return score(b) - score(a);
    });
    return voices[0] || null;
  }
  function queueSpeech(items, sessionId, onComplete) {
    if (!('speechSynthesis' in window) || !items.length) {
      if (onComplete) onComplete();
      return;
    }
    var index = 0;
    function speakNext() {
      if (sessionId !== speechSessionId) return;
      if (index >= items.length) {
        if (onComplete) onComplete();
        return;
      }
      var item = items[index++];
      if (!item || !String(item.text || '').trim()) { speakNext(); return; }
      var utterance = new SpeechSynthesisUtterance(item.text);
      utterance.lang = item.lang || 'ja-JP';
      utterance.rate = utterance.lang.indexOf('zh') === 0 ? 2 : 0.94;
      utterance.pitch = 1;
      var voice = speechVoice(utterance.lang);
      if (voice) utterance.voice = voice;
      utterance.onend = speakNext;
      utterance.onerror = speakNext;
      window.speechSynthesis.speak(utterance);
    }
    speakNext();
  }
  function speakSequence(items) {
    stopSpeech();
    queueSpeech(items, speechSessionId);
  }
  function speakJapaneseList(readings) {
    speakSequence(readings.map(function (reading) { return { text: reading, lang: 'ja-JP' }; }));
  }
  function exampleSpeechItems(example) {
    var items = [];
    if (example.japanese) items.push({ text: example.japanese, lang: 'ja-JP' });
    if (example.chinese) items.push({ text: example.chinese, lang: 'zh-TW' });
    return items;
  }
  function speakExample(example) {
    speakSequence(exampleSpeechItems(example));
  }
  function startCategoryPlayback(examples, button) {
    stopSpeech();
    var sessionId = speechSessionId;
    var index = 0;
    categoryPlaybackButton = button;
    button.textContent = '停止朗讀';
    function playNextExample() {
      if (sessionId !== speechSessionId) return;
      if (index >= examples.length) {
        button.textContent = '循環朗讀本類別';
        categoryPlaybackButton = null;
        return;
      }
      queueSpeech(exampleSpeechItems(examples[index++]), sessionId, playNextExample);
    }
    playNextExample();
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
      var reading = Array.isArray(row) ? row[6] : row.reading;
      var forms = Array.isArray(row) ? [row[1], row[2], row[3], row[4]].map(function (form) { return form + 'んです'; }) : row.forms;
      var tr = document.createElement('tr'), base = document.createElement('td');
      base.appendChild(element('span', 'row-word', reading));
      base.appendChild(speakerButton('播放' + reading, function () { speakJapaneseList([reading]); }));
      tr.appendChild(base);
      forms.forEach(function (answer) {
        var td = document.createElement('td');
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
        }(answer, reveal, reading));
        td.appendChild(reveal);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  document.querySelectorAll('#ndesu-view [data-column]').forEach(function (control) {
    control.addEventListener('click', function () {
      var column = Number(control.dataset.column), group = grammar && (grammar.ndesuGroups || []).find(function (item) { return item.id === selectedNdesuGroup; });
      if (!group) return;
      var readings = [];
      group.rows.forEach(function (row) {
        var reading = Array.isArray(row) ? row[6] : row.reading;
        var forms = Array.isArray(row) ? [row[1], row[2], row[3], row[4]].map(function (form) { return form + 'んです'; }) : row.forms;
        if (column === 0) readings.push(reading);
        else readings.push(reading, forms[column - 1]);
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
    for (var col = 0; col < 10; col++) colgroup.appendChild(document.createElement('col'));
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
    var meaningHeader = document.createElement('th');
    meaningHeader.scope = 'col';
    meaningHeader.textContent = '中文意思';
    header.appendChild(meaningHeader);
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
      tr.appendChild(element('td', 'verb-meaning', row.meaning || ''));
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
