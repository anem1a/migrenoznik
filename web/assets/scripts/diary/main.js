// Импортируем класс из отдельного модуля
import { MigraineAttack } from './MigraineAttack.js';

/**
 * Основной класс логики приложения "Дневник мигрени".
 */
class MigrenoznikCore {
    /**
     * Проверяет, есть ли у пользователя мигрень сейчас.
     * @returns {boolean} true, если мигрень активна, иначе false.
     */
    isMigraineNow() { /* Мария: имена методов должны быть в стиле camelCase: is_migraine_now → isMigraineNow */
        const migraineNow = localStorage.getItem("migraineNow"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_now → migraineNow */
        return migraineNow === "true";
        /* Катя: убрано ручное сохранение "false" — не нужно, localStorage вернёт null */
        /* Катя: раньше был избыточный if (migraineNow == undefined) */
    }

    /**
     * Переключает статус мигрени (активна/не активна).
     */
    toggleMigraineStatus() { /* Мария: имена методов должны быть в стиле camelCase: toggle_migraine_status → toggleMigraineStatus */
        const status = !this.isMigraineNow();
        localStorage.setItem("migraineNow", status.toString());
    }

    /**
     * Возвращает весь дневник атак из localStorage.
     * @returns {MigraineAttack[]} Массив эпизодов мигрени.
     */
    getMigraineAttacks() { /* Мария: имена методов должны быть в стиле camelCase: get_migraine_attacks → getMigraineAttacks */
        const data = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        if (!data) return [];

        try {
            const attacks = JSON.parse(data);
            if (!Array.isArray(attacks)) return [];

            return attacks
                .map(MigraineAttack.fromJson)
                .filter(Boolean);
            /* Катя: добавлен try/catch и фильтрация null */
            /* Катя: раньше при битом JSON приложение падало */
        } catch (e) {
            console.warn("Failed to parse migraineAttacks, returning empty array", e);
            return [];
        }
    }

    /**
     * Добавляет новую атаку в конец списка.
     * @param {MigraineAttack} migraineAttack - Объект атаки.
     */
    addNewMigraineAttack(migraineAttack) { /* Мария: имена методов должны быть в стиле camelCase: add_new_migraine_attack → addNewMigraineAttack */
        const attacks = this.getMigraineAttacks();
        attacks.push(migraineAttack);
        this._saveAttacks(attacks);
        /* Катя: вынесено сохранение в приватный метод _saveAttacks */
        /* Катя: раньше код сохранения дублировался в нескольких местах */
    }

    /**
     * Завершает последнюю атаку, установив endTime = сейчас.
     */
    closeLastMigraineAttack() { /* Мария: имена методов должны быть в стиле camelCase: close_last_migraine_attack → closeLastMigraineAttack */
        const attacks = this.getMigraineAttacks();
        if (attacks.length === 0) return;

        const last = attacks[attacks.length - 1];
        if (!last.endTime) {
            last.endTime = new Date();
            this._saveAttacks(attacks);
        }
        /* Катя: добавлена проверка, что endTime ещё не установлен */
        /* Катя: раньше можно было случайно перезаписать время окончания */
    }

    /**
     * Удаляет атаку по индексу.
     * @param {number} index - Индекс атаки в массиве.
     */
    removeMigraineAttack(index) {
        /* Катя: новый метод — ранее не было безопасного удаления */
        const attacks = this.getMigraineAttacks();
        if (index < 0 || index >= attacks.length) return;
        attacks.splice(index, 1);
        this._saveAttacks(attacks);
        /* Катя: используем splice — короче и надёжнее, чем цикл */
    }

    /**
     * Приватный метод: сохраняет массив атак в localStorage.
     * @param {MigraineAttack[]} attacks - Массив атак.
     * @private
     */
    _saveAttacks(attacks) {
        /* Катя: новый метод — устраняет дублирование */
        /* Катя: теперь все операции с localStorage используют один метод */
        try {
            localStorage.setItem("migraineAttacks", JSON.stringify(attacks));
        } catch (e) {
            console.error("Failed to save migraineAttacks", e);
        }
    }
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraineNowButtonClicked() { /* Мария: имена функций должны быть в стиле camelCase: migraine_now_button_Clicked → migraineNowButtonClicked */
    if (CORE.isMigraineNow()) {
        CORE.toggleMigraineStatus();
        CORE.closeLastMigraineAttack();
        const button = document.getElementById("migre-diary-main-bottom-button");
        if (button) {
            button.innerText = "Отметить мигрень сейчас";
        }
        /* Катя: добавлена проверка if (button) — защита от ошибок */
        /* Катя: раньше падало, если элемента нет */
    } else {
        CORE.toggleMigraineStatus();
        CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
        const button = document.getElementById("migre-diary-main-bottom-button");
        if (button) {
            button.innerText = "Отметить конец мигрени";
        }
    }
    composeMigraineDiary();
}

/**
 * Формирует отображение дневника мигреней.
 */
function composeMigraineDiary() { /* Мария: имена функций должны быть в стиле camelCase: compose_migraine_diary → composeMigraineDiary */
    const CONTAINER = document.getElementById("migre-diary-wrapper");
    if (!CONTAINER) return; /* Катя: защита от отсутствия контейнера */
    CONTAINER.innerHTML = "";

    let migraineAttacks = CORE.getMigraineAttacks(); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
    for (let i = 0; i < migraineAttacks.length; i++) {
        const MIGRAINE_ATTACK = migraineAttacks[i]; /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: migraine_attack → MIGRAINE_ATTACK */
        let diaryItem = document.createElement("div"); /* Мария: имена переменных должны быть в стиле camelCase: diary_item → diaryItem */
        diaryItem.className = "migre-v1-main-diary-item";
        let today = new Date(); /* Мария: необходимо избегать однобуквенных имен, кроме общепринятых (i, j в циклах): a → today */
        diaryItem.innerHTML =
            `<b>Запись&nbsp;${i+1}.</b>
            ${MIGRAINE_ATTACK.startTime.getDate()}
            ${Calendar.monthNumberToName(MIGRAINE_ATTACK.startTime.getMonth())}
            ${MIGRAINE_ATTACK.startTime.getFullYear()}
            ${MIGRAINE_ATTACK.startTime.getHours() < 10 ? "0" : ""}
            ${MIGRAINE_ATTACK.startTime.getHours()}:
            ${MIGRAINE_ATTACK.startTime.getMinutes() < 10 ? "0" : ""}
            ${MIGRAINE_ATTACK.startTime.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов; имена методов должны быть в стиле camelCase: month_number_to_name → monthNumberToName */
        if (MIGRAINE_ATTACK.endTime != null) {
            diaryItem.innerHTML +=
                ` &ndash; ${MIGRAINE_ATTACK.endTime.getDate()}
                ${Calendar.monthNumberToName(MIGRAINE_ATTACK.endTime.getMonth())}
                ${MIGRAINE_ATTACK.endTime.getFullYear()}
                ${MIGRAINE_ATTACK.endTime.getHours() < 10 ? "0" : ""}
                ${MIGRAINE_ATTACK.endTime.getHours()}:
                ${MIGRAINE_ATTACK.endTime.getMinutes() < 10 ? "0" : ""}
                ${MIGRAINE_ATTACK.endTime.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов */
                }
            CONTAINER.appendChild(diaryItem);
            }
        }
    }
}

/**
 * Обработчик удаления записи.
 * @param {number} index - Индекс записи.
 */
function deleteEntryClicked(index) {
    /* Катя: новый метод — ранее не было безопасного удаления */
    CORE.removeMigraineAttack(index);
    composeMigraineDiary();
    /* Катя: обновляем интерфейс после удаления */
}

const CORE = new MigrenoznikCore(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: Core → CORE */