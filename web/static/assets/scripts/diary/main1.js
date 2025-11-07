
class MigraineAttack {
    constructor(localId, dtStart, dtEnd = null, id = null) {
        this.LocalID = localId;
        this.DT_Start = dtStart;
        this.DT_End = dtEnd;
    }

    static fromJson(obj) {
        return new MigraineAttack(
            obj["LocalID"] == null ? null : Number(obj["LocalID"]),
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["DT_End"] == null ? null : new Date(obj["DT_End"]),
        );
    }
}

class MigrenoznikCore {

    /**
     * Does user have migraine now.
     * @returns True if yes, False if no
     */
    isMigraineNow() {
        let migraine_now = localStorage.getItem("migraine_now");
        if (migraine_now == undefined) {
            localStorage.setItem("migraine_now", "false");
            return false;
        }
        return migraine_now == "true";
    }

    /**
     * Toggles user's migraine status, i.e. if user has migraine, stops it, otherwise starts it.
     */
    toggleMigraineStatus() {
        if (this.is_migraine_now()) {
            localStorage.setItem("migraine_now", "false");
        } else {
            localStorage.setItem("migraine_now", "true");
        }
    }

    /**
     * Returns the entire diary of migraine attacks.
     */
    getMigraineAttacks() {
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            return [];
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let migraine_attacks_obj = [];
            for (const migraine_attack of migraine_attacks) {
                migraine_attacks_obj.push(MigraineAttack.from_json(migraine_attack));
            }
            return migraine_attacks_obj;
        } catch (error) {
            return [];
        }
    }

    /**
     * Adds new migraine attack to the end of the list.
     */
    addNewMigraineAttack(migraine_attack) {
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            localStorage.setItem("migraine_attacks", JSON.stringify([migraine_attack]));
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            migraine_attacks.push(migraine_attack);
            localStorage.setItem("migraine_attacks", JSON.stringify(migraine_attacks));
        } catch (error) {
            localStorage.setItem("migraine_attacks", JSON.stringify([migraine_attack]));
        }
    }

    removeMigraineAttack(no) {
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            if (migraine_attacks.length < no) {
                return;
            }
            let new_migraine_attacks = [];
            for (let i = 0; i < migraine_attacks.length; i++) {
                const migraine_attack = migraine_attacks[i];
                if (i != no) {
                    new_migraine_attacks.push(migraine_attack);
                }
            }
            localStorage.setItem("migraine_attacks", JSON.stringify(new_migraine_attacks));
        } catch (error) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
        }
    }

    closeLastMigraineAttack() {
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let last_element = migraine_attacks.pop();
            last_element["DT_End"] = new Date();
            migraine_attacks.push(last_element);
            localStorage.setItem("migraine_attacks", JSON.stringify(migraine_attacks));
        } catch (error) {
            return;
        }
    }

    nextAutoincrement() {
        this.MigraineAttackAI++;
        localStorage.setItem("migraine_attack_ai", this.MigraineAttackAI);
        return this.MigraineAttackAI;
    }

    constructor() {
        let migraine_attack_ai = localStorage.getItem("migraine_attack_ai");
        if (migraine_attack_ai != undefined && migraine_attack_ai == Number(migraine_attack_ai)) {
            this.MigraineAttackAI = Number(migraine_attack_ai);
        } else {
            this.MigraineAttackAI = 1;
            localStorage.setItem("migraine_attack_ai", 1);
        }
    }
}


class Calendar {
    static monthNumberToName(month_number) {
        switch (month_number) {
            case 0:
                return "янв";
            case 1:
                return "фев";
            case 2:
                return "мар";
            case 3:
                return "апр";
            case 4:
                return "мая";
            case 5:
                return "июня";
            case 6:
                return "июля";
            case 7:
                return "авг";
            case 8:
                return "сен";
            case 9:
                return "окт";
            case 10:
                return "ноя";
            case 11:
                return "дек";
            default:
                break;
        }
    }
}

class BrowserSystem {
    /**
     * Is website launched as standalone application.
     * @returns _true_ if as standalone, _false_ if as website
     */
    static isStandalone() {
        if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone || document.referrer.includes('android-app://')) {
          return true;
        }
        return false;
    }
}


var Core = new MigrenoznikCore();
