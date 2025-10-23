import MigraineAttackMapper from '../mappers/MigraineAttackMapper.js';
import MigraineAttack from '../models/MigraineAttack.js';

/**
 * Класс MigrenoznikCore управляет логикой хранения и обработки данных.
 */
class MigrenoznikCore {
  constructor(storage = localStorage) {
    this.storage = storage;
    // Исправлено: внедрение зависимости (Dependency Inversion)
  }

  /**
   * Проверяет, активен ли сейчас приступ мигрени.
   * @returns {boolean}
   */
  isMigraineNow() { // Исправлено: camelCase
    let migraineNow = this.storage.getItem('migraine_now'); // camelCase
    if (migraineNow === undefined || migraineNow === null) {
      this.storage.setItem('migraine_now', 'false');
      return false;
    }
    return migraineNow === 'true';
  }

  /**
   * Переключает статус текущего приступа мигрени.
   */
  toggleMigraineStatus() { // camelCase
    const current = this.isMigraineNow();
    this.storage.setItem('migraine_now', current ? 'false' : 'true');
  }

  /**
   * Возвращает список всех приступов мигрени из хранилища.
   * @returns {MigraineAttack[]}
   */
  getMigraineAttacks() { // camelCase
    let migraineAttacks = this.storage.getItem('migraine_attacks');
    if (!migraineAttacks) return [];
    try {
      migraineAttacks = JSON.parse(migraineAttacks);
      return migraineAttacks.map(a => MigraineAttackMapper.fromJson(a));
    } catch (error) {
      console.error('Ошибка чтения данных мигрени:', error);
      return [];
    }
  }

  /**
   * Добавляет новую запись приступа мигрени.
   * @param {MigraineAttack} migraineAttack
   */
  addNewMigraineAttack(migraineAttack) { // camelCase
    try {
      let migraineAttacks =
        JSON.parse(this.storage.getItem('migraine_attacks') || '[]');
      migraineAttacks.push(MigraineAttackMapper.toJson(migraineAttack));
      this.storage.setItem('migraine_attacks', JSON.stringify(migraineAttacks));
    } catch (error) {
      console.error('Ошибка добавления приступа:', error);
      this.storage.setItem(
        'migraine_attacks',
        JSON.stringify([MigraineAttackMapper.toJson(migraineAttack)])
      );
    }
  }

  /**
   * Удаляет запись приступа по индексу.
   * @param {number} index
   */
  removeMigraineAttack(index) { // camelCase
    try {
      let migraineAttacks =
        JSON.parse(this.storage.getItem('migraine_attacks') || '[]');
      if (index < 0 || index >= migraineAttacks.length) return;
      migraineAttacks = migraineAttacks.filter((_, i) => i !== index); // Упрощено (KISS)
      this.storage.setItem('migraine_attacks', JSON.stringify(migraineAttacks));
    } catch (error) {
      console.error('Ошибка удаления приступа:', error);
      this.storage.setItem('migraine_attacks', JSON.stringify([]));
    }
  }

  /**
   * Закрывает последний приступ мигрени (устанавливает dtEnd = now).
   */
  closeLastMigraineAttack() { // camelCase
    try {
      let migraineAttacks =
        JSON.parse(this.storage.getItem('migraine_attacks') || '[]');
      if (migraineAttacks.length === 0) return;
      const last = migraineAttacks.pop();
      last.DT_End = new Date().toISOString();
      migraineAttacks.push(last);
      this.storage.setItem('migraine_attacks', JSON.stringify(migraineAttacks));
    } catch (error) {
      console.error('Ошибка закрытия приступа:', error);
    }
  }
}

const CORE = new MigrenoznikCore(); // Константа верхнего уровня в верхнем регистре.

export default CORE;
