// Точка входа приложения. Здесь привязываем обработчики UI к DOM элементам.
// Исправлено: отдельный модуль main.js вместо смешивания логики и UI в одном файле.

import { migraineNowButtonClicked, loginButtonClicked } from './ui/migraineUI.js';

// Привязка события к кнопке «Мигрень сейчас»
// Исправлено: camelCase для функции обработчика
document
    .getElementById('migre-diary-main-bottom-button')
    ?.addEventListener('click', migraineNowButtonClicked);

// Привязка события к кнопке логина
// Исправлено: camelCase для функции обработчика
document
    .getElementById('login-button')
    ?.addEventListener('click', loginButtonClicked);
