// Импортируем класс из отдельного модуля
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
            return attacks.map(MigraineAttack.from_json);
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
    }

    /**
     * Переключает статус мигрени (есть/нет).
     */
    toggleMigraineStatus() {
        const status = !this.isMigraineNow();
        localStorage.setItem("migraine_now", status.toString());
    }

    /**
     * Возвращает весь дневник атак.
     * @returns {MigraineAttack[]}
     */
    getMigraineAttacks() {
        return this._getParsedAttacks();
    }

    /**
     * Добавляет новую атаку в конец списка.
     * @param {MigraineAttack} migraineAttack
     */
    addNewMigraineAttack(migraineAttack) {
        const attacks = this._getParsedAttacks();
        attacks.push(migraineAttack);
        this._saveAttacks(attacks);
    }

    /**
     * Удаляет атаку по номеру.
     * @param {number} no - Индекс записи в массиве
     */
    removeMigraineAttack(no) {
        const attacks = this._getParsedAttacks();
        if (no < 0 || no >= attacks.length) return;
        attacks.splice(no, 1);
        this._saveAttacks(attacks);
    }

    /**
     * Завершает последнюю атаку (устанавливает DT_End = сейчас).
     */
    closeLastMigraineAttack() {
        const attacks = this._getParsedAttacks();
        if (attacks.length === 0) return;
        const last = attacks[attacks.length - 1];
        last.DT_End = new Date();
        this._saveAttacks(attacks);
    }
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraineNowButtonClicked() {
    if (CORE.isMigraineNow()) {
        CORE.toggleMigraineStatus();
        CORE.closeLastMigraineAttack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        CORE.toggleMigraineStatus();
        CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    composeMigraineDiary();
}

/**
 * Обработчик клика по кнопке "Войти".
 */
function loginClicked() {
    window.location.href = "/login/";
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
        };

        let html = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(attack.DT_Start)}`;
        if (attack.DT_End != null) {
            html += ` &ndash; ${formatDate(attack.DT_End)}`;
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
}

// Глобальная константа ядра
const CORE = new MigrenoznikCore();

// Инициализация при загрузке
document.addEventListener("DOMContentLoaded", () => {
    composeMigraineDiary();
    // Привязка событий (пример — можно вынести в HTML или отдельный скрипт)
    const button = document.getElementById("migre-diary-main-bottom-button");
    if (button) {
        button.innerText = CORE.isMigraineNow()
            ? "Отметить конец мигрени"
            : "Отметить мигрень сейчас";
    }
});