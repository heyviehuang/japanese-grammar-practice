(function (root) {
  'use strict';

  var categories = [
    { id: 'te-form', label: 'て形文法', description: '以動詞て形接續的句型。', reference: [
      ['五段動詞', 'う・つ・る → って；む・ぶ・ぬ → んで；く → いて（行く → 行って）；ぐ → いで；す → して'],
      ['一段動詞', '去る＋て'], ['する／来る', 'して／きて']
    ]},
    { id: 'ta-form', label: 'た形文法', description: '以動詞た形接續的句型。', reference: [
      ['五段動詞', 'う・つ・る → った；む・ぶ・ぬ → んだ；く → いた（行く → 行った）；ぐ → いだ；す → した'],
      ['一段動詞', '去る＋た'], ['する／来る', 'した／きた']
    ]},
    { id: 'nai-form', label: 'ない形文法', description: '以動詞ない形接續的句型。', reference: [
      ['五段動詞', 'う段改あ段＋ない；う → わない'], ['一段動詞', '去る＋ない'], ['する／来る／ある', 'しない／こない／ない']
    ]},
    { id: 'dictionary-form', label: '辭書形文法', description: '以動詞辭書形接續的句型。', reference: [
      ['五段動詞', '保留う段詞尾：書く、読む'], ['一段動詞', '去る＋る：食べる、見る'], ['する／来る', 'する／くる']
    ]},
    { id: 'masu-form', label: 'ます形文法', description: '以ます形語幹接續的句型。', reference: [
      ['五段動詞', 'う段改い段＋ます：書く → 書きます'], ['一段動詞', '去る＋ます：食べる → 食べます'], ['する／来る', 'します／きます']
    ]},
    { id: 'potential-form', label: '可能形', description: '表示能力或做某事的可能性。', reference: [
      ['五段動詞', 'う段改え段＋る：話す → 話せる、書く → 書ける、泳ぐ → 泳げる、休む → 休める、乗る → 乗れる、行く → 行ける、作る → 作れる、弾く → 弾ける、描く → 描ける'],
      ['一段動詞', '去る＋られる：食べる → 食べられる、見る → 見られる'], ['不規則動詞', 'する → できる；来る → 来られる']
    ]},
    { id: 'limited-expression', label: 'しか・だけ', description: '整理限定表現及其語氣差異。', reference: [
      ['しか', '通常接否定述語，表示範圍有限，常帶有「只有這麼少」的語感。'],
      ['だけ', '表示限定，語氣通常較中性，可接肯定或否定述語。'],
      ['比較', '1回しか行きません。（只有一次，帶有限的語感）／1回だけ行きます。（只去一次，中性陳述）']
    ]},
    { id: 'verb-meaning', label: '易混淆動詞', description: '比較外形相近、意思不同的動詞。', reference: [
      ['見る', '主動看、觀看：アニメを見ます。'],
      ['見える', '自然看得見、映入眼簾：湖が見えます。'],
      ['見られる', '有能力或條件觀看：アニメが見られます。']
    ]},
    { id: 'particles', label: '助詞', description: '依動詞搭配與句中功能理解助詞。', reference: [
      ['に', '移動目的地、日本に行きます；乘坐對象、バイクに乗ります；動作接受對象、友達に教えます。'],
      ['で', '動作地點、図書館で勉強します；工具或方法、バスで行きます。'],
      ['を', '動作對象、日本語を勉強します。']
    ]},
    { id: 'conditions', label: '條件句型', description: '依接續形式索引條件表現；同一文法只建一筆資料。', reference: [
      ['たら', 'た形＋ら'], ['ても', 'て形＋も'], ['ば', '動詞ば形；い形容詞去い＋ければ'], ['と', '辭書形＋と'], ['なら', '普通形＋なら；な形容詞語幹／名詞＋なら'], ['たらいいですか', '動詞た形＋ら＋いいですか']
    ]},
    { id: 'adjectives', label: '形容詞與名詞', description: 'い形容詞、な形容詞與名詞的常用接續及變化。', reference: [
      ['い形容詞否定／過去', '去い＋くない／かった：安い → 安くない／安かった'],
      ['な形容詞否定／過去', '否定：ではありません；過去：でした（例：静かではありません／静かでした）'],
      ['て形', 'い形容詞去い＋くて；な形容詞／名詞＋で'], ['名詞修飾', 'な形容詞＋な＋名詞；名詞＋の＋名詞']
    ]}
  ];

  function p(id, name, category, tags, connection, explanation, example, translation, notes) {
    return { id: id, name: name, category: category, tags: tags || [], connection: connection, explanation: explanation, example: example, translation: translation, notes: notes || [] };
  }

  var patterns = [
    p('te-connect', '動作接續（て形）', 'te-form', [], '動詞て形＋後續句子', '用て形連接先後動作或補充狀態。', '昨日、音楽を聞いて、日本語を勉強しました。', '昨天聽音樂，然後學日文。'),
    p('te-kudasai', '～てください', 'te-form', [], '動詞て形＋ください', '提出禮貌請求或指示。', 'ここに名前を書いてください。', '請在這裡寫名字。'),
    p('te-mo-ii', '～てもいいです', 'te-form', [], '動詞て形＋もいいです', '表示許可。', 'ここで写真を撮ってもいいです。', '可以在這裡拍照。'),
    p('tewa-ikenai', '～てはいけません', 'te-form', [], '動詞て形＋はいけません', '表示禁止、不可以做某事。', 'ここでたばこを吸ってはいけません。', '不可以在這裡抽菸。'),
    p('te-kuremasen', '～てくれませんか', 'te-form', [], '動詞て形＋くれませんか', '以較委婉的方式請對方幫忙。', '窓を開けてくれませんか。', '可以請你開窗嗎？'),
    p('te-kara', '～てから', 'te-form', [], '動詞て形＋から', '表示完成前項動作之後，再進行後項動作。', 'ご飯を食べてから、出かけます。', '吃完飯之後出門。'),
    p('te-iru', '～ています', 'te-form', [], '動詞て形＋います', '表示正在進行的動作或持續狀態。', '今、日本語を勉強しています。', '現在正在學日文。'),
    p('te-mo', '～ても', 'te-form', ['conditions', 'adjectives'], '動詞て形＋も；い形容詞去い＋くても；な形容詞／名詞＋でも', '表示即使前項成立，後項仍然成立。依詞性使用て形＋も、くても或でも。', '勉強しても、難しいです。', '即使讀書還是很難。', ['な形容詞接でも：不便でも、住みたいです。', '疲れる的ている形再接ても：疲れている → 疲れていても。', '常見混淆：不便ても → 不便でも；つれていても → 疲れていても。']),
    p('te-miru', '～てみる', 'te-form', [], '動詞て形＋みる', '表示嘗試做某事看看；みる依句子時態與語氣變化。', 'この料理を食べてみます。', '我來試吃這道料理。', ['相關變化：～てみたい（想嘗試）、～てみました（試過了）、～てみてください（請試試看）。']),
    p('te-shimau', '～てしまいます', 'te-form', [], '動詞て形＋しまいます', '表示做完、做盡，也可表示遺憾或不小心。', '財布を忘れてしまいました。', '我不小心忘了帶錢包。'),

    p('ta-koto', '～たことがあります', 'ta-form', [], '動詞た形＋ことがあります', '表示曾經有過某種經驗。', '日本へ行ったことがあります。', '我曾經去過日本。'),
    p('tari-tari', '～たり～たりします', 'ta-form', [], '動詞た形＋り，動詞た形＋りします', '列舉代表性動作，表示做了這些或類似的事。', '週末、映画を見たり、友達と話したりしました。', '週末看電影、跟朋友聊天等等。'),
    p('tara', '～たら', 'ta-form', ['conditions'], '動詞た形＋ら；い形容詞去い＋かったら；な形容詞／名詞＋だったら', '表示假設條件「如果……」，也可表示某事完成後。', '安かったら、買います。', '如果便宜的話就買。', ['可能形也能接たら表示「如果能……」：住める → 住めたら。', '常見混淆：すめんだら → 住めたら。']),
    p('toki', '～とき', 'ta-form', ['dictionary-form'], '動詞た形＋とき（前項已完成）；動詞辭書形＋とき（前項尚未完成）', '動詞た形表示前項已完成時；辭書形表示前項尚未完成時。兩種接續共用同一個時間句型。', '日本に行ったとき、カメラを買いました。', '去日本的時候買了相機。'),
    p('ta-ato', '～た後で', 'ta-form', [], '動詞た形＋後で', '表示完成前項動作之後。', '宿題をした後で、テレビを見ます。', '寫完作業之後看電視。'),
    p('ta-hou', '～たほうがいいです', 'ta-form', [], '動詞た形＋ほうがいいです', '提出建議，表示做某事比較好。', '早く寝たほうがいいです。', '早點睡比較好。'),

    p('nai-de', '～ないでください', 'nai-form', [], '動詞ない形去い＋でください', '請對方不要做某事。', 'ここに車を止めないでください。', '請不要把車停在這裡。'),
    p('iru-negative', 'いる（居る）的否定形', 'nai-form', [], 'いる（居る）→ いない；要る → 要らない（いらない）', '表示人或動物不存在時，いる的否定是いない。要る則是「需要」，否定為いらない。', '部屋に猫がいない。', '房間裡沒有貓。', ['容易混淆：存在的「いる」否定是「いない」；表示需要的「要る」否定才是「いらない」。']),
    p('nakereba', '～なければなりません', 'nai-form', [], '動詞ない形去い＋ければなりません', '表示必須做某事。', '毎日、薬を飲まなければなりません。', '每天必須吃藥。'),
    p('nakutemo-ii', '～なくてもいいです', 'nai-form', [], '動詞ない形去い＋くてもいいです', '表示不做某事也可以、不必做。', '明日は来なくてもいいです。', '明天不來也可以。'),
    p('nai-hou', '～ないほうがいいです', 'nai-form', [], '動詞ない形去い＋ほうがいいです', '提出避免某事的建議。', '無理をしないほうがいいです。', '最好不要勉強。'),
    p('nai-tsumori', '～ないつもりです', 'nai-form', [], '動詞ない形＋つもりです', '表示打算不做某事。', '日本らしくないお土産は買わないつもりです。', '不打算買沒有日本特色的伴手禮。'),

    p('potential-ability', '動詞可能形', 'potential-form', [], '五段動詞：う段改え段＋る；一段動詞：去る＋られる；する→できる；来る→来られる', '表示有能力做某事，或某件事可以實現。', '自転車に乗れませんでした。', '沒辦法騎腳踏車。', ['表示能力時，原本的を常改用が；部分動詞也可保留を，依動詞搭配與句意判斷。', '訂正：話れます → 話せます；休みます → 休めます。']),
    p('potential-vs-koto', '可能形與～ことができます', 'potential-form', ['dictionary-form'], '可能形；或動詞辭書形＋ことができます', '兩種句型都能表示能力或可能性，選擇其中一種表達即可。', '日本語が話せます。', '會說日文。', ['也可以說「日本語を話すことができます」。', '避免把兩種句型疊在一起：日本語が話せることができます（一般不這樣說）。', '「バイクに乗ることができます」中的に，是因為「乗る」搭配交通工具使用に。']),
    p('nara-condition', '～なら', 'conditions', [], '動詞普通形＋なら；い形容詞＋なら；な形容詞語幹＋なら；名詞＋なら', '表示「如果是……的話」，常針對對方提出的話題或特定條件作出回應。', '簡単な料理なら作れます。', '如果是簡單的料理，我會做。', ['な形容詞語幹直接接なら，不加な：便利なら（不是便利ななら）。', '例：料理ができますか。—簡単な料理なら作れます。', '～なら與～たら用法不同：なら常承接話題或限定條件；たら表示假設或某事發生／完成之後。']),
    p('tara-ii-desuka', '～たらいいですか', 'ta-form', ['conditions'], '動詞た形＋ら＋いいですか', '用來詢問建議、做法或適當的行動，可譯為「做……比較好呢？」或「該怎麼辦？」。', 'どうしたらいいですか。', '該怎麼辦才好呢？', ['容易混淆：売りたいたら → 売ったら。這裡要用「売る」的た形，不是たい形。']),
    p('verb-koto-nominalization', '動詞＋こと（名詞化）', 'dictionary-form', [], '動詞普通形＋こと', 'こと可將動作或狀態名詞化，作為句子的主題或內容。', '私の得意なことは絵を描くことです。', '我的擅長項目是畫畫。'),

    p('shika-negative', 'しか＋否定形', 'limited-expression', ['particles'], '名詞／數量詞＋しか＋否定形', '表示只有某範圍或數量，通常帶有「除此之外沒有」或覺得數量有限的語感。', '日本に1回しか行ったことがありません。', '只去過日本一次。', ['しか通常搭配否定述語。', '表示範圍受到限制；與だけ相比，常帶有數量少或選擇有限的語感。', '容易混淆的寫法：現金しかでつかえません → 現金しか使えません。']),
    p('shika-vs-dake', 'しか與だけ的差異', 'limited-expression', ['particles'], 'しか＋否定述語；だけ＋名詞或其他述語', '兩者都能表示限定。しか通常需要否定述語，並較容易帶出「只有這些」的有限語感；だけ多為中性限定。', '1回しか行きません。／1回だけ行きます。', '只去一次。（前句較有「只有一次」的有限語感；後句較中性。）', ['しか不是把だけ直接換成否定形；請依句型與語氣選擇。']),

    p('miru-mieru-mirareru', '見る・見える・見られる', 'verb-meaning', [], '見る：を＋見る；見える：が＋見える；見られる：が／を＋見られる', '見る是主動觀看；見える是自然看得見或映入眼簾；見られる表示有能力或條件觀看。', '湖しか見えません。', '只能看見湖。', ['見る：アニメを見ます（主動看動畫）。', '見える：湖が見えます（自然看得到湖）。', '見られる：アニメが見られます（可以觀看動畫）。', '「見えません」與「見ません」不同：前者是看不見，後者是不看。', '「見られる」在其他語境也可能表示被動，需依上下文判斷。']),

    p('particles-ni-de-wo', '助詞に・で・を', 'particles', [], 'に：目的地／乘坐對象／動作接受者；で：動作地點／工具方法；を：動作對象', '助詞要依動詞搭配及句子中名詞的角色判斷。', '私はバイクに乗ることができます。', '我會騎機車。', ['乗る搭配交通工具時使用に，所以這句的に不是由「ことができます」決定。', '教える的對象可用に：おばあちゃんは私に日本語を教えてくれます。', 'ために表示目的或受益對象：私は母のために皿を洗います。']),

    p('to-omou', '～と思います', 'dictionary-form', [], '普通形＋と思います；名詞／な形容詞使用だと思います', '表示想法、意見或推測。動詞、い形容詞直接接；名詞與な形容詞接だ。', '明日は雨が降ると思います。', '我想明天會下雨。'),
    p('koto-dekiru', '～ことができます', 'dictionary-form', [], '動詞辭書形＋ことができます', '表示能力或可能性。', '私は日本語を話すことができます。', '我會說日文。'),
    p('dict-tsumori', '～つもりです', 'dictionary-form', [], '動詞辭書形＋つもりです', '表示已打算或預定要做某事。', '来年、日本へ行くつもりです。', '我打算明年去日本。'),
    p('mae-ni', '～前に', 'dictionary-form', [], '動詞辭書形＋前に', '表示某動作之前；前項使用辭書形。', '寝る前に、歯を磨きます。', '睡覺前刷牙。'),
    p('to-condition', '～と（條件）', 'dictionary-form', ['conditions'], '動詞辭書形＋と', '表示自然結果、必然結果或固定操作結果。', 'このフルーツを食べると、気分がよくなります。', '吃了這種水果，心情會變好。'),
    p('ba-condition', '～ば', 'conditions', [], '動詞ば形；い形容詞去い＋ければ', '表示條件；後句常描述條件成立時的結果。', '時間があれば、行きます。', '如果有時間就去。'),

    p('tai', '～たいです', 'masu-form', [], '動詞ます形去ます＋たいです', '表示說話者想做某事。', '日本へ行きたいです。', '我想去日本。'),
    p('nagara', '～ながら', 'masu-form', [], '動詞ます形去ます＋ながら', '表示同一主體一邊做前項，一邊做後項。', '音楽を聞きながら勉強します。', '一邊聽音樂一邊讀書。'),
    p('ni-iku', '～に行きます', 'masu-form', [], '動詞ます形去ます＋に行きます', '表示為了做某事而前往某處。', '本を買いに行きます。', '我去買書。'),
    p('yasui', '～やすいです', 'masu-form', [], '動詞ます形去ます＋やすいです', '表示某動作容易做。', 'このペンは書きやすいです。', '這支筆很好寫。'),
    p('nikui', '～にくいです', 'masu-form', [], '動詞ます形去ます＋にくいです', '表示某動作不容易做。', 'この漢字は覚えにくいです。', '這個漢字很難記。'),

    p('i-adjective-change', 'い形容詞變化', 'adjectives', [], '原形；否定：去い＋くない；過去：去い＋かった', 'いい的否定與過去形是不規則的：よくない、よかった。', 'あの人はとてもやさしいです。', '那個人非常溫柔。'),
    p('na-adjective-change', 'な形容詞變化', 'adjectives', [], '名詞前＋な；否定＋ではない；過去＋だった', 'な形容詞在名詞前接な；句尾可接です、でした等。', '静かな町に住みたいです。', '想住在安靜的城鎮。'),
    p('adjective-te', '形容詞て形', 'adjectives', [], 'い形容詞去い＋くて；な形容詞／名詞＋で', '用於連接形容詞或名詞描述。', 'この部屋は静かで、きれいです。', '這個房間安靜又漂亮。', ['な形容詞接でも時，同樣先使用語幹＋で：不便でも、住みたいです。', '常見混淆：不便ても → 不便でも。']),
    p('adjective-past', '形容詞過去式', 'adjectives', [], 'い形容詞去い＋かった；な形容詞／名詞＋だった', '描述過去的狀態。', '昨日は寒かったです。', '昨天很冷。'),
    p('adjective-negative', '形容詞否定', 'adjectives', [], 'い形容詞去い＋くない；な形容詞／名詞＋ではない', '描述否定狀態；い形容詞いい的否定為よくない。', 'この店は高くないです。', '這家店不貴。'),
    p('noun-connection', '名詞接續', 'adjectives', [], '名詞＋の＋名詞；名詞述語＋です／でした', '名詞修飾另一個名詞時使用の；句尾可搭配時態及否定。', '日本の生活は大変でした。', '日本的生活很辛苦。')
  ];

  var examples = [
    { japanese: '昨日、音楽を聞いて、日本語を勉強しました。', chinese: '昨天聽音樂，然後學日文。', patternIds: ['te-connect'] },
    { japanese: '疲れていても、勉強します。', chinese: '即使很累也要讀書。', patternIds: ['te-mo'] },
    { japanese: '勉強しても、難しいです。', chinese: '即使讀書還是很難。', patternIds: ['te-mo'] },
    { japanese: '昨日、音楽を聞いたり、日本語を勉強したりしました。', chinese: '昨天聽音樂、學日文等等。', patternIds: ['tari-tari'] },
    { japanese: '週末、映画を見たり、友達と話したりしました。', chinese: '週末看電影、跟朋友聊天等等。', patternIds: ['tari-tari'] },
    { japanese: '日本に行ったとき、カメラを買いました。', chinese: '去日本的時候買了相機。', patternIds: ['toki'] },
    { japanese: '日本らしくないお土産は買わないつもりです。', chinese: '不打算買沒有日本特色的伴手禮。', patternIds: ['nai-tsumori'] },
    { japanese: 'このフルーツを食べると、気分がよくなります。', chinese: '吃了這種水果，心情會變好。', patternIds: ['to-condition'] },
    { japanese: 'あの交差点を渡ると、左にコンビニがあります。', chinese: '過了那個十字路口，左邊有便利商店。', patternIds: ['to-condition'] },
    { japanese: '日本に行くとき、カメラを買いました。', chinese: '去日本的時候買了相機。', patternIds: ['toki'] },
    { japanese: 'きれいなお守りがほしいです。', chinese: '想要漂亮的御守。', patternIds: ['na-adjective-change'] },
    { japanese: '日本の生活は大変でした。', chinese: '日本的生活很辛苦。', patternIds: ['na-adjective-change', 'noun-connection'] },
    { japanese: '安かったら、買います。', chinese: '如果便宜的話就買。', patternIds: ['tara', 'i-adjective-change'] },
    { japanese: '不便でも、住みたいです。', chinese: '即使不方便也想住。', patternIds: ['te-mo'] },
    { japanese: 'あの人はとてもやさしいです。', chinese: '那個人非常溫柔。', patternIds: ['i-adjective-change'] },
    { japanese: '日本に1回しか行ったことがありません。', chinese: '只去過日本一次。', patternIds: ['shika-negative'] },
    { japanese: '昨日は3時間しか寝ませんでした。', chinese: '昨天只睡了三個小時。', patternIds: ['shika-negative'] },
    { japanese: 'このレストランは現金しか使えません。', chinese: '這間餐廳只能使用現金。', patternIds: ['shika-negative'] },
    { japanese: '湖しか見えません。', chinese: '只能看見湖。', patternIds: ['shika-negative', 'miru-mieru-mirareru'] },
    { japanese: 'アニメしか見ません。', chinese: '只看動畫。', patternIds: ['shika-negative', 'miru-mieru-mirareru'] },
    { japanese: '1回しか行きません。', chinese: '只有一次（帶有限的語感）。', patternIds: ['shika-vs-dake'] },
    { japanese: '1回だけ行きます。', chinese: '只去一次（中性陳述）。', patternIds: ['shika-vs-dake'] },
    { japanese: '自転車に乗れませんでした。', chinese: '沒辦法騎腳踏車。', patternIds: ['potential-ability'] },
    { japanese: 'PayPayで払えます。', chinese: '可以用 PayPay 付款。', patternIds: ['potential-ability'] },
    { japanese: 'おにぎりを作れます。', chinese: '會做飯糰。', patternIds: ['potential-ability'] },
    { japanese: 'ピアノが弾けます。', chinese: '會彈鋼琴。', patternIds: ['potential-ability'] },
    { japanese: '日本語が話せます。', chinese: '會說日文。', patternIds: ['potential-vs-koto'] },
    { japanese: '日本語を話すことができます。', chinese: '會說日文。', patternIds: ['potential-vs-koto'] },
    { japanese: 'アニメを見ます。', chinese: '看動畫。', patternIds: ['miru-mieru-mirareru'] },
    { japanese: '湖が見えます。', chinese: '看得見湖。', patternIds: ['miru-mieru-mirareru'] },
    { japanese: 'アニメが見られます。', chinese: '可以觀看動畫。', patternIds: ['miru-mieru-mirareru'] },
    { japanese: 'ここから映画が見られます。', chinese: '從這裡可以看電影。', patternIds: ['miru-mieru-mirareru'] },
    { japanese: '私はバイクに乗ることができます。', chinese: '我會騎機車。', patternIds: ['particles-ni-de-wo', 'potential-vs-koto'] },
    { japanese: '日本に行きます。', chinese: '去日本。', patternIds: ['particles-ni-de-wo'] },
    { japanese: '友達に教えます。', chinese: '教朋友。', patternIds: ['particles-ni-de-wo'] },
    { japanese: '図書館で勉強します。', chinese: '在圖書館讀書。', patternIds: ['particles-ni-de-wo'] },
    { japanese: 'バスで行きます。', chinese: '搭公車去。', patternIds: ['particles-ni-de-wo'] },
    { japanese: '日本語を勉強します。', chinese: '學日文。', patternIds: ['particles-ni-de-wo'] },
    { japanese: 'おばあちゃんは私に日本語を教えてくれます。', chinese: '奶奶教我日文。', patternIds: ['particles-ni-de-wo'] },
    { japanese: '私は母のために皿を洗います。', chinese: '我為了媽媽洗碗。', patternIds: ['particles-ni-de-wo'] },
    { japanese: '簡単な料理なら作れます。', chinese: '如果是簡單的料理，我會做。', patternIds: ['nara-condition', 'potential-ability'], source: '11/9–11/11 作業' },
    { japanese: '木曜日なら行けます。', chinese: '如果是星期四，我可以去。', patternIds: ['nara-condition', 'potential-ability'], source: '11/9–11/11 作業' },
    { japanese: '中国語と台湾語なら話せます。', chinese: '如果是中文和台語，我會說。', patternIds: ['nara-condition', 'potential-ability'], source: '11/9–11/11 作業' },
    { japanese: '景色の絵なら描けます。', chinese: '如果是風景畫，我會畫。', patternIds: ['nara-condition', 'potential-ability'], source: '11/9–11/11 作業' },
    { japanese: '料理ができますか。', chinese: '你會做菜嗎？', patternIds: ['nara-condition'], source: '11/9–11/11 作業' },
    { japanese: '着てみたいです。', chinese: '想試著穿穿看。', patternIds: ['te-miru'], source: '11/9–11/11 作業' },
    { japanese: '作ってみました。', chinese: '試著做做看了。', patternIds: ['te-miru'], source: '11/9–11/11 作業' },
    { japanese: '読んでみてください。', chinese: '請試著讀讀看。', patternIds: ['te-miru'], source: '11/9–11/11 作業' },
    { japanese: 'どこで売ったらいいですか。', chinese: '在哪裡賣比較好呢？', patternIds: ['tara-ii-desuka'], source: '11/9–11/11 作業' },
    { japanese: 'どこに行ったらいいですか。', chinese: '去哪裡比較好呢？', patternIds: ['tara-ii-desuka'], source: '11/9–11/11 作業' },
    { japanese: 'どうしたらいいですか。', chinese: '該怎麼辦才好呢？', patternIds: ['tara-ii-desuka'], source: '11/9–11/11 作業' },
    { japanese: '時間があったら、日本語を勉強します。', chinese: '如果有時間，就學日文。', patternIds: ['tara'], source: '11/9–11/11 作業' },
    { japanese: '日本に行ったら、写真を撮りたいです。', chinese: '如果去日本的話，想拍照。', patternIds: ['tara'], source: '11/9–11/11 作業' },
    { japanese: 'すみません、今から出張するんです。', chinese: '不好意思，我現在要去出差。', patternIds: [], tags: ['んです'], source: '11/9–11/11 作業' },
    { japanese: '今日は車で来たんです。', chinese: '今天是開車來的。', patternIds: [], tags: ['んです'], source: '11/9–11/11 作業' },
    { japanese: '明日はちょっと用事があるんです。', chinese: '明天有點事情。', patternIds: [], tags: ['んです'], source: '11/9–11/11 作業' },
    { japanese: '時間がないんです。', chinese: '沒有時間。', patternIds: [], tags: ['んです'], note: '訂正：時間があわないんです → 時間がないんです。時間が合わない是「時間對不上／不合適」的意思。', source: '11/9–11/11 作業' },
    { japanese: 'バイクには乗れますが、車は運転できません。', chinese: '我會騎機車，但不會開車。', patternIds: ['potential-ability'], tags: ['生活造句'], source: '11/9–11/11 作業' },
    { japanese: 'おばあちゃんが日本語を教えてくれます。', chinese: '阿嬤教我日文。', patternIds: ['particles-ni-de-wo'], tags: ['生活造句'], source: '11/9–11/11 作業' },
    { japanese: '母のために皿を洗います。', chinese: '我幫媽媽洗碗。', patternIds: ['particles-ni-de-wo'], tags: ['生活造句'], source: '11/9–11/11 作業' },
    { japanese: '毎日、買い物をして、料理をする以外は、英語と日本語の勉強をしています。', chinese: '我每天除了買菜、煮飯以外，都在學英文和日文。', patternIds: [], tags: ['生活造句'], source: '11/9–11/11 作業' },
    { japanese: 'キッチンで水が出ません。', chinese: '廚房裡沒有水流出來。', patternIds: ['particles-ni-de-wo'], tags: ['生活造句'], note: 'で表示事情發生的場所。', source: '11/9–11/11 作業' },
    { japanese: 'ごみはアパートの前のごみ置き場に出してください。', chinese: '請把垃圾拿到公寓前的垃圾放置處。', patternIds: ['te-kudasai', 'particles-ni-de-wo'], note: 'に表示垃圾放置的目的地。', source: '11/9–11/11 作業' },
    { japanese: '私の得意なことは絵を描くことです。', chinese: '我的擅長項目是畫畫。', patternIds: ['verb-koto-nominalization'], tags: ['生活日文'], source: '11/9–11/11 作業' },
    { japanese: '夢を見る。', chinese: '做夢。', patternIds: [], tags: ['生活日文・慣用表現'], source: '11/9–11/11 作業' },
    { japanese: '簡単な料理。', chinese: '簡單的料理。', patternIds: ['na-adjective-change'], tags: ['生活日文'], source: '11/9–11/11 作業' },
    { japanese: '景色の絵。', chinese: '風景畫。', patternIds: ['noun-connection'], tags: ['生活日文'], source: '11/9–11/11 作業' },
    { japanese: '日本語を教える。', chinese: '教日文。', patternIds: ['particles-ni-de-wo'], tags: ['生活日文'], source: '11/9–11/11 作業' },
    { japanese: '車を運転する。', chinese: '開車。', patternIds: ['particles-ni-de-wo'], tags: ['生活日文'], source: '11/9–11/11 作業' },
    { japanese: '皿を洗う。', chinese: '洗碗。', patternIds: ['particles-ni-de-wo'], tags: ['生活日文'], source: '11/9–11/11 作業' }
  ];

  var verbConjugations = [
    { dictionary: '行く', reading: 'いく', type: 'godan', forms: { te: ['行って', 'いって'], ta: ['行った', 'いった'], nai: ['行かない', 'いかない'], masu: ['行きます', 'いきます'], potential: ['行ける', 'いける'], volitional: ['行こう', 'いこう'], conditional: ['行けば', 'いけば'], imperative: ['行け', 'いけ'] } },
    { dictionary: '帰る', reading: 'かえる', type: 'godan', forms: { te: ['帰って', 'かえって'], ta: ['帰った', 'かえった'], nai: ['帰らない', 'かえらない'], masu: ['帰ります', 'かえります'], potential: ['帰れる', 'かえれる'], volitional: ['帰ろう', 'かえろう'], conditional: ['帰れば', 'かえれば'], imperative: ['帰れ', 'かえれ'] } },
    { dictionary: '見る', reading: 'みる', type: 'ichidan', forms: { te: ['見て', 'みて'], ta: ['見た', 'みた'], nai: ['見ない', 'みない'], masu: ['見ます', 'みます'], potential: ['見られる', 'みられる'], volitional: ['見よう', 'みよう'], conditional: ['見れば', 'みれば'], imperative: ['見ろ', 'みろ'] } },
    { dictionary: '泳ぐ', reading: 'およぐ', type: 'godan', forms: { te: ['泳いで', 'およいで'], ta: ['泳いだ', 'およいだ'], nai: ['泳がない', 'およがない'], masu: ['泳ぎます', 'およぎます'], potential: ['泳げる', 'およげる'], volitional: ['泳ごう', 'およごう'], conditional: ['泳げば', 'およげば'], imperative: ['泳げ', 'およげ'] } },
    { dictionary: '飲む', reading: 'のむ', type: 'godan', forms: { te: ['飲んで', 'のんで'], ta: ['飲んだ', 'のんだ'], nai: ['飲まない', 'のまない'], masu: ['飲みます', 'のみます'], potential: ['飲める', 'のめる'], volitional: ['飲もう', 'のもう'], conditional: ['飲めば', 'のめば'], imperative: ['飲め', 'のめ'] } },
    { dictionary: '書く', reading: 'かく', type: 'godan', forms: { te: ['書いて', 'かいて'], ta: ['書いた', 'かいた'], nai: ['書かない', 'かかない'], masu: ['書きます', 'かきます'], potential: ['書ける', 'かける'], volitional: ['書こう', 'かこう'], conditional: ['書けば', 'かけば'], imperative: ['書け', 'かけ'] } },
    { dictionary: 'いる', reading: 'いる', type: 'ichidan', forms: { te: ['いて', 'いて'], ta: ['いた', 'いた'], nai: ['いない', 'いない'], masu: ['います', 'います'], potential: ['いられる', 'いられる'], volitional: ['いよう', 'いよう'], conditional: ['いれば', 'いれば'], imperative: ['いろ', 'いろ'] } },
    { dictionary: '待つ', reading: 'まつ', type: 'godan', forms: { te: ['待って', 'まって'], ta: ['待った', 'まった'], nai: ['待たない', 'またない'], masu: ['待ちます', 'まちます'], potential: ['待てる', 'まてる'], volitional: ['待とう', 'まとう'], conditional: ['待てば', 'まてば'], imperative: ['待て', 'まて'] } },
    { dictionary: '寝る', reading: 'ねる', type: 'ichidan', forms: { te: ['寝て', 'ねて'], ta: ['寝た', 'ねた'], nai: ['寝ない', 'ねない'], masu: ['寝ます', 'ねます'], potential: ['寝られる', 'ねられる'], volitional: ['寝よう', 'ねよう'], conditional: ['寝れば', 'ねれば'], imperative: ['寝ろ', 'ねろ'] } },
    { dictionary: '遊ぶ', reading: 'あそぶ', type: 'godan', forms: { te: ['遊んで', 'あそんで'], ta: ['遊んだ', 'あそんだ'], nai: ['遊ばない', 'あそばない'], masu: ['遊びます', 'あそびます'], potential: ['遊べる', 'あそべる'], volitional: ['遊ぼう', 'あそぼう'], conditional: ['遊べば', 'あそべば'], imperative: ['遊べ', 'あそべ'] } },
    { dictionary: '聞く', reading: 'きく', type: 'godan', forms: { te: ['聞いて', 'きいて'], ta: ['聞いた', 'きいた'], nai: ['聞かない', 'きかない'], masu: ['聞きます', 'ききます'], potential: ['聞ける', 'きける'], volitional: ['聞こう', 'きこう'], conditional: ['聞けば', 'きけば'], imperative: ['聞け', 'きけ'] } },
    { dictionary: '食べる', reading: 'たべる', type: 'ichidan', forms: { te: ['食べて', 'たべて'], ta: ['食べた', 'たべた'], nai: ['食べない', 'たべない'], masu: ['食べます', 'たべます'], potential: ['食べられる', 'たべられる'], volitional: ['食べよう', 'たべよう'], conditional: ['食べれば', 'たべれば'], imperative: ['食べろ', 'たべろ'] } },
    { dictionary: '話す', reading: 'はなす', type: 'godan', forms: { te: ['話して', 'はなして'], ta: ['話した', 'はなした'], nai: ['話さない', 'はなさない'], masu: ['話します', 'はなします'], potential: ['話せる', 'はなせる'], volitional: ['話そう', 'はなそう'], conditional: ['話せば', 'はなせば'], imperative: ['話せ', 'はなせ'] } },
    { dictionary: '会う', reading: 'あう', type: 'godan', forms: { te: ['会って', 'あって'], ta: ['会った', 'あった'], nai: ['会わない', 'あわない'], masu: ['会います', 'あいます'], potential: ['会える', 'あえる'], volitional: ['会おう', 'あおう'], conditional: ['会えば', 'あえば'], imperative: ['会え', 'あえ'] } },
    { dictionary: 'ある', reading: 'ある', type: 'special', forms: { te: ['あって', 'あって'], ta: ['あった', 'あった'], nai: ['ない', 'ない'], masu: ['あります', 'あります'], potential: ['あり得る', 'ありうる'], volitional: ['あろう', 'あろう'], conditional: ['あれば', 'あれば'], imperative: ['あれ', 'あれ'] } },
    { dictionary: 'する', reading: 'する', type: 'irregular', forms: { te: ['して', 'して'], ta: ['した', 'した'], nai: ['しない', 'しない'], masu: ['します', 'します'], potential: ['できる', 'できる'], volitional: ['しよう', 'しよう'], conditional: ['すれば', 'すれば'], imperative: ['しろ', 'しろ'] } },
    { dictionary: '来る', reading: 'くる', type: 'irregular', forms: { te: ['来て', 'きて'], ta: ['来た', 'きた'], nai: ['来ない', 'こない'], masu: ['来ます', 'きます'], potential: ['来られる', 'こられる'], volitional: ['来よう', 'こよう'], conditional: ['来れば', 'くれば'], imperative: ['来い', 'こい'] } }
  ];

  var ndesuGroups = [{"id":"verb","label":"動詞","rows":[["行きます","行く","行かない","行った","行かなかった","いきます","いく"],["帰（かえ）ります","帰る","帰らない","帰った","帰らなかった","かえります","かえる"],["見（み）ます","みる","みない","みた","みなかった","みます","みる"],["泳（およ）ぎます","およぐ","およがない","およいだ","およがなかった","およぎます","およぐ"],["飲（の）みます","のむ","のまない","のんだ","のまなかった","のみます","のむ"],["書（か）きます","かく","かかない","かいた","かかなかった","かきます","かく"],["います","いる","いない","いた","いなかった","います","いる"],["待（ま）ちます","まつ","またない","まった","またなかった","まちます","まつ"],["寝（ね）ます","ねる","ねない","ねた","ねなかった","ねます","ねる"],["遊（あそ）びます","あそぶ","あそばない","あそんだ","あそばなかった","あそびます","あそぶ"],["聞（き）きます","きく","きかない","きいた","きかなかった","ききます","きく"],["食（た）べます","たべる","たべない","たべた","たべなかった","たべます","たべる"],["話（はな）します","はなす","はなさない","はなした","はなさなかった","はなします","はなす"],["会（あ）います","あう","あわない","あった","あわなかった","あいます","あう"],["します","する","しない","した","しなかった","します","する"],["来（き）ます","くる","こない","きた","こなかった","きます","くる"]]},{"id":"special","label":"あります・特例","rows":[["あります","ある","ない","あった","なかった","あります","ある"]]},{"id":"iadj","label":"い形容詞","rows":[["ほしいです","ほしい","ほしくない","ほしかった","ほしくなかった","ほしいです","ほしい"],["食（た）べたいです","たべたい","たべたくない","たべたかった","たべたくなかった","たべたいです","たべたい"],["いいです","いい","よくない","よかった","よくなかった","いいです","いい"],["小さいです","ちいさい","ちいさくない","ちいさかった","ちいさくなかった","ちいさいです","ちいさい"]]},{"id":"naadj","label":"な形容詞","rows":[["綺麗（きれい）です","きれい","きれいじゃない","きれいだった","きれいじゃなかった","きれいです","きれい"],["静かです","しずか","しずかじゃない","しずかだった","しずかじゃなかった","しずかです","しずか"],["暇（ひま）です","ひま","ひまじゃない","ひまだった","ひまじゃなかった","ひまです","ひま"]]}];

  root.JapaneseGrammarData = { categories: categories, patterns: patterns, examples: examples, verbConjugations: verbConjugations, ndesuGroups: ndesuGroups };
})(window);
