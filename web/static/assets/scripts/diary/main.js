import { migraineNowButtonClicked, loginButtonClicked, composeMigraineDiary, CORE } from './migraineUI.js';

// Инициализация дневника сразу при загрузке
composeMigraineDiary();

// Меняем текст кнопки в зависимости от статуса
const button = document.getElementById('migre-diary-main-bottom-button');
if (button) {
  button.innerText = CORE.isMigraineNow()
    ? 'Отметить конец мигрени'
    : 'Отметить мигрень сейчас';
}

// Привязка обработчиков событий
document.getElementById('migre-diary-main-bottom-button')?.addEventListener('click', migraineNowButtonClicked);
document.getElementById('login-button')?.addEventListener('click', loginButtonClicked);
