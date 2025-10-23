import MigraineAttack from '../models/MigraineAttack.js';

/**
 * MigraineAttackMapper отвечает за сериализацию/десериализацию JSON.
 * Вынесено из модели (устранено нарушение S).
 */
class MigraineAttackMapper {
  /**
   * Создаёт экземпляр MigraineAttack из JSON-объекта.
   * @param {Object} obj - Объект с полями "DT_Start" и "DT_End".
   * @returns {MigraineAttack}
   */
  static fromJson(obj) { // Исправлено: camelCase
    return new MigraineAttack(
      obj.DT_Start ? new Date(obj.DT_Start) : null,
      obj.DT_End ? new Date(obj.DT_End) : null
    );
  }

  /**
   * Преобразует MigraineAttack в JSON-объект.
   * @param {MigraineAttack} attack
   * @returns {Object}
   */
  static toJson(attack) {
    return {
      DT_Start: attack.dtStart ? attack.dtStart.toISOString() : null,
      DT_End: attack.dtEnd ? attack.dtEnd.toISOString() : null
    };
  }
}

export default MigraineAttackMapper;
