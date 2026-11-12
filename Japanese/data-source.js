(function () {
  'use strict';

  var fallback = window.JapaneseGrammarData;
  var endpoint = String(window.JAPANESE_GRAMMAR_API_URL || '').trim();

  function isNotebookData(data) {
    return data && Array.isArray(data.categories) && Array.isArray(data.patterns) &&
      Array.isArray(data.examples) && Array.isArray(data.verbConjugations) &&
      Array.isArray(data.ndesuGroups);
  }

  if (!endpoint) {
    window.JapaneseGrammarDataReady = Promise.resolve(fallback);
    window.JapaneseGrammarDataSource = 'local';
    return;
  }

  function requestJsonp(url) {
    return new Promise(function (resolve, reject) {
      var callbackName = 'JapaneseGrammarCallback_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
      var script = document.createElement('script');
      var separator = url.indexOf('?') >= 0 ? '&' : '?';
      var timeout = window.setTimeout(function () {
        cleanup();
        reject(new Error('Timed out while loading Apps Script data.'));
      }, 15000);

      function cleanup() {
        window.clearTimeout(timeout);
        delete window[callbackName];
        if (script.parentNode) script.parentNode.removeChild(script);
      }

      window[callbackName] = function (data) {
        cleanup();
        resolve(data);
      };
      script.onerror = function () {
        cleanup();
        reject(new Error('Could not load Apps Script data.'));
      };
      script.src = url + separator + 'prefix=' + encodeURIComponent(callbackName);
      document.head.appendChild(script);
    });
  }

  window.JapaneseGrammarDataReady = requestJsonp(endpoint)
    .then(function (data) {
      if (!isNotebookData(data)) throw new Error('Apps Script response is missing notebook data.');
      window.JapaneseGrammarDataSource = 'apps-script';
      return data;
    })
    .catch(function (error) {
      console.warn('Could not load cloud grammar data; using the local copy.', error);
      window.JapaneseGrammarDataSource = 'local-fallback';
      if (isNotebookData(fallback)) return fallback;
      throw error;
    });
})();
