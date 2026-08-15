# 資格学習チャットボットポータル

FP3級・G検定・簿記3級の学習内容をナレッジにしたチャットボット3本を、1つのポータルページからまとめて使えるようにしたWebアプリです。GitHub Pagesで公開します。

## 何をするか

- ポータルのトップページから、資格ごとのチャット画面（FP3級／G検定／簿記3級）へ移動できます
- 各チャットでは、あらかじめ用意した各資格の要点ナレッジをもとに、Google Geminiが日本語で質問に答えます
- 質問内容と会話履歴は、バックエンド（Google Apps Script、リポジトリ`shikaku-chat-api`）を経由してGoogle Geminiに送信されます。**それ以外の外部送信はありません**（アクセス解析等も組み込んでいません）

## 使い方

公開後のポータルURLを開き、カードから使いたい資格チャットを選んで質問を入力してください。

## ファイル構成

```
src/
  config.js              # GASバックエンドのURL・共有シークレット
  exams.js                # 資格ごとのUI設定
  chat-style.css / chat-app.js / chat-template.html   # チャット画面（共通ロジック）
  portal-style.css / portal-template.html             # ポータルトップページ
build_html.js              # src/ から配布用の自己完結HTMLを生成
index.html, fp3/index.html, gkentei/index.html, boki3/index.html   # [生成物] 直接編集しない
```

## 開発コマンド

```bash
npm run build   # src/ の内容から index.html / fp3/index.html / gkentei/index.html / boki3/index.html を再生成
```

`src/` 配下を編集したら、必ず `npm run build` を実行してから commit する。生成物（`index.html`等）を直接編集しても、次回ビルドで上書きされる。

## バックエンドとの連携

このリポジトリ単体では動作せず、`shikaku-chat-api`（Google Apps Script）のデプロイが必要です。
`src/config.js` の `GAS_WEBAPP_URL` にデプロイ後の `/exec` URLを、`SHARED_SECRET` に`shikaku-chat-api`のスクリプトプロパティと同じ値を設定してからビルドしてください。
