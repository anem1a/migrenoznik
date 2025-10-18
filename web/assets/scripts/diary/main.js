
class MigraineAttack {
    constructor(dt_start, dt_end = null) {
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
    }

    static from_json(obj) {
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
    compose_migraine_diary();
}

function login_Clicked() {
    window.location.href = "/login/";
    //window.history.pushState(null, null, "/login/");
}

function compose_migraine_diary() {
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks();
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i];
        let diary_item = document.createElement("div");
        diary_item.className = "migre-v1-main-diary-item";
        let a = new Date();
        diary_item.innerHTML = `<b>Запись&nbsp;${i+1}.</b> ${migraine_attack.DT_Start.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_Start.getMonth())} ${migraine_attack.DT_Start.getFullYear()} ${migraine_attack.DT_Start.getHours() < 10 ? "0" : ""}${migraine_attack.DT_Start.getHours()}:${migraine_attack.DT_Start.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_Start.getMinutes()}`;
        if (migraine_attack.DT_End != null) {
            diary_item.innerHTML += ` &ndash; ${migraine_attack.DT_End.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_End.getMonth())} ${migraine_attack.DT_End.getFullYear()} ${migraine_attack.DT_End.getHours() < 10 ? "0" : ""}${migraine_attack.DT_End.getHours()}:${migraine_attack.DT_End.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_End.getMinutes()}`;
        }
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
}

async function login_button_Clicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;

    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch('/assets/actions/login.php', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            alert("Логин и пароль правильные");
        } else {
            alert("Неверный логин или пароль");
        }

    } catch(error) {
        console.error('Ошибка:', error.message);
    }
    
}

const Core = new MigrenoznikCore();