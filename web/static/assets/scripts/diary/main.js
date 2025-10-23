class MigraineAttack {
    constructor(dtStart, dtEnd = null) {
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
    }

    static fromJson(obj) {
        parseDate = (val) => { 
            if (!val) return null;
            const DATE = new Date(val); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: date → DATE */
            return isNaN(DATE.getTime()) ? null : DATE;
        };

        return new MigraineAttack(
            parseDate(obj["dtStart"] || obj["dtStart"]),
            parseDate(obj["dtEnd"] || obj["dtEnd"])
        );
    }
}

class MigrenoznikCore {
    constructor() {
        // Конструктор оставлен для возможных будущих расширений.
    }

    /**
     * Проверяет, активна ли сейчас мигрень у пользователя.
     * @returns {boolean}
     */
    isMigraineNow() {
        let migraineNow = localStorage.getItem("migraineNow"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_now → migraineNow */
        if (migraineNow === undefined || migraineNow === null) {
            localStorage.setItem("migraineNow", "false");
            return false;
        }
        return migraineNow === "true";
    }

    /**
     * Устанавливает состояние мигрени.
     */
    setMigraineStatus(value) {
        localStorage.setItem("migraineNow", value ? "true" : "false"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_now → migraineNow */
    }

    /**
     * Переключает состояние мигрени.
     */
    toggleMigraineStatus() {
        this.setMigraineStatus(!this.isMigraineNow());
    }

    /**
     * Возвращает журнал всех приступов мигрени.
     */
    getMigraineAttacks() {
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        if (migraineAttacks === undefined || migraineAttacks === null) {
            return [];
        }
        try {
            migraineAttacks = JSON.parse(migraineAttacks);
            return migraineAttacks.map(item => MigraineAttack.fromJson(item)); /* Мария: необходимо избегать однобуквенных имен, кроме общепринятых (i, j в циклах): m → item */ 
        } catch (error) {
            console.error("Ошибка при чтении данных о мигренях:", error);
            return [];
        }
    }

    /**
     * Добавляет новую запись о приступе мигрени.
     */
    addNewMigraineAttack(migraineAttack) {
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        try {
            if (!migraineAttacks) {
                localStorage.setItem("migraineAttacks", JSON.stringify([migraineAttack]));
                return;
            }
            migraineAttacks = JSON.parse(migraineAttacks);
            migraineAttacks.push(migraineAttack);
            localStorage.setItem("migraineAttacks", JSON.stringify(migraineAttacks));
        } catch (error) {
            console.error("Ошибка при добавлении новой записи о мигрени:", error);
            localStorage.setItem("migraineAttacks", JSON.stringify([migraineAttack]));
        }
    }

    /**
     * Закрывает последний приступ мигрени.
     */
    closeLastMigraineAttack() {
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        if (!migraineAttacks) {
            console.warn("Попытка закрыть приступ, но журнал мигреней пуст.");
            return;
        }
        try {
            migraineAttacks = JSON.parse(migraineAttacks);
            if (migraineAttacks.length === 0) {
                console.warn("Нет записей для закрытия приступа.");
                return;
            }
            let lastElement = migraineAttacks.pop();
            lastElement.dtEnd = new Date();
            migraineAttacks.push(lastElement);
            localStorage.setItem("migraineAttacks", JSON.stringify(migraineAttacks)); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        } catch (error) {
            console.error("Ошибка при закрытии последнего приступа:", error);
        }
    }
}

/**
 * Форматирует дату в строку "DD MMM YYYY HH:MM".
 */
function formatDate(date) {
    if (!date) return "";
    const MONTHS = [ /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: months → MONTHS */
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    const DD = date.getDate(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: dd → DD */
    const MM = MONTHS[date.getMonth()]; /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: mm → MM */
    const YYYY = date.getFullYear(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: yyyy → YYYY */
    const HH = date.getHours().toString().padStart(2, "0"); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: hh → HH */
    const MIN = date.getMinutes().toString().padStart(2, "0"); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: min → MIN */
    return `${DD} ${MM} ${YYYY} ${HH}:${MIN}`;
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraineNowButtonClicked() {
    if (CORE.isMigraineNow()) {
        CORE.toggleMigraineStatus();
        CORE.closeLastMigraineAttack();
        document.getElementById("migre-diary-main-bottom-button").innerText = 
            "Отметить мигрень сейчас"; /* Мария: максимальная длина строки — 80 символов */
    } else {
        CORE.toggleMigraineStatus();
        CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = 
            "Отметить конец мигрени"; /* Мария: максимальная длина строки — 80 символов */
    }
    composeMigraineDiary();
}

/**
 * Формирует визуальное представление дневника мигреней.
 */
function composeMigraineDiary() {
    const WRAPPER = document.getElementById("migre-diary-wrapper"); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: wrapper → WRAPPER */
    WRAPPER.innerHTML = "";
    const MIGRAINE_ATTACKS = CORE.getMigraineAttacks(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: migraineAttacks → MIGRAINE_ATTACKS */

    MIGRAINE_ATTACKS.forEach((attack, i) => {
        const DIARY_ITEM = document.createElement("div"); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: diaryItem → DIARY_ITEM */
        DIARY_ITEM.className = "migre-v1-main-diary-item";
        let content = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(attack.dtStart)}`;
        if (attack.dtEnd) {
            content += ` &ndash; ${formatDate(attack.dtEnd)}`;
        }
        DIARY_ITEM.innerHTML = content;
        WRAPPER.appendChild(DIARY_ITEM);
    });
}

const CORE = new MigrenoznikCore(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: Core → CORE */