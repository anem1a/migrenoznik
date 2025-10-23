import { MigrenoznikCore } from '../core/MigrenoznikCore.js';
import { MigraineAttack } from '../models/MigraineAttack.js';
import { DateFormatter } from '../utils/dateFormatter.js';

export const CORE = new MigrenoznikCore();

export function migraineNowButtonClicked() {
  if (CORE.isMigraineNow()) {
    endMigraineAttack();
  } else {
    startMigraineAttack();
  }
  composeMigraineDiary();
}

function startMigraineAttack() {
  CORE.toggleMigraineStatus();
  CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
  updateMigraineButtonUI(true);
}

function endMigraineAttack() {
  CORE.toggleMigraineStatus();
  CORE.closeLastMigraineAttack();
  updateMigraineButtonUI(false);
}

export function updateMigraineButtonUI(isActive) {
  const button = document.getElementById('migre-diary-main-bottom-button');
  if (!button) return;
  button.innerText = isActive
    ? 'Отметить конец мигрени'
    : 'Отметить мигрень сейчас';
}

export function composeMigraineDiary() {
  const wrapper = document.getElementById('migre-diary-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  const migraineAttacks = CORE.getMigraineAttacks();
  migraineAttacks.forEach((attack, index) => {
    const item = createDiaryItem(attack, index);
    wrapper.appendChild(item);
  });
}

function createDiaryItem(attack, index) {
  const item = document.createElement('div');
  item.className = 'migre-v1-main-diary-item';

  const title = document.createElement('b');
  title.textContent = `Запись ${index + 1}.`;
  item.appendChild(title);

  const startStr = DateFormatter.formatDateTime(attack.dtStart, Calendar);
  item.appendChild(document.createTextNode(` ${startStr}`));

  if (attack.dtEnd) {
    const endStr = DateFormatter.formatDateTime(attack.dtEnd, Calendar);
    item.appendChild(document.createTextNode(` – ${endStr} `));
    
    const deleteLink = document.createElement('a');
    deleteLink.textContent = 'Удалить';
    deleteLink.style.cursor = 'pointer';
    deleteLink.style.color = 'blue';
    deleteLink.style.textDecoration = 'underline';
    deleteLink.addEventListener('click', () => deleteEntryClicked(index));
    item.appendChild(deleteLink);
  }

  return item;
}

export function deleteEntryClicked(index) {
  CORE.removeMigraineAttack(index);
  composeMigraineDiary();
}

export async function loginButtonClicked() {
  const login = document.getElementsByName('login')[0].value;
  const password = document.getElementsByName('password')[0].value;

  try {
    const data = new FormData();
    data.append('login', login);
    data.append('password', password);

    const response = await fetch('/api/login', {
      method: 'POST',
      body: data
    });

    if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
    const result = await response.json();

    alert(result.success ? 'Логин и пароль правильные' : 'Неверный логин или пароль');
  } catch (error) {
    console.error('Ошибка авторизации:', error.message);
  }
}
