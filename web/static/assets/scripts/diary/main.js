
class MigraineAttack {
    constructor(local_id, dt_start, dt_end = null, id = null) {
        this.LocalID = local_id;
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
    }

    static from_json(obj) {
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

    remove_migraine_attack(no) {
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

    next_autoincrement() {
        localStorage.setItem("migraine_attack_ai", this.MigraineAttackAI + 1);
        return this.MigraineAttackAI++;
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
        Core.add_new_migraine_attack(new MigraineAttack(Core.next_autoincrement(), new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    compose_migraine_diary();
}

function login_Clicked() {
    window.location.href = "/login/";
    //window.history.pushState(null, null, "/login/");
}

async function logout_Clicked() {
    try {
        let data = new FormData();
        
        const response = await fetch('/api/logout', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/login/";
        }

    } catch(error) {
        
    }
}

function create_element(el_tag, el_class, el_id, el_html) {
    let elem = document.createElement(el_tag);
    if (el_class) {
        elem.className = el_class;
    }
    if (el_id) {
        elem.id = el_id;
    }
    if (el_html) {
        elem.innerHTML = el_html;
    }
    return elem;
}

function compose_migraine_diary() {
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks();
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i];
        let diary_item = create_element(
            "div",
            "migre-v1-main-diary-item",
            undefined,
            `<b>Запись&nbsp;${i+1}.</b> ${migraine_attack.DT_Start.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_Start.getMonth())} ${migraine_attack.DT_Start.getFullYear()} ${migraine_attack.DT_Start.getHours() < 10 ? "0" : ""}${migraine_attack.DT_Start.getHours()}:${migraine_attack.DT_Start.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_Start.getMinutes()}`
        );
        if (migraine_attack.DT_End != null) {
            diary_item.innerHTML += ` &ndash; ${migraine_attack.DT_End.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_End.getMonth())} ${migraine_attack.DT_End.getFullYear()} ${migraine_attack.DT_End.getHours() < 10 ? "0" : ""}${migraine_attack.DT_End.getHours()}:${migraine_attack.DT_End.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_End.getMinutes()}`;
            diary_item.innerHTML += ` <a onclick=\"delete_entry_Clicked(${i})\">Удалить</a>`;
        }
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
}

function delete_entry_Clicked(no) {
    Core.remove_migraine_attack(no);
    compose_migraine_diary();
}

async function login_button_Clicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;

    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch('/api/login', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/";
        } else {
            logon_show_errorbox("Неверный логин или пароль.");
        }

    } catch(error) {
        logon_show_errorbox("Ошибка на сервере.");
    }
    
}

function validate_login(login) {
    const regex = /^[a-zA-Z_]{5,20}$/;
    return regex.test(login);
}

function validate_password(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

async function signup_button_Clicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const password_repeat = document.getElementsByName('password_repeat')[0].value;

    if (password != password_repeat) {
        logon_show_errorbox("Пароли не совпадают.");
        return;
    }
    if (password.length == 0) {
        logon_show_errorbox("Пароль не должен быть пустым.");
        return;
    }
    if (login.length == 0) {
        logon_show_errorbox("Логин не должен быть пустым.");
        return;
    }
    if (!validate_login(login)) {
        logon_show_errorbox("Логин должен быть от 5 до 20 символов, допускаются только латинские буквы и символ \"_\".");
        return;
    }
    if (!validate_password(password)) {
        logon_show_errorbox("Пароль должен быть не менее 8 символов, содержать как минимум одну заглавную, одну строчную букву и одну цифру.");
        return;
    }

    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/";
        } else {
            if (result["code"] == 1) {
                logon_show_errorbox("Пользователь с таким логином уже есть.");
            } else if (result["code"] == 2) {
                logon_show_errorbox("Пароль слишком простой.");
            } else if (result["code"] == 3) {
                logon_show_errorbox("Логин содержит недопустимые символы.");
            } else if (result["code"] == 4) {
                if (password.length == 0) {
                    logon_show_errorbox("Пароль не должен быть пустым.");
                } else if (login.length == 0) {
                    logon_show_errorbox("Логин не должен быть пустым.");
                } else {
                    logon_show_errorbox("Логин или пароль пуст.");
                }
            } else {
                logon_show_errorbox("Ошибка на сервере.");
            }
        }

    } catch(error) {
        logon_show_errorbox("Ошибка на сервере.");
    }
    
}

function login_fields_Oninput() {
    document.getElementById("migre-id-main-login-errorbox").classList.remove('migre-v1-visible');
}

function logon_show_errorbox(error_text) {
    document.getElementById("migre-id-main-login-errorbox").innerHTML = `<p>${error_text}</p>`
    document.getElementById("migre-id-main-login-errorbox").classList.add('migre-v1-visible');
}

const Core = new MigrenoznikCore();