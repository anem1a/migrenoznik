import { MigraineAttack } from './MigraineAttack.js';

/**
 * Основной класс логики приложения "Дневник мигрени".
 */
class MigrenoznikCore {
  // Приватный метод: парсит JSON из localStorage
  _getParsedAttacks() {
    const data = localStorage.getItem('migraine_attacks');
    if (!data) return [];
    try {
      const attacks = JSON.parse(data);
      // Используем метод fromJson модели MigraineAttack (camelCase)
      return attacks.map(MigraineAttack.fromJson);
    } catch (e) {
      console.warn('Failed to parse migraine_attacks, returning empty array');
      return [];
    }
  }

  // Приватный метод: сохраняет массив атак в localStorage
  _saveAttacks(attacks) {
    try {
      localStorage.setItem('migraine_attacks', JSON.stringify(attacks));
    } catch (e) {
      console.error('Failed to save migraine_attacks');
    }
  }

  /** Проверяет, есть ли мигрень сейчас */
  isMigraineNow() {
    const migraineNow = localStorage.getItem('migraine_now');
    return migraineNow === 'true';
  }

  /** Переключает статус мигрени */
  toggleMigraineStatus() {
    const status = !this.isMigraineNow();
    localStorage.setItem('migraine_now', status.toString());
  }

  /** Возвращает массив всех атак */
  getMigraineAttacks() {
    return this._getParsedAttacks();
  }

  /** Добавляет новую атаку */
  addNewMigraineAttack(migraineAttack) {
    const attacks = this._getParsedAttacks();
    attacks.push(migraineAttack);
    this._saveAttacks(attacks);
  }

  /** Удаляет атаку по индексу */
  removeMigraineAttack(no) {
    const attacks = this._getParsedAttacks();
    if (no < 0 || no >= attacks.length) return;
    attacks.splice(no, 1); // проще, чем цикл
    this._saveAttacks(attacks);
  }

  /** Завершает последнюю атаку */
  closeLastMigraineAttack() {
    const attacks = this._getParsedAttacks();
    if (!attacks.length) return;
    const last = attacks[attacks.length - 1];
    last.endDate = new Date();
    this._saveAttacks(attacks);
  }
}

export { MigrenoznikCore };
