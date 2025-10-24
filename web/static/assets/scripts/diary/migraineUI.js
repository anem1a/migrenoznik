import { MigrenoznikCore } from './MigrenoznikCore.js';
import { MigraineAttack } from './MigraineAttack.js';

/** Глобальная константа ядра (UPPER_CASE) */
export const CORE = new MigrenoznikCore();

/** Обработчик кнопки "Мигрень сейчас" */
export function migraineNowButtonClicked() {
  if (CORE.isMigraineNow()) {
    CORE.toggleMigraineStatus();
    CORE.closeLastMigraineAttack();
    updateMigraineButtonUI(false);
  } else {
    CORE.toggleMigraineStatus();
    CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
    updateMigraineButtonUI(true);
  }
  composeMigraineDiary();
}

/** Обновляет текст кнопки статуса мигрени */
export function updateMigraineButtonUI(isActive) {
  const button = document.getElementById('migre-diary-main-bottom-button');
  if (!button) return;
  button.innerText = isActive ? 'Отметить конец мигрени' : 'Отметить мигрень сейчас';
}

/** Формирует отображение дневника мигреней */
export function composeMigraineDiary() {
  const container = document.getElementById('migre-diary-wrapper');
  if (!container) return;
  container.innerHTML = '';

  const attacks = CORE.getMigraineAttacks();
  attacks.forEach((attack, i) => {
    const item = document.createElement('div');
    item.className = 'migre-v1-main-diary-item';

    const formatDate = (date) => {
      const pad = (n) => (n < 10 ? '0' + n : n);
      return `${date.getDate()} ${Calendar.month_number_to_name(date.getMonth())} ` +
             `${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };

    let html = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(attack.startDate)}`;
    if (attack.endDate != null) {
      html += ` &ndash; ${formatDate(attack.endDate)} 
               <a href="#" onclick="deleteEntryClicked(${i}); return false;">Удалить</a>`;
    }
    item.innerHTML = html;
    container.appendChild(item);
  });
}

/** Удаляет запись из дневника */
export function deleteEntryClicked(no) {
  CORE.removeMigraineAttack(no);
  composeMigraineDiary();
}

/** Авторизация пользователя */
export async function loginButtonClicked() {
  const login = document.getElementsByName('login')[0]?.value || '';
  const password = document.getElementsByName('password')[0]?.value || '';

  if (!login || !password) {
    alert('Заполните логин и пароль');
    return;
  }

  try {
    const data = new FormData();
    data.append('login', login);
    data.append('password', password);

    const response = await fetch('/api/login', { method: 'POST', body: data });
    if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);

    const result = await response.json();
    alert(result.success ? 'Логин и пароль правильные' : 'Неверный логин или пароль');
  } catch (error) {
    console.error('Ошибка:', error.message);
    alert('Не удалось подключиться к серверу. Попробуйте позже.');
  }
}
