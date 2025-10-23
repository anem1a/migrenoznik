/**
 * Класс MigraineAttack описывает одну запись приступа мигрени.
 */
export class MigraineAttack {
    /**
     * @param {Date} dtStart - начало приступа
     * @param {?Date} dtEnd - конец приступа
     */
    constructor(dtStart, dtEnd = null) { 
        this.dtStart = dtStart; // camelCase
        this.dtEnd = dtEnd;
    }
}
