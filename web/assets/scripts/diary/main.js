
class MigraineAttack {
    constructor(dt_start, dt_end = null) {
        this.DT_Start = dt_start; /* Мария: имена переменных должны быть в стиле camelCase: DT_Start → startTime */
        this.DT_End = dt_end; /* Мария: имена переменных должны быть в стиле camelCase: DT_End → endTime */
    }

    static from_json(obj) { /* Мария: имена методов должны быть в стиле camelCase: from_json → fromJson */
        return new MigraineAttack(
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
    is_migraine_now() { /* Мария: имена методов должны быть в стиле camelCase: is_migraine_now → isMigraineNow */
        let migraine_now = localStorage.getItem("migraine_now"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_now → migraineNow */
        if (migraine_now == undefined) {
            localStorage.setItem("migraine_now", "false");
            return false;
        }
        return migraine_now == "true";
    }

    /**
     * Toggles user's migraine status, i.e. if user has migraine, stops it, otherwise starts it.
     */
    toggle_migraine_status() { /* Мария: имена методов должны быть в стиле camelCase: toggle_migraine_status → toggleMigraineStatus */
        if (this.is_migraine_now()) {
            localStorage.setItem("migraine_now", "false");
        } else {
            localStorage.setItem("migraine_now", "true");
        }
    }

    /**
     * Returns the entire diary of migraine attacks.
     */
    get_migraine_attacks() { /* Мария: имена методов должны быть в стиле camelCase: get_migraine_attacks → getMigraineAttacks */
        let migraine_attacks = localStorage.getItem("migraine_attacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        if (migraine_attacks == undefined) {
            return [];
        }
        migraine_attacks = JSON.parse(migraine_attacks);
        let migraine_attacks_obj = []; /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks_obj → migraineAttacksObj */
        for (const migraine_attack of migraine_attacks) {
            migraine_attacks_obj.push(MigraineAttack.from_json(migraine_attack));
        }
        return migraine_attacks_obj;
    }

    /**
     * Adds new migraine attack to the end of the list.
     */
    add_new_migraine_attack(migraine_attack) { /* Мария: имена методов должны быть в стиле camelCase: add_new_migraine_attack → addNewMigraineAttack */
        let migraine_attacks = localStorage.getItem("migraine_attacks"); /* Мария: имена переменных должны быть в стиле camelCase:  migraine_attacks →  migraineAttacks */
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

    close_last_migraine_attack() { /* Мария: имена методов должны быть в стиле camelCase: close_last_migraine_attack → closeLastMigraineAttack */
        let migraine_attacks = localStorage.getItem("migraine_attacks"); /* Мария: имена переменных должны быть в стиле camelCase:  migraine_attacks → migraineAttacks */
        if (migraine_attacks == undefined) {
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let last_element = migraine_attacks.pop(); /* Мария: имена переменных должны быть в стиле camelCase: last_element → lastElement */
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
function migraine_now_button_Clicked() { /* Мария: имена функций должны быть в стиле camelCase: migraine_now_button_Clicked → migraineNowButtonClicked */
    if (Core.is_migraine_now()) {
        Core.toggle_migraine_status();
        Core.close_last_migraine_attack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас"; /* Мария: максимальная длина строки — 80 символов */
    } else {
        Core.toggle_migraine_status();
        Core.add_new_migraine_attack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени"; /* Мария: максимальная длина строки — 80 символов */
    }
    compose_migraine_diary();
}

function compose_migraine_diary() { /* Мария: имена функций должны быть в стиле camelCase: compose_migraine_diary → composeMigraineDiary */
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks(); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i]; /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: migraine_attack → MIGRAINE_ATTACK */
        let diary_item = document.createElement("div"); /* Мария: имена переменных должны быть в стиле camelCase: diary_item → diaryItem */
        diary_item.className = "migre-v1-main-diary-item";
        let a = new Date(); /* Мария: необходимо избегать однобуквенных имен, кроме общепринятых (i, j в циклах): a → today */ 
        diary_item.innerHTML = `<b>Запись&nbsp;${i+1}.</b> ${migraine_attack.DT_Start.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_Start.getMonth())} ${migraine_attack.DT_Start.getFullYear()} ${migraine_attack.DT_Start.getHours() < 10 ? "0" : ""}${migraine_attack.DT_Start.getHours()}:${migraine_attack.DT_Start.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_Start.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов */
        if (migraine_attack.DT_End != null) {
            diary_item.innerHTML += ` &ndash; ${migraine_attack.DT_End.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_End.getMonth())} ${migraine_attack.DT_End.getFullYear()} ${migraine_attack.DT_End.getHours() < 10 ? "0" : ""}${migraine_attack.DT_End.getHours()}:${migraine_attack.DT_End.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_End.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов */
        }
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
}

const Core = new MigrenoznikCore(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: Core → CORE */
