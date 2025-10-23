// Импортируем класс MigraineAttack из отдельного файла
// → Это позволяет разделить код на части (модули), как в руководстве
// → Раньше всё было в одном файле — плохо для поддержки
import { MigraineAttack } from './MigraineAttack.js';

/**
 * Основной класс логики приложения "Дневник мигрени".
 */
class MigrenoznikCore {
    /**
     * Получает и парсит массив атак из localStorage.
     * @returns {MigraineAttack[]}
     * @private
     */
    _getParsedAttacks() {
        const data = localStorage.getItem("migraine_attacks");
        if (!data) return [];
        try {
            const attacks = JSON.parse(data);
            // Используем fromJson — метод из MigraineAttack.js
            // → Раньше было from_json (snake_case), теперь camelCase
            return attacks.map(MigraineAttack.fromJson);
        } catch (e) {
            console.warn("Failed to parse migraine_attacks, returning empty array");
            return [];
        }
    }

    /**
     * Сохраняет массив атак в localStorage.
     * @param {MigraineAttack[]} attacks
     * @private
     */
    _saveAttacks(attacks) {
        try {
            // Сохраняем массив атак
            // → Раньше дублировался этот код в 4 местах
            // → Теперь он в одном месте — проще поддерживать
            localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
        } catch (e) {
            console.error("Failed to save migraine_attacks");
        }
    }

    /**
     * Проверяет, есть ли мигрень сейчас.
     * @returns {boolean}
     */
    isMigraineNow() {
        const migraineNow = localStorage.getItem("migraine_now");
        return migraineNow === "true";
        // → Раньше было is_migraine_now() — snake_case
        // → Теперь isMigraineNow() — camelCase, как в руководстве
    }

    /**
     * Переключает статус мигрени (есть/нет).
     */
    toggleMigraineStatus() {
        const status = !this.isMigraineNow();
        localStorage.setItem("migraine_now", status.toString());
        // → Раньше было toggle_migraine_status() — snake_case
        // → Теперь toggleMigraineStatus() — camelCase
    }

    /**
     * Возвращает весь дневник атак.
     * @returns {MigraineAttack[]}
     */
    getMigraineAttacks() {
        return this._getParsedAttacks();
        // → Раньше было get_migraine_attacks() — snake_case
        // → Теперь getMigraineAttacks() — camelCase
    }

    /**
     * Добавляет новую атаку в конец списка.
     * @param {MigraineAttack} migraineAttack
     */
    addNewMigraineAttack(migraineAttack) {
        const attacks = this._getParsedAttacks();
        attacks.push(migraineAttack);
        this._saveAttacks(attacks);
        // → Раньше было add_new_migraine_attack() — snake_case
        // → Теперь addNewMigraineAttack() — camelCase
    }

    /**
     * Удаляет атаку по номеру.
     * @param {number} no - Индекс записи в массиве
     */
    removeMigraineAttack(no) {
        const attacks = this._getParsedAttacks();
        if (no < 0 || no >= attacks.length) return;
        // → Раньше удаляли через цикл — сложно и медленно
        // → Теперь используем splice() — проще и понятнее
        attacks.splice(no, 1);
        this._saveAttacks(attacks);
        // → Раньше было remove_migraine_attack() — snake_case
        // → Теперь removeMigraineAttack() — camelCase
    }

    /**
     * Завершает последнюю атаку (устанавливает endDate = сейчас).
     */
    closeLastMigraineAttack() {
        const attacks = this._getParsedAttacks();
        if (attacks.length === 0) return;
        const last = attacks[attacks.length - 1];
        // → Раньше было last.DT_End — не по стилю
        // → Теперь last.endDate — camelCase
        last.endDate = new Date();
        this._saveAttacks(attacks);
        // → Раньше было close_last_migraine_attack() — snake_case
        // → Теперь closeLastMigraineAttack() — camelCase
    }
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraineNowButtonClicked() {
    if (CORE.isMigraineNow()) {
        CORE.toggleMigraineStatus();
        CORE.closeLastMigraineAttack();
        // → Раньше было migraine_now_button_Clicked() — смешанный стиль
        // → Теперь migraineNowButtonClicked() — чистый camelCase
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        CORE.toggleMigraineStatus();
        CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    // Обновляем отображение дневника
    composeMigraineDiary();
}

/**
 * Обработчик клика по кнопке "Войти".
 */
function loginClicked() {
    window.location.href = "/login/";
    // → Раньше было login_Clicked() — snake_case
    // → Теперь loginClicked() — camelCase
}

/**
 * Формирует отображение дневника мигреней.
 */
function composeMigraineDiary() {
    const container = document.getElementById("migre-diary-wrapper");
    container.innerHTML = "";

    const attacks = CORE.getMigraineAttacks();
    for (let i = 0; i < attacks.length; i++) {
        const attack = attacks[i];
        const item = document.createElement("div");
        item.className = "migre-v1-main-diary-item";

        const formatDate = (date) => {
            const pad = (n) => n < 10 ? "0" + n : n;
            return (
                `${date.getDate()} ${Calendar.month_number_to_name(date.getMonth())} ` +
                `${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
            );
            // → Форматируем дату красиво: "5 Октябрь 2025 14:30"
        };

        // → Раньше использовали attack.DT_Start — не по стилю
        // → Теперь attack.startDate — camelCase
        let html = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(attack.startDate)}`;
        if (attack.endDate != null) {
            // → Раньше было attack.DT_End
            // → Теперь attack.endDate — camelCase
            html += ` &ndash; ${formatDate(attack.endDate)}`;
            html += ` <a href="#" onclick="deleteEntryClicked(${i}); return false;">Удалить</a>`;
        }

        item.innerHTML = html;
        container.appendChild(item);
    }
}

/**
 * Обработчик удаления записи.
 * @param {number} no - Номер записи
 */
function deleteEntryClicked(no) {
    CORE.removeMigraineAttack(no);
    composeMigraineDiary();
    // → Раньше было delete_entry_Clicked() — snake_case
    // → Теперь deleteEntryClicked() — camelCase
}

/**
 * Обработчик входа через форму.
 */
async function loginButtonClicked() {
    const login = document.getElementsByName('login')[0]?.value || '';
    const password = document.getElementsByName('password')[0]?.value || '';

    if (!login || !password) {
        alert("Заполните логин и пароль");
        return;
    }

    try {
        const data = new FormData();
        data.append("login", login);
        data.append("password", password);

        const response = await fetch('/api/login', {
            method: 'POST',
            body: data,
        });

        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);

        const result = await response.json();
        if (result.success) {
            alert("Логин и пароль правильные");
        } else {
            alert("Неверный логин или пароль");
        }
    } catch (error) {
        console.error('Ошибка:', error.message);
        alert("Не удалось подключиться к серверу. Попробуйте позже.");
    }
    // → Раньше было login_button_Clicked() — snake_case
    // → Теперь loginButtonClicked() — camelCase
}

// Глобальная константа ядра
// → Раньше было Core (с большой, но не UPPER_CASE)
// → Теперь CORE — константа в правильном стиле (UPPER_CASE)
const CORE = new MigrenoznikCore();

// === ПРОСТАЯ ИНИЦИАЛИЗАЦИЯ ===
// Просто вызываем функцию после объявления всего
// → Раньше не было инициализации — дневник не обновлялся при открытии
// → Теперь он сразу показывается
composeMigraineDiary();

// Меняем текст кнопки в зависимости от статуса
const button = document.getElementById("migre-diary-main-bottom-button");
if (button) {
    button.innerText = CORE.isMigraineNow()
        ? "Отметить конец мигрени"
        : "Отметить мигрень сейчас";
}