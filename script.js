const form = document.querySelector('form');
const input = document.getElementById('todo-input');
const addButton = form.querySelector('button');
const timeInput = document.getElementById('todo-time');
const minutesInput = document.getElementById('todo-minutes');
const praise = document.getElementById('praise');
const praiseMessage = document.getElementById('praise-message');
const praiseMessages = [
  '오늘 할 일을 모두 해냈어요! 정말 잘했어요 🎉',
  '완벽해요! 오늘도 해냈네요 👏',
  '수고했어요, 소연! 오늘은 푹 쉬어도 좋아요 🌿',
];
const list = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const totalCount = document.getElementById('total-count');
const doneCount = document.getElementById('done-count');
const emptyMessage = document.getElementById('empty-message');

const SUPABASE_URL = 'https://hogtgdcykgikinjsoxft.supabase.co';
const SUPABASE_KEY = 'sb_publishable_mQ4agq7ibtrUGiP8HiXarA_gO_VBRzW';

async function api(query, options = {}) {
  const response = await fetch(SUPABASE_URL + '/rest/v1/todos' + query, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    throw new Error('Supabase ' + response.status);
  }
  return response.status === 204 ? null : response.json();
}

function rowQuery(item) {
  return '?id=eq.' + encodeURIComponent(item.dataset.id);
}

const timers = new Map();

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return m + ':' + s;
}

function showTimer(button) {
  const timer = timers.get(button);
  button.textContent = (timer.running ? '⏸ ' : '▶ ') + formatTime(timer.remaining);
}

function stopTimer(button) {
  const timer = timers.get(button);
  clearInterval(timer.id);
  timer.running = false;
}

function toggleTimer(button) {
  const timer = timers.get(button);
  if (timer.remaining === 0) {
    return;
  }
  if (timer.running) {
    stopTimer(button);
    showTimer(button);
    return;
  }
  const endAt = Date.now() + timer.remaining * 1000;
  timer.running = true;
  timer.id = setInterval(() => {
    timer.remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (timer.remaining === 0) {
      stopTimer(button);
      button.textContent = '시간 끝';
      button.classList.add('finished');
      return;
    }
    showTimer(button);
  }, 250);
  showTimer(button);
}

function firstDoneItem() {
  return [...list.querySelectorAll('li')].find(
    (item) => item.querySelector('input[type="checkbox"]').checked
  );
}

function moveItem(item) {
  const checked = item.querySelector('input[type="checkbox"]').checked;
  if (checked) {
    list.append(item);
    return;
  }
  const firstDone = firstDoneItem();
  if (firstDone && firstDone !== item) {
    list.insertBefore(item, firstDone);
  }
}

function updateSummary() {
  const items = list.querySelectorAll('li');
  const done = list.querySelectorAll('input[type="checkbox"]:checked').length;
  totalCount.textContent = items.length;
  doneCount.textContent = done;
  remainingCount.textContent = items.length - done;
  emptyMessage.hidden = items.length > 0;
}

function buildItem(todo) {
  const item = document.createElement('li');
  item.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = Boolean(todo.done);

  const text = document.createElement('div');
  text.className = 'text';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  titleSpan.textContent = todo.text;
  text.append(titleSpan);

  if (todo.due_time) {
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = '⏰ ' + todo.due_time.slice(0, 5);
    text.append(meta);
  }

  if (todo.timer_minutes >= 1) {
    const timerButton = document.createElement('button');
    timerButton.type = 'button';
    timerButton.className = 'timer-button';
    timers.set(timerButton, { remaining: todo.timer_minutes * 60, running: false, id: null });
    showTimer(timerButton);
    item.timerButton = timerButton;
  }

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.className = 'delete-button';
  deleteButton.textContent = '삭제';

  item.append(checkbox, text);
  if (item.timerButton) {
    item.append(item.timerButton);
  }
  item.append(deleteButton);
  return item;
}

async function addTodo() {
  const title = input.value.trim();
  if (title === '') {
    return;
  }

  const minutes = Math.floor(Number(minutesInput.value));

  try {
    const [todo] = await api('', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        text: title,
        done: false,
        due_time: timeInput.value || null,
        timer_minutes: minutes >= 1 ? minutes : null,
      }),
    });
    list.insertBefore(buildItem(todo), firstDoneItem() || null);
    updateSummary();
  } catch (error) {
    alert('할 일을 저장하지 못했어요. 잠시 뒤에 다시 해 주세요.');
    return;
  }

  input.value = '';
  timeInput.value = '';
  minutesInput.value = '';
  input.focus();
}

addButton.addEventListener('click', addTodo);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

async function deleteTodo(item) {
  try {
    await api(rowQuery(item), { method: 'DELETE' });
  } catch (error) {
    alert('할 일을 지우지 못했어요. 잠시 뒤에 다시 해 주세요.');
    return;
  }
  if (item.timerButton) {
    stopTimer(item.timerButton);
  }
  item.remove();
  updateSummary();
}

list.addEventListener('click', (event) => {
  const button = event.target.closest('.timer-button');
  if (button) {
    toggleTimer(button);
    return;
  }

  const deleteButton = event.target.closest('.delete-button');
  if (deleteButton) {
    deleteTodo(deleteButton.closest('li'));
  }
});

list.addEventListener('change', async (event) => {
  const item = event.target.closest('li');
  const checked = event.target.checked;

  try {
    await api(rowQuery(item), { method: 'PATCH', body: JSON.stringify({ done: checked }) });
  } catch (error) {
    event.target.checked = !checked;
    alert('체크를 저장하지 못했어요. 잠시 뒤에 다시 해 주세요.');
    return;
  }

  const timerButton = item.timerButton;
  if (timerButton && checked && timers.get(timerButton).running) {
    stopTimer(timerButton);
    showTimer(timerButton);
  }
  moveItem(item);
  updateSummary();
  if (checked && remainingCount.textContent === '0') {
    const pick = Math.floor(Math.random() * praiseMessages.length);
    praiseMessage.textContent = praiseMessages[pick];
    praise.showModal();
  }
});

async function loadTodos() {
  list.replaceChildren();
  try {
    const todos = await api('?select=id,text,done,created_at,due_time,timer_minutes&order=created_at.asc');
    todos.filter((todo) => !todo.done).forEach((todo) => list.append(buildItem(todo)));
    todos.filter((todo) => todo.done).forEach((todo) => list.append(buildItem(todo)));
  } catch (error) {
    alert('할 일 목록을 불러오지 못했어요. 새로고침해 주세요.');
  }
  updateSummary();
}

loadTodos();

document.getElementById('praise-close').addEventListener('click', () => praise.close());
