
class MigraineAttack {
    constructor(dtStart, dtEnd = null) { /* Мария: имена переменных должны быть в стиле camelCase: dt_start → dtStart, dt_end → dtEnd */
        this.startTime = dtStart; /* Мария: имена переменных должны быть в стиле camelCase: DT_Start → startTime */
        this.endTime = dtEnd; /* Мария: имена переменных должны быть в стиле camelCase: DT_End → endTime */
    }

    static fromJson(obj) { /* Мария: имена методов должны быть в стиле camelCase: from_json → fromJson */
        return new MigraineAttack(
            obj["startTime"] == null ? null : new Date(obj["startTime"]),
            obj["endTime"] == null ? null : new Date(obj["endTime"]), 
        );
    }
}

class MigrenoznikCore {

    /**
     * Does user have migraine now.
     * @returns True if yes, False if no
     */
    isMigraineNow() { /* Мария: имена методов должны быть в стиле camelCase: is_migraine_now → isMigraineNow */
        let migraineNow = localStorage.getItem("migraineNow"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_now → migraineNow */
        if (migraineNow == undefined) {
            localStorage.setItem("migraineNow", "false");
            return false;
        }
        return migraineNow == "true";
    }

    /**
     * Toggles user's migraine status, i.e. if user has migraine, stops it, otherwise starts it.
     */
    toggleMigraineStatus() { /* Мария: имена методов должны быть в стиле camelCase: toggle_migraine_status → toggleMigraineStatus */
        if (this.isMigraineNow()) {
            localStorage.setItem("migraineNow", "false");
        } else {
            localStorage.setItem("migraineNow", "true");
        }
    }

    /**
     * Returns the entire diary of migraine attacks.
     */
    getMigraineAttacks() { /* Мария: имена методов должны быть в стиле camelCase: get_migraine_attacks → getMigraineAttacks */
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
        if (migraineAttacks == undefined) {
            return [];
        }
        migraineAttacks = JSON.parse(migraineAttacks);
        let migraineAttacksObj = []; /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks_obj → migraineAttacksObj */
        for (const MIGRAINE_ATTACK of migraineAttacks) {
            migraineAttacksObj.push(MigraineAttack.fromJson(MIGRAINE_ATTACK));
        }
        return migraineAttacksObj;
    }

    /**
     * Adds new migraine attack to the end of the list.
     */
    addNewMigraineAttack(migraineAttack) { /* Мария: имена методов должны быть в стиле camelCase: add_new_migraine_attack → addNewMigraineAttack */
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase:  migraine_attacks →  migraineAttacks */
        if (migraineAttacks == undefined) {
            localStorage.setItem("migraineAttacks", JSON.stringify([migraineAttack]));
            return;
        }
        try {
            migraineAttacks = JSON.parse(migraineAttacks);
            migraineAttacks.push(migraineAttack);
            localStorage.setItem("migraineAttacks", JSON.stringify(migraineAttacks));
        } catch (error) {
            localStorage.setItem("migraineAttacks", JSON.stringify([migraineAttack]));
        }
    }

    closeLastMigraineAttack() { /* Мария: имена методов должны быть в стиле camelCase: close_last_migraine_attack → closeLastMigraineAttack */
        let migraineAttacks = localStorage.getItem("migraineAttacks"); /* Мария: имена переменных должны быть в стиле camelCase:  migraine_attacks → migraineAttacks */
        if (migraineAttacks == undefined) {
            return;
        }
        try {
            migraineAttacks = JSON.parse(migraineAttacks);
            let lastElement = migraineAttacks.pop(); /* Мария: имена переменных должны быть в стиле camelCase: last_element → lastElement */
            lastElement["endTime"] = new Date();
            migraineAttacks.push(lastElement);
            localStorage.setItem("migraineAttacks", JSON.stringify(migraineAttacks));
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
function migraineNowButtonClicked() { /* Мария: имена функций должны быть в стиле camelCase: migraine_now_button_Clicked → migraineNowButtonClicked */
    if (CORE.isMigraineNow()) {
        CORE.toggleMigraineStatus();
        CORE.closeLastMigraineAttack();
        document.getElementById("migre-diary-main-bottom-button").innerText = 
            "Отметить мигрень сейчас"; /* Мария: максимальная длина строки — 80 символов */
    } else {
        CORE.toggleMigraineStatus();
        CORE.addNewMigraineAttack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = 
            "Отметить конец мигрени"; /* Мария: максимальная длина строки — 80 символов */
    }
    composeMigraineDiary();
}

function composeMigraineDiary() { /* Мария: имена функций должны быть в стиле camelCase: compose_migraine_diary → composeMigraineDiary */
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraineAttacks = CORE.getMigraineAttacks(); /* Мария: имена переменных должны быть в стиле camelCase: migraine_attacks → migraineAttacks */
    for (let i = 0; i < migraineAttacks.length; i++) {
        const MIGRAINE_ATTACK = migraineAttacks[i]; /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: migraine_attack → MIGRAINE_ATTACK */
        let diaryItem = document.createElement("div"); /* Мария: имена переменных должны быть в стиле camelCase: diary_item → diaryItem */
        diaryItem.className = "migre-v1-main-diary-item";
        let today = new Date(); /* Мария: необходимо избегать однобуквенных имен, кроме общепринятых (i, j в циклах): a → today */ 
        diaryItem.innerHTML = 
            `<b>Запись&nbsp;${i+1}.</b> 
            ${MIGRAINE_ATTACK.startTime.getDate()} 
            ${Calendar.monthNumberToName(MIGRAINE_ATTACK.startTime.getMonth())} 
            ${MIGRAINE_ATTACK.startTime.getFullYear()} 
            ${MIGRAINE_ATTACK.startTime.getHours() < 10 ? "0" : ""}
            ${MIGRAINE_ATTACK.startTime.getHours()}:
            ${MIGRAINE_ATTACK.startTime.getMinutes() < 10 ? "0" : ""}
            ${MIGRAINE_ATTACK.startTime.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов; имена методов должны быть в стиле camelCase: month_number_to_name → monthNumberToName */
        if (MIGRAINE_ATTACK.endTime != null) {
            diaryItem.innerHTML += 
                ` &ndash; ${MIGRAINE_ATTACK.endTime.getDate()} 
                ${Calendar.monthNumberToName(MIGRAINE_ATTACK.endTime.getMonth())} 
                ${MIGRAINE_ATTACK.endTime.getFullYear()} 
                ${MIGRAINE_ATTACK.endTime.getHours() < 10 ? "0" : ""}
                ${MIGRAINE_ATTACK.endTime.getHours()}:
                ${MIGRAINE_ATTACK.endTime.getMinutes() < 10 ? "0" : ""}
                ${MIGRAINE_ATTACK.endTime.getMinutes()}`; /* Мария: максимальная длина строки — 80 символов */
        }
        document.getElementById("migre-diary-wrapper").appendChild(diaryItem);
    }
}

const CORE = new MigrenoznikCore(); /* Мария: константы пишутся ЗАГЛАВНЫМИ_БУКВАМИ_С_ПОДЧЕРКИВАНИЯМИ: Core → CORE */
