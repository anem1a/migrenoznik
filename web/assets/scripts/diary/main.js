
class MigraineAttack {
    constructor(dt_start, dt_end = null) {
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
    }
}

class MigrenoznikCore {

    /**
     * Does user have migraine now.
     * @returns True if yes, False if no
     */
    is_migraine_now() {
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
    toggle_migraine_status() {
        if (this.is_migraine_now()) {
            localStorage.setItem("migraine_now", "false");
        } else {
            localStorage.setItem("migraine_now", "true");
        }
    }

    /**
     * Returns the entire diary of migraine attacks.
     */
    get_migraine_attacks() {

    }

    /**
     * Adds new migraine attack to the end of the list.
     */
    add_new_migraine_attack(migraine_attack) {
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

    close_last_migraine_attack() {
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

    constructor() {
        
    }
}

/**
 * Onclick event of pressing the "Migraine now" button
 */
function migraine_now_button_Clicked() {
    if (Core.is_migraine_now()) {
        Core.toggle_migraine_status();
        Core.close_last_migraine_attack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        Core.toggle_migraine_status();
        Core.add_new_migraine_attack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
}

const Core = new MigrenoznikCore();