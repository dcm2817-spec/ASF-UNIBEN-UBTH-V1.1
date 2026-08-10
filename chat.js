const chatWindow = document.getElementById('chat-window');

function addMessage(role, text) {
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.textContent = text;
  chatWindow.appendChild(div);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function findAnswer(question) {
  const q = question.toLowerCase();
  const hit = FAQ.find((entry) => entry.keywords.some((k) => q.includes(k)));
  return hit ? hit.answer : FAQ_FALLBACK;
}

addMessage('bot', "Hi! I'm the ASF FAQ assistant. Ask me about membership, ministry groups, meetings, or leadership.");

document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const question = input.value.trim();
  if (!question) return;
  addMessage('user', question);
  addMessage('bot', findAnswer(question));
  input.value = '';
});
