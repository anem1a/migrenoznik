/**
 * Класс, представляющий эпизод мигрени.
 */
class MigraineAttack {
    /**
     * Создаёт новый эпизод мигрени.
     * @param {Date|null} startTime - Время начала мигрени.
     * @param {Date|null} endTime - Время окончания мигрени.
     */
    constructor(startTime, endTime = null) { /* Мария: имена переменных должны быть в стиле camelCase: dt_start → startTime, dt_end → endTime */
        this.startTime = startTime; /* Мария: имена переменных должны быть в стиле camelCase: DT_Start → startTime */
        this.endTime = endTime; /* Мария: имена переменных должны быть в стиле camelCase: DT_End → endTime */
    }

    /**
     * Создаёт объект MigraineAttack из JSON.
     * @param {Object} obj - Объект с полями startTime и endTime.
     * @returns {MigraineAttack|null} Новый объект или null при ошибке.
     */
    static fromJson(obj) { /* Мария: имена методов должны быть в стиле camelCase: from_json → fromJson */
        if (!obj || typeof obj !== 'object') return null;

        const parseDate = (dateStr) => {
            if (!dateStr) return null;
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? null : date;
        };

        const startTime = parseDate(obj["startTime"]);
        const endTime = parseDate(obj["endTime"]);

        return new MigraineAttack(startTime, endTime);
        // → Улучшено: добавлена валидация даты (проверка на Invalid Date)
        // → Раньше: просто new Date() без проверки — могло сломать логику
    }
}

// Экспортируем класс для использования в других модулях
export { MigraineAttack };