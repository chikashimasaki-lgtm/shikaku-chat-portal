// ビルド時にのみ読み込まれる設定（各配布HTMLにインライン埋め込みされる）。
// GAS_WEBAPP_URL はバックエンド（shikaku-chat-api）デプロイ後に発行される /exec URL に置き換える。
// SHARED_SECRET はバックエンドのスクリプトプロパティ SHARED_SECRET と同じ値にする。
module.exports = {
  GAS_WEBAPP_URL: 'https://script.google.com/macros/s/AKfycbyRmJ0BUzllzyP5nVPzz5kbzddOmMrbFiII28HgFrNuGxBRLrvQYf3qDu0y_4pXGcHX/exec',
  SHARED_SECRET: 'KsXaOFyluiW9omxeR1xjUjKvtNN4jPGH',
};
