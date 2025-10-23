/**
 * Класс MigraineAttack описывает одну запись приступа мигрени.
 */
class MigraineAttack {
  /**
   * Создаёт новую запись приступа мигрени.
   * @param {Date} dtStart - Время начала приступа.
   * @param {?Date} dtEnd - Время окончания приступа (null, если не завершён).
   */
  constructor(dtStart, dtEnd = null) { // Исправлено: параметры в camelCase
    this.dtStart = dtStart; // Исправлено: поля в camelCase
    this.dtEnd = dtEnd;
  }
}

export default MigraineAttack;
