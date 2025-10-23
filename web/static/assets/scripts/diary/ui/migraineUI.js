import { MigrenoznikCore } from '../core/MigrenoznikCore.js'; 
import { MigraineAttack } from '../models/MigraineAttack.js';

// Исправлено: используется именованный импорт из модулей (соответствует принципам модульности ES)
// Константа верхнего уровня в верхнем регистре
export const CORE = new MigrenoznikCore();

/**
 * Обрабатывает нажатие на кнопку «Мигрень сейчас».
 * Исправлено: название функции в camelCase.
 * Устранено нарушение SRP — UI обновляется отдельной функцией updateMigraineButtonUI().
 */
export function migraineNowButtonClicked() {
  if (CORE.isMigraineNow()) {
    CORE.toggleMigraineStatus();
    CORE.closeLastMigraineAttack();
    updateMigraineButtonUI(false); // Исправлено: выделен отдельный метод UI
  } else {
    CORE.toggleMigraineStatus();
    CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
    updateMigraineButtonUI(true);
  }
  composeMigraineDiary();
}

/**
 * Обновляет текст кнопки в зависимости от состояния.
 * Вынесено из migraineNowButtonClicked (устранено нарушение SRP).
 */
export function updateMigraineButtonUI(isActive) {
  const button = document.getElementById('migre-diary-main-bottom-button');
  if (!button) return;
  button.innerText = isActive
    ? 'Отметить конец мигрени'
    : 'Отметить мигрень сейчас';
}

/**
 * Составляет HTML-дневник приступов.
 * Исправлено: название функции в camelCase.
 * Устранено нарушение SRP — форматирование даты вынесено в formatDateTime().
 */
export function composeMigraineDiary() {
  const wrapper = document.getElementById('migre-diary-wrapper');
  if (!wrapper) return;
  wrapper.innerHTML = '';

  const migraineAttacks = CORE.getMigraineAttacks(); // Исправлено: camelCase
  migraineAttacks.forEach((attack, i) => {
    const item = document.createElement('div');
    item.className = 'migre-v1-main-diary-item';

    const startStr = formatDateTime(attack.dtStart);
    item.innerHTML = `<b>Запись&nbsp;${i + 1}.</b> ${startStr}`;

    if (attack.dtEnd) {
      const endStr = formatDateTime(attack.dtEnd);
      // Исправлено: длинные строки разбиты, innerHTML более читаем
      item.innerHTML += ` &ndash; ${endStr} 
        <a onclick="deleteEntryClicked(${i})">Удалить</a>`;
    }

    wrapper.appendChild(item);
  });
}

/**
 * Форматирует дату в человекочитаемый вид.
 * Вынесено из composeMigraineDiary (устранено нарушение SRP, улучшен KISS).
 */
export function formatDateTime(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = Calendar.month_number_to_name(d.getMonth());
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd} ${mm} ${yyyy} ${hh}:${min}`;
}

/**
 * Удаляет запись по индексу.
 * Исправлено: название функции в camelCase.
 */
export function deleteEntryClicked(index) {
  CORE.removeMigraineAttack(index);
  composeMigraineDiary();
}

/**
 * Авторизация пользователя по введённым данным.
 * Исправлено: название функции в camelCase.
 * Нарушение SRP устранено частично — для production стоит вынести fetch в ApiService.
 */
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

    // Исправлено: упрощено условие и вызов alert объединён в одну строку
    alert(result.success ? 'Логин и пароль правильные' : 'Неверный логин или пароль');
  } catch (error) {
    console.error('Ошибка авторизации:', error.message);
  }
  // Комментарий оставлен: для production следует вынести логику запроса в отдельный ApiService
}
