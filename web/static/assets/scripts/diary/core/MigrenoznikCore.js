import MigraineAttackMapper from '../mappers/MigraineAttackMapper.js';
import MigraineAttack from '../models/MigraineAttack.js';
import { STORAGE_KEYS } from '../config/storageKeys.js';

class StorageError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'StorageError';
    this.originalError = originalError;
  }
}

class MigrenoznikCore {
  constructor(storage = localStorage, mapper = MigraineAttackMapper) {
    this.storage = storage;
    this.mapper = mapper;
  }

  isMigraineNow() {
    const migraineNow = this.storage.getItem(STORAGE_KEYS.MIGRAINE_NOW);
    if (migraineNow === null) {
      this.storage.setItem(STORAGE_KEYS.MIGRAINE_NOW, JSON.stringify(false));
      return false;
    }
    return JSON.parse(migraineNow);
  }

  toggleMigraineStatus() {
    const current = this.isMigraineNow();
    this.storage.setItem(STORAGE_KEYS.MIGRAINE_NOW, JSON.stringify(!current));
  }

  getMigraineAttacks() {
    const migraineAttacks = this.storage.getItem(STORAGE_KEYS.MIGRAINE_ATTACKS);
    if (!migraineAttacks) return [];
    
    try {
      const parsedAttacks = JSON.parse(migraineAttacks);
      return parsedAttacks.map(attack => this.mapper.fromJson(attack));
    } catch (error) {
      console.error('Ошибка чтения данных мигрени:', error);
      throw new StorageError('Failed to read migraine attacks', error);
    }
  }

  addNewMigraineAttack(migraineAttack) {
    try {
      const migraineAttacks = this.getMigraineAttacksFromStorage();
      migraineAttacks.push(this.mapper.toJson(migraineAttack));
      this.saveMigraineAttacks(migraineAttacks);
    } catch (error) {
      console.error('Ошибка добавления приступа:', error);
      this.saveMigraineAttacks([this.mapper.toJson(migraineAttack)]);
    }
  }

  removeMigraineAttack(index) {
    try {
      const migraineAttacks = this.getMigraineAttacksFromStorage();
      if (index < 0 || index >= migraineAttacks.length) return;
      
      const filteredAttacks = migraineAttacks.filter((_, i) => i !== index);
      this.saveMigraineAttacks(filteredAttacks);
    } catch (error) {
      console.error('Ошибка удаления приступа:', error);
      throw new StorageError('Failed to remove migraine attack', error);
    }
  }

  closeLastMigraineAttack() {
    try {
      const migraineAttacks = this.getMigraineAttacksFromStorage();
      if (migraineAttacks.length === 0) return;
      
      const lastAttack = migraineAttacks[migraineAttacks.length - 1];
      lastAttack.DT_End = new Date().toISOString();
      this.saveMigraineAttacks(migraineAttacks);
    } catch (error) {
      console.error('Ошибка закрытия приступа:', error);
      throw new StorageError('Failed to close migraine attack', error);
    }
  }

  getMigraineAttacksFromStorage() {
    const migraineAttacks = this.storage.getItem(STORAGE_KEYS.MIGRAINE_ATTACKS);
    return migraineAttacks ? JSON.parse(migraineAttacks) : [];
  }

  saveMigraineAttacks(attacks) {
    this.storage.setItem(STORAGE_KEYS.MIGRAINE_ATTACKS, JSON.stringify(attacks));
  }
}

const CORE = new MigrenoznikCore();
export default CORE;
