const form = document.querySelector('form');
const input = document.getElementById('todo-input');
const addButton = form.querySelector('button');
const list = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const remainingList = document.getElementById('remaining-list');
const remainingEmpty = document.getElementById('remaining-empty');

function renderRemaining() {
  remainingList.replaceChildren();
  let count = 0;

  list.querySelectorAll('li').forEach((item) => {
    const done = item.querySelector('input[type="checkbox"]').checked;
    if (done) {
      return;
    }
    const line = document.createElement('li');
    line.textContent = item.querySelector('span').textContent;
    remainingList.append(line);
    count += 1;
  });

  remainingCount.textContent = count;
  remainingList.hidden = count === 0;
  remainingEmpty.hidden = count !== 0;
}

function addTodo() {
  const title = input.value.trim();
  if (title === '') {
    return;
  }

  const item = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';

  const text = document.createElement('span');
  text.textContent = title;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '삭제';

  item.append(checkbox, text, deleteButton);
  list.append(item);
  renderRemaining();

  input.value = '';
  input.focus();
}

addButton.addEventListener('click', addTodo);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

list.addEventListener('change', renderRemaining);

renderRemaining();
