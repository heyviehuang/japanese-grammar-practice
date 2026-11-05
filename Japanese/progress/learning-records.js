(function (root) {
  'use strict';

  var key = 'japanese-grammar-learning-records-v1';
  var mistakes = [
    { id: 'm-miranai', wrong: 'みらない', correct: '見ない', accepted: ['みない'], categoryId: 'nai-form', note: '見る是一段動詞，去る加ない。' },
    { id: 'm-oyogenai', wrong: 'およげない', correct: '泳がない', accepted: ['およがない'], categoryId: 'nai-form', note: '泳ぐ的ない形是泳がない；げない不是這裡要用的變化。' },
    { id: 'm-kakenai', wrong: 'かけない', correct: '書かない', accepted: ['かかない'], categoryId: 'nai-form', note: '書く的ない形是書かない。' },
    { id: 'm-mawanai', wrong: 'まわない', correct: '待たない', accepted: ['またない'], categoryId: 'nai-form', note: '待つ的ない形是待たない。' },
    { id: 'm-nararenai', wrong: 'なられない', correct: '寝ない', accepted: ['ねない'], categoryId: 'nai-form', note: '寝る是一段動詞，ない形是寝ない。' },
    { id: 'm-osobanai', wrong: 'おそばない', correct: '遊ばない', accepted: ['あそばない'], categoryId: 'nai-form', note: '遊ぶ的ない形是遊ばない。' },
    { id: 'm-kikenai', wrong: 'きけない', correct: '聞かない', accepted: ['きかない'], categoryId: 'nai-form', note: '聞く的ない形是聞かない。' },
    { id: 'm-hanasunai', wrong: 'はなすない', correct: '話さない', accepted: ['はなさない'], categoryId: 'nai-form', note: '話す的ない形是話さない。' },
    { id: 'm-fuben-demo', wrong: '不便ても', correct: '不便でも', categoryId: 'adjectives', note: 'な形容詞／名詞接でも，不接て＋も。' },
    { id: 'm-sumen-dara', wrong: 'すめんだら', correct: '住めたら', accepted: ['すめたら'], categoryId: 'conditions', note: '依照本題預期答案訂正為住めたら。' },
    { id: 'm-tsurete-itemo', wrong: 'つれていても', correct: '疲れていても', accepted: ['つかれていても'], categoryId: 'te-form', note: '疲れる的て形是疲れて，句子為疲れていても。' }
  ];
  var notes = [
    { id: 'iru-vs-iru', title: '「いる」和「要る」的否定要分開記', text: '本課動詞「いる」（表示人或動物存在）的否定形是「いない」。「要る」（需要）的否定形才是「いらない」。初始錯題中的「いらない」請依「いる」存在義訂正為「いない」。' }
  ];

  function empty() { return { patterns: {}, categories: {}, mistakes: {}, reviewMistakes: [], total: { attempts: 0, correct: 0 }, lastStudied: null }; }
  function read() {
    try {
      var value = JSON.parse(localStorage.getItem(key));
      if (!value || typeof value !== 'object') return empty();
      return Object.assign(empty(), value, { patterns: value.patterns || {}, categories: value.categories || {}, mistakes: value.mistakes || {}, reviewMistakes: value.reviewMistakes || [], total: value.total || { attempts: 0, correct: 0 } });
    } catch (error) { return empty(); }
  }
  function write(value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (error) { return false; }
  }
  function increment(target, id, correct) {
    if (!id) return;
    var item = target[id] || { attempts: 0, correct: 0, wrong: 0 };
    item.attempts += 1;
    item[correct ? 'correct' : 'wrong'] += 1;
    target[id] = item;
  }
  function record(question, correct, answer) {
    var data = read();
    if (question.patternId) increment(data.patterns, question.patternId, correct);
    if (question.categoryId) increment(data.categories, question.categoryId, correct);
    if (question.mistakeId) increment(data.mistakes, question.mistakeId, correct);
    if (!correct && (question.type !== 'correction' || question.id === 'correction-iru')) {
      var retry = {
        id: 'retry-' + question.id,
        type: 'correction',
        patternId: question.patternId || null,
        categoryId: question.categoryId || null,
        mistakeId: question.mistakeId || question.id,
        prompt: '重新訂正：' + question.prompt,
        answer: question.answer,
        explanation: question.explanation || '',
        lastWrongAnswer: answer || ''
      };
      var found = data.reviewMistakes.findIndex(function (item) { return item.id === retry.id; });
      if (found >= 0) data.reviewMistakes[found] = retry;
      else data.reviewMistakes.push(retry);
    } else {
      data.reviewMistakes = data.reviewMistakes.filter(function (item) { return item.id !== 'retry-' + question.id && (!question.mistakeId || item.mistakeId !== question.mistakeId); });
    }
    data.total.attempts += 1;
    if (correct) data.total.correct += 1;
    data.lastStudied = new Date().toISOString();
    return write(data);
  }

  root.JapaneseProgressData = { mistakes: mistakes, notes: notes };
  root.JapaneseLearningRecords = { read: read, record: record, write: write, empty: empty, storageKey: key };
})(window);
