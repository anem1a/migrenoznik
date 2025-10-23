class MigraineAttack {
    constructor(dtStart, dtEnd = null) {
        this.dtStart = dtStart;
        this.dtEnd = dtEnd;
    }

    static fromJson(obj) {
        const parseDate = (val) => {
            if (!val) return null;
            const date = new Date(val);
            return isNaN(date.getTime()) ? null : date;
        };

        return new MigraineAttack(
            parseDate(obj["dtStart"] || obj["DT_Start"]),
            parseDate(obj["dtEnd"] || obj["DT_End"])
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
        let migraineNow = localStorage.getItem("migraine_now");
        if (migraineNow === undefined || migraineNow === null) {
            localStorage.setItem("migraine_now", "false");
            return false;
        }
        return migraineNow === "true";
    }

    /**
     * Устанавливает состояние мигрени.
     */
    setMigraineStatus(value) {
        localStorage.setItem("migraine_now", value ? "true" : "false");
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
        let migraineAttacks = localStorage.getItem("migraine_attacks");
        if (migraineAttacks === undefined || migraineAttacks === null) {
            return [];
        }
        try {
            migraineAttacks = JSON.parse(migraineAttacks);
            return migraineAttacks.map(m => MigraineAttack.fromJson(m));
        } catch (error) {
            console.error("Ошибка при чтении данных о мигренях:", error);
            return [];
        }
    }

    /**
     * Добавляет новую запись о приступе мигрени.
     */
    addNewMigraineAttack(migraineAttack) {
        let migraineAttacks = localStorage.getItem("migraine_attacks");
        try {
            if (!migraineAttacks) {
                localStorage.setItem("migraine_attacks", JSON.stringify([migraineAttack]));
                return;
            }
            migraineAttacks = JSON.parse(migraineAttacks);
            migraineAttacks.push(migraineAttack);
            localStorage.setItem("migraine_attacks", JSON.stringify(migraineAttacks));
        } catch (error) {
            console.error("Ошибка при добавлении новой записи о мигрени:", error);
            localStorage.setItem("migraine_attacks", JSON.stringify([migraineAttack]));
        }
    }

    /**
     * Закрывает последний приступ мигрени.
     */
    closeLastMigraineAttack() {
        let migraineAttacks = localStorage.getItem("migraine_attacks");
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
            localStorage.setItem("migraine_attacks", JSON.stringify(migraineAttacks));
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
    const months = [
        "января", "февраля", "марта", "апреля", "мая", "июня",
        "июля", "августа", "сентября", "октября", "ноября", "декабря"
    ];
    const dd = date.getDate();
    const mm = months[date.getMonth()];
    const yyyy = date.getFullYear();
    const hh = date.getHours().toString().padStart(2, "0");
    const min = date.getMinutes().toString().padStart(2, "0");
    return `${dd} ${mm} ${yyyy} ${hh}:${min}`;
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraineNowButtonClicked() {
    if (core.isMigraineNow()) {
        core.toggleMigraineStatus();
        core.closeLastMigraineAttack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        core.toggleMigraineStatus();
        core.addNewMigraineAttack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    composeMigraineDiary();
}

/**
 * Формирует визуальное представление дневника мигреней.
 */
function composeMigraineDiary() {
    const wrapper = document.getElementById("migre-diary-wrapper");
    wrapper.innerHTML = "";
    const migraineAttacks = core.getMigraineAttacks();

    migraineAttacks.forEach((attack, i) => {
        const diaryItem = document.createElement("div");
        diaryItem.className = "migre-v1-main-diary-item";
        let content = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(attack.dtStart)}`;
        if (attack.dtEnd) {
            content += ` &ndash; ${formatDate(attack.dtEnd)}`;
        }
        diaryItem.innerHTML = content;
        wrapper.appendChild(diaryItem);
    });
}

const core = new MigrenoznikCore();
