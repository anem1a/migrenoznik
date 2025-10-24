/**
 * Класс, представляющий эпизод мигрени.
 */
class MigraineAttack {
  /**
   * Создаёт новый эпизод мигрени.
   * @param {Date|null} startDate - Дата и время начала.
   * @param {Date|null} endDate - Дата и время окончания.
   */
  constructor(startDate, endDate = null) {
    this.startDate = startDate;
    this.endDate = endDate;
  }

  /**
   * Создаёт объект MigraineAttack из JSON.
   * Ожидает поля в формате camelCase: startDate, endDate.
   * → Ранее использовался snake_case DT_Start, DT_End
   * @param {Object} obj - Объект с полями startDate и endDate.
   * @returns {MigraineAttack}
   */
  static fromJson(obj) {
    return new MigraineAttack(
      obj.startDate ? new Date(obj.startDate) : null,
      obj.endDate ? new Date(obj.endDate) : null
    );
  }

  /**
   * Преобразует объект в JSON-совместимый формат.
   * @returns {Object} Объект с полями startDate и endDate в виде ISO-строк.
   */
  toJson() {
    return {
      startDate: this.startDate ? this.startDate.toISOString() : null,
      endDate: this.endDate ? this.endDate.toISOString() : null
    };
  }
}

export { MigraineAttack };
