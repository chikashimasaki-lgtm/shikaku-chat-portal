/**
 * 配布用の自己完結HTMLを組み立てる。
 *
 *   node build_html.js
 *
 * src/ のテンプレート・CSS・JS・設定から、外部ファイルを一切参照しない
 * index.html（ポータル）と fp3/index.html, gkentei/index.html, boki3/index.html（各チャット）を生成する。
 * 生成物は直接編集せず、必ず src/ を編集してこのスクリプトを再実行すること。
 */
const fs = require('fs');
const path = require('path');

const root = __dirname;
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, content) => {
  const full = path.join(root, p);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
};

const config = require('./src/config.js');
const exams = require('./src/exams.js');

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildChatPage(exam) {
  const template = read('src/chat-template.html');
  const css = read('src/chat-style.css');
  const js = read('src/chat-app.js');

  const suggestionsHtml = exam.suggestions
    .map((s) => `      <button class="suggestion-chip" onclick="sendSuggestion(this)">${escapeHtml(s)}</button>`)
    .join('\n');

  let html = template
    .replace('/*__CHAT_STYLE__*/', () => css)
    .replace('/*__CHAT_APP__*/', () => js)
    .replace(/\{\{TITLE\}\}/g, exam.title)
    .replace(/\{\{ICON\}\}/g, exam.icon)
    .replace(/\{\{THEME_COLOR_DARK\}\}/g, exam.themeColorDark)
    .replace(/\{\{THEME_COLOR\}\}/g, exam.themeColor)
    .replace(/\{\{WELCOME_HEADLINE\}\}/g, exam.welcomeHeadline)
    .replace(/\{\{WELCOME_BODY\}\}/g, exam.welcomeBody)
    .replace('{{SUGGESTIONS_HTML}}', suggestionsHtml)
    .replace(/\{\{EXAM_ID\}\}/g, exam.id)
    .replace(/\{\{GAS_WEBAPP_URL\}\}/g, config.GAS_WEBAPP_URL)
    .replace(/\{\{SHARED_SECRET\}\}/g, config.SHARED_SECRET);

  const remaining = html.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) throw new Error('プレースホルダが残っています: ' + remaining.join(', '));

  return html;
}

function buildPortalPage() {
  const template = read('src/portal-template.html');
  const css = read('src/portal-style.css');

  const cardsHtml = exams
    .map(
      (e) => `      <a class="card" href="${e.path}/">
        <div class="icon">${e.icon}</div>
        <h2>${escapeHtml(e.title)}</h2>
        <p>${escapeHtml(e.portalDesc)}</p>
        <div class="go">開く →</div>
      </a>`
    )
    .join('\n');

  let html = template
    .replace('/*__PORTAL_STYLE__*/', () => css)
    .replace('{{CARDS_HTML}}', cardsHtml);

  const remaining = html.match(/\{\{[A-Z_]+\}\}/g);
  if (remaining) throw new Error('プレースホルダが残っています: ' + remaining.join(', '));

  return html;
}

function main() {
  write('index.html', buildPortalPage());
  console.log('作成: index.html（ポータル）');

  exams.forEach((exam) => {
    const html = buildChatPage(exam);
    write(path.join(exam.path, 'index.html'), html);
    const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
    console.log('作成: ' + exam.path + '/index.html（' + kb + ' KB）');
  });
}

main();
