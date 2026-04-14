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

}