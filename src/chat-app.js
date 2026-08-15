// GAS_WEBAPP_URL / SHARED_SECRET / EXAM_ID は build_html.js がビルド時にこのファイルの
// 直前へ `const GAS_WEBAPP_URL = '...';` 等として注入する。

let isLoading = false;
let history = []; // 会話履歴 [{ role:'user'|'bot', text }]

const WELCOME_HTML = document.getElementById('messages').innerHTML;

function resetChat() {
  if (history.length && !confirm('会話をリセットして最初の画面に戻りますか？')) return;
  history = [];
  setLoading(false);
  document.getElementById('messages').innerHTML = WELCOME_HTML;
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
}

function sendSuggestion(btn) {
  const text = btn.textContent.trim().replace(/^[^\p{L}\p{N}]+/u, '');
  document.getElementById('userInput').value = text;
  sendMessage();
}

function sendChapter(el) {
  const name = el.querySelector('.chapter-name').textContent.trim();
  document.getElementById('userInput').value = name + 'について教えて';
  sendMessage();
}

async function sendMessage() {
  if (isLoading) return;
  const input = document.getElementById('userInput');
  const text = input.value.trim();
  if (!text) return;

  const welcome = document.querySelector('.welcome');
  if (welcome) welcome.remove();

  const priorHistory = history.slice();
  appendMessage('user', text);
  history.push({ role: 'user', text: text });
  input.value = '';
  input.style.height = 'auto';

  const typingEl = appendTyping();
  setLoading(true);

  try {
    const res = await callBackend(text, priorHistory);
    typingEl.remove();
    setLoading(false);
    if (res.ok) {
      appendMessage('bot', res.message);
      history.push({ role: 'bot', text: res.message });
    } else {
      appendMessage('bot', '⚠️ ' + res.error);
    }
  } catch (err) {
    typingEl.remove();
    setLoading(false);
    appendMessage('bot', '⚠️ 通信エラーが発生しました: ' + (err && err.message ? err.message : err));
  }
}

async function callBackend(message, priorHistory) {
  const res = await fetch(GAS_WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // CORSプリフライト回避
    body: JSON.stringify({
      secret: SHARED_SECRET,
      examId: EXAM_ID,
      message: message,
      history: priorHistory,
    }),
  });
  return res.json();
}

function appendMessage(role, text) {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message ' + role;

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = role === 'bot' ? '🤖' : '🙋';

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  if (role === 'bot') {
    bubble.innerHTML = renderMarkdown(text);
  } else {
    bubble.textContent = text;
  }

  div.appendChild(avatar);
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

// 簡易Markdown→HTML（XSS対策でエスケープ後に変換）
function renderMarkdown(md) {
  let h = String(md).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const codeBlocks = [];
  h = h.replace(/```[\w]*\n?([\s\S]*?)```/g, function (_, c) {
    codeBlocks.push(c.replace(/\n$/, ''));
    return ' CB' + (codeBlocks.length - 1) + ' ';
  });
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  const lines = h.split('\n');
  let out = '', listType = null;
  const closeList = function () { if (listType) { out += '</' + listType + '>'; listType = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if (m = line.match(/^\s*[-*・]\s+(.*)$/)) {
      if (listType !== 'ul') { closeList(); out += '<ul>'; listType = 'ul'; }
      out += '<li>' + m[1] + '</li>';
    } else if (m = line.match(/^\s*\d+[.)]\s+(.*)$/)) {
      if (listType !== 'ol') { closeList(); out += '<ol>'; listType = 'ol'; }
      out += '<li>' + m[1] + '</li>';
    } else if (m = line.match(/^\s*#{1,4}\s+(.*)$/)) {
      closeList(); out += '<p><strong>' + m[1] + '</strong></p>';
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList(); out += '<p>' + line + '</p>';
    }
  }
  closeList();
  out = out.replace(/ CB(\d+) /g, function (_, n) {
    return '<pre>' + codeBlocks[n] + '</pre>';
  });
  return out;
}

function appendTyping() {
  const messages = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'message bot';

  const avatar = document.createElement('div');
  avatar.className = 'avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'bubble typing';
  bubble.innerHTML = '<span></span><span></span><span></span>';

  div.appendChild(avatar);
  div.appendChild(bubble);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div;
}

function setLoading(state) {
  isLoading = state;
  document.getElementById('sendBtn').disabled = state;
  document.getElementById('userInput').disabled = state;
}
