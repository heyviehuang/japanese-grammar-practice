(function (root) {
  'use strict';

  var grammar = root.JapaneseGrammarData;
  var forms = [
    { type: 'fill', id: 'fill-te-connect', patternId: 'te-connect', prompt: '填入動詞「聞く」的て形：昨日、音楽を＿＿、日本語を勉強しました。', answer: '聞いて', explanation: '聞く的て形是聞いて。' },
    { type: 'fill', id: 'fill-temo-tired', patternId: 'te-mo', prompt: '填入「疲れる」的て形：＿＿いても、勉強します。', answer: '疲れて', explanation: '疲れる是る動詞，て形為疲れて。整句是「疲れていても」。' },
    { type: 'fill', id: 'fill-temo-study', patternId: 'te-mo', prompt: '填入「する」的て形：勉強＿＿も、難しいです。', answer: 'して', explanation: 'する的て形是して。' },
    { type: 'fill', id: 'fill-tari', patternId: 'tari-tari', prompt: '填入「聞く」的た形＋り：昨日、音楽を＿＿、日本語を勉強したりしました。', answer: '聞いたり', explanation: '聞く的た形是聞いた，再接り。' },
    { type: 'fill', id: 'fill-ta-toki', patternId: 'toki', prompt: '填入「行く」的た形：日本に＿＿とき、カメラを買いました。', answer: '行った', explanation: '行く的た形是行った（特殊音便）。' },
    { type: 'fill', id: 'fill-nai-tsumori', patternId: 'nai-tsumori', prompt: '填入「買う」的ない形：お土産は＿＿つもりです。', answer: '買わない', explanation: '買う的ない形是買わない。う改為わ再接ない。' },
    { type: 'fill', id: 'fill-dict-toki', patternId: 'toki', prompt: '填入「行く」的辭書形：日本に＿＿とき、カメラを買いました。', answer: '行く', explanation: '辭書形接とき表示前項動作尚未完成。' },
    { type: 'fill', id: 'fill-noun', patternId: 'noun-connection', prompt: '填入正確接續：きれい＿＿お守りがほしいです。', answer: 'な', explanation: 'な形容詞修飾名詞時，詞幹後接な。' },
    { type: 'fill', id: 'fill-i-adj', patternId: 'tara', prompt: '填入「安い」的た形：＿＿たら、買います。', answer: '安かっ', explanation: '安い的過去形是安かった，接たら時為安かったら。' },

    { type: 'translate', id: 'translate-te', patternId: 'te-connect', prompt: '請翻成日文：昨天聽音樂，然後學日文。', answer: '昨日、音楽を聞いて、日本語を勉強しました。', explanation: '以聞いて連接前後兩個動作。' },
    { type: 'translate', id: 'translate-temo', patternId: 'te-mo', prompt: '請翻成日文：即使讀書還是很難。', answer: '勉強しても、難しいです。', explanation: '動詞て形＋も表示即使……也……。' },
    { type: 'translate', id: 'translate-tari', patternId: 'tari-tari', prompt: '請翻成日文：週末看電影、跟朋友聊天等等。', answer: '週末、映画を見たり、友達と話したりしました。', explanation: '用た形＋り列舉代表性動作。' },
    { type: 'translate', id: 'translate-nai', patternId: 'nai-tsumori', prompt: '請翻成日文：不打算買沒有日本特色的伴手禮。', answer: '日本らしくないお土産は買わないつもりです。', explanation: '買わないつもりです表示不打算買。' },
    { type: 'translate', id: 'translate-dict', patternId: 'to-condition', prompt: '請翻成日文：吃了這種水果，心情會變好。', answer: 'このフルーツを食べると、気分がよくなります。', explanation: '辭書形＋と表示自然或必然結果。' },
    { type: 'translate', id: 'translate-adj', patternId: 'noun-connection', prompt: '請翻成日文：想要漂亮的御守。', answer: 'きれいなお守りがほしいです。', explanation: 'きれい是な形容詞，修飾名詞時接な。' },

    { type: 'transform', id: 'transform-miru-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「見る」改成ない形。', answer: '見ない', accepted: ['みない'], explanation: '一段動詞去る加ない。' },
    { type: 'transform', id: 'transform-oyogu-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「泳ぐ」改成ない形。', answer: '泳がない', accepted: ['およがない'], explanation: '五段動詞的ぐ改為が，再加ない。' },
    { type: 'transform', id: 'transform-kaku-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「書く」改成ない形。', answer: '書かない', accepted: ['かかない'], explanation: '五段動詞的く改為か，再加ない。' },
    { type: 'transform', id: 'transform-matsu-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「待つ」改成ない形。', answer: '待たない', accepted: ['またない'], explanation: '五段動詞的つ改為た，再加ない。' },
    { type: 'transform', id: 'transform-neru-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「寝る」改成ない形。', answer: '寝ない', accepted: ['ねない'], explanation: '一段動詞去る加ない。' },
    { type: 'transform', id: 'transform-asobu-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「遊ぶ」改成ない形。', answer: '遊ばない', accepted: ['あそばない'], explanation: '五段動詞的ぶ改為ば，再加ない。' },
    { type: 'transform', id: 'transform-kiku-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「聞く」改成ない形。', answer: '聞かない', accepted: ['きかない'], explanation: '五段動詞的く改為か，再加ない。' },
    { type: 'transform', id: 'transform-hanasu-nai', patternId: 'nai-tsumori', categoryId: 'nai-form', prompt: '將「話す」改成ない形。', answer: '話さない', accepted: ['はなさない'], explanation: '五段動詞的す改為さ，再加ない。' },
    { type: 'transform', id: 'transform-iku-ta', patternId: 'toki', categoryId: 'ta-form', prompt: '將「行く」改成た形。', answer: '行った', accepted: ['いった'], explanation: '行く的た形是特殊音便行った。' },
    { type: 'transform', id: 'transform-yasui-tara', patternId: 'tara', categoryId: 'ta-form', prompt: '將「安い」改成「如果便宜的話」的形式。', answer: '安かったら', accepted: ['やすかったら'], explanation: 'い形容詞去い加かったら。' },

    { type: 'correction', id: 'correction-iru', categoryId: 'nai-form', mistakeId: 'iru-vs-iru', prompt: '訂正動詞「いる」（存在）的否定形：いらない', answer: 'いない', explanation: 'いる（存在）的否定是「いない」。「いらない」是「要る」（需要）的否定。' }
  ];

  var connectionQuestions = grammar.patterns.map(function (pattern) {
    var allConnections = [
      '動詞て形＋句型', '動詞た形＋句型', '動詞ない形＋句型', '動詞辭書形＋句型', '動詞ます形去ます＋句型',
      'い形容詞／な形容詞／名詞的活用形式'
    ];
    var options = [pattern.connection];
    allConnections.forEach(function (option) { if (option !== pattern.connection && options.indexOf(option) < 0 && options.length < 4) options.push(option); });
    return {
      id: 'connection-' + pattern.id,
      type: 'choice',
      patternId: pattern.id,
      prompt: '「' + pattern.name + '」的接續方式是？',
      answer: pattern.connection,
      options: options,
      explanation: pattern.explanation
    };
  });

  root.JapaneseQuestionData = { questions: connectionQuestions.concat(forms) };
})(window);
