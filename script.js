const form = document.querySelector('form');
const input = document.getElementById('todo-input');
const addButton = form.querySelector('button');
const list = document.getElementById('todo-list');
const remainingCount = document.getElementById('remaining-count');
const totalCount = document.getElementById('total-count');
const doneCount = document.getElementById('done-count');

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

  const text = document.createElement('span');
  text.textContent = title;

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.textContent = '삭제';

  item.append(checkbox, text, deleteButton);
  list.insertBefore(item, firstDoneItem() || null);
  updateSummary();

  input.value = '';
  input.focus();
}

addButton.addEventListener('click', addTodo);

form.addEventListener('submit', (event) => {
  event.preventDefault();
  addTodo();
});

list.addEventListener('change', (event) => {
  moveItem(event.target.closest('li'));
  updateSummary();
});

updateSummary();
