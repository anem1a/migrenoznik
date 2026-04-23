/**
 * Singleton class to manage the migraine diary.
 */

class MigraineDiary {
    constructor() {
        let current_migraine_attack = localStorage.getItem("current_migraine_attack");
        try {
            current_migraine_attack = JSON.parse(current_migraine_attack);
            this._CurrentAttack = MigraineAttack.from_json(current_migraine_attack);
        } catch (error) {
            this._CurrentAttack = null;
        }

        let migraine_attacks = localStorage.getItem("migraine_attacks");
        this._Attacks = [];
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            for (const attack of migraine_attacks) {
                let _attack = MigraineAttack.from_json(attack);
                this._Attacks = _attack;
            }
        } catch (error) {
            this._Attacks = [];
        }
    }

    /* Текущий приступ */


    /* Получить текущий приступ мигрени - может быть null, если приступа нет. */
    get CurrentAttack() {
        return this._CurrentAttack;
    }

    /* Установить текущий приступ мигрени. */
    set CurrentAttack(value) {
        this._CurrentAttack = value;
        localStorage.setItem("current_migraine_attack", JSON.stringify(this._CurrentAttack));
    }

    /* Есть ли сейчас приступ мигрени? */
    is_migraine_now() {
        return this._CurrentAttack !== null;
    }

    /* Очистить текущий приступ мигрени. */
    clear_current_attack() {
        this._CurrentAttack = null;
        localStorage.removeItem("current_migraine_attack");
    }


    /* Все приступы */

    /* Быстрый способ получить список приступов. Не гарантирует актуальность */
    get Attacks() {
        return this._Attacks;
    }

    set Attacks(value) {
        this._Attacks = value;
        localStorage.setItem("migraine_attacks", JSON.stringify(this._Attacks));
    }

    /* Добавить новый приступ в локальное хранилище */
    async add_attack(attack) {
        let attacks = this.Attacks;
        attacks.push(attack);
        this.Attacks = attacks;
    }

}