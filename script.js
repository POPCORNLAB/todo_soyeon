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
}

function addTodo() {
  const title = input.value.trim();
  if (title === '') {
    return;
  }

  const item = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const text = document.createElement('div');
  text.className = 'text';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'title';
  titleSpan.textContent = title;
  text.append(titleSpan);

  if (timeInput.value !== '') {
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = '⏰ ' + timeInput.value;
    text.append(meta);
  }

  const minutes = Number(minutesInput.value);
  if (minutes >= 1) {
    const timerButton = document.createElement('button');
    timerButton.type = 'button';
    timerButton.className = 'timer-button';
    timers.set(timerButton, { remaining: Math.floor(minutes) * 60, running: false, id: null });
    showTimer(timerButton);
    item.timerButton = timerButton;
  }

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '삭제';

  item.append(checkbox, text);
  if (item.timerButton) {
    item.append(item.timerButton);
  }
  item.append(deleteButton);
  list.insertBefore(item, firstDoneItem() || null);
  updateSummary();

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

list.addEventListener('click', (event) => {
  const button = event.target.closest('.timer-button');
  if (button) {
    toggleTimer(button);
  }
});

list.addEventListener('change', (event) => {
  const timerButton = event.target.closest('li').timerButton;
  if (timerButton && event.target.checked && timers.get(timerButton).running) {
    stopTimer(timerButton);
    showTimer(timerButton);
  }
  moveItem(event.target.closest('li'));
  updateSummary();
  if (event.target.checked && remainingCount.textContent === '0') {
    const pick = Math.floor(Math.random() * praiseMessages.length);
    praiseMessage.textContent = praiseMessages[pick];
    praise.showModal();
  }
});

updateSummary();

document.getElementById('praise-close').addEventListener('click', () => praise.close());
