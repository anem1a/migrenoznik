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
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
            return [];
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let migraine_attacks_obj = [];
            for (const migraine_attack of migraine_attacks) {
                migraine_attacks_obj.push(MigraineAttack.from_json(migraine_attack));
            }
            migraine_attacks_obj.sort((a, b) => {
                return new Date(b.DT_Start) - new Date(a.DT_Start);
            });
            return migraine_attacks_obj;
        } catch (error) {
            return [];
        }
    }

    /**
     * Fetches remote migraine attacks from server and adds new ones to local storage.
     */
    async fetch_remote_migraine_attacks() {
        let response = await fetch('https://migrenoznik.ru/api/entries');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        if (data["success"] == false) {
            this.LoggedIn = false;
            Core.clear_local_storage_from_remote_entries();
            return;
        }
        this.LoggedIn = true;
        let attacks = Core.get_migraine_attacks();
        let new_attacks = [];
        // костыль, пока Аня не переделала
        for (let i = 0; i < data["entries"].length; i++) {
            for (let j = 0; j < data["entries"][i]["Triggers"].length; j++) {
                const element = data["entries"][i]["Triggers"][j];
                for (let k = 0; k < MigraineTrigger.total_triggers(); k++) {
                    if (MigraineTrigger.code_to_name(k) == element) {
                        data["entries"][i]["Triggers"][j] = k;
                    }
                }
            }
            for (let j = 0; j < data["entries"][i]["Symptoms"].length; j++) {
                const element = data["entries"][i]["Symptoms"][j];
                for (let k = 0; k < MigraineSymptom.total_symptoms(); k++) {
                    if (MigraineSymptom.code_to_name(k) == element) {
                        data["entries"][i]["Symptoms"][j] = k;
                    }
                }
            }
            for (let j = 0; j < data["entries"][i]["Drugs"].length; j++) {
                const element = data["entries"][i]["Drugs"][j];
                for (let k = 0; k < MigraineDrug.total_drugs(); k++) {
                    if (MigraineDrug.code_to_name(k) == element) {
                        data["entries"][i]["Drugs"][j] = MigraineDrug.code_to_atx(k);
                    }
                }
            }
            
            data["entries"][i]["DT_Start"] = `20${data["entries"][i]["DT_Start"].substring(6,8)}-${data["entries"][i]["DT_Start"].substring(3,5)}-${data["entries"][i]["DT_Start"].substring(0,2)}T00:00Z`;

            // Конец костыля
            let is_in_local_storage = false;
            for (const attack of attacks) {
                if (attack.ID == data["entries"][i]["ID"]) {
                    is_in_local_storage = true;
                    break;
                }
            }
            if (!is_in_local_storage) {
                console.log(data["entries"][i]);
                console.log(MigraineAttack.from_json(data["entries"][i]));
                new_attacks.push(MigraineAttack.from_json(data["entries"][i]));
            }
        }
        attacks.push(...new_attacks);
        localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
        compose_migraine_diary();
    }

    /**
     * Clears local storage from entries that are already stored on remote server.
     */
    clear_local_storage_from_remote_entries() {
        let attacks = this.get_migraine_attacks();
        let only_local = [];
        for (const attack of attacks) {
            if (attack.ID == null) {
                only_local.push(attack);
            }
        }
        localStorage.setItem("migraine_attacks", JSON.stringify(only_local));
    }

    /**
     * Returns current migraine attack object if any.
     * @returns 
     */
    get_current_migraine_attack() {
        let current_migraine_attack = localStorage.getItem("current_migraine_attack");
        try {
            current_migraine_attack = JSON.parse(current_migraine_attack);
            let current_migraine_attack_obj = MigraineAttack.from_json(current_migraine_attack);
            return current_migraine_attack_obj;
        } catch (error) {
            return undefined;
        }
    }

    /**
     * Assigns remote ID from server to migraine attack with given local ID.
     * @param {*} local_id - local ID of migraine attack
     * @param {*} id - remote ID from server
     */
    assign_id_to_migraine_attack(local_id, id) {
        let attacks = this.get_migraine_attacks();
        for (let i = 0; i < attacks.length; i++) {
            if (attacks[i].LocalID == local_id) {
                attacks[i].ID = id;
                break;
            }
        }
        localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
    }

    set_attack_status(local_id, status) {
        let attacks = this.get_migraine_attacks();
        for (let i = 0; i < attacks.length; i++) {
            if (attacks[i].LocalID == local_id) {
                attacks[i].Status = status;
                break;
            }
        }
        localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
    }

    updateAttack(local_id, updates) {
        const attacks = this.get_migraine_attacks();
        const index = attacks.findIndex(attack => attack.LocalID == local_id);
        
        if (index !== -1) {
            attacks[index] = { ...attacks[index], ...updates };
            localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
        }
    }

    /**
     * Adds new migraine attack.
     */
    async add_new_migraine_attack(migraine_attack) {
        /* Save to local storage */
        localStorage.setItem("current_migraine_attack", JSON.stringify(migraine_attack));
    }

    /**
     * Deletes migraine attack with given local ID from local storage.
     * @param {*} local_id - local ID of migraine attack
     * @returns 
     */
    remove_migraine_attack(local_id) {
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let new_migraine_attacks = [];
            for (let i = 0; i < migraine_attacks.length; i++) {
                const migraine_attack = MigraineAttack.from_json(migraine_attacks[i]);
                if (migraine_attack.LocalID != local_id) {
                    new_migraine_attacks.push(migraine_attack);
                }
            }
            localStorage.setItem("migraine_attacks", JSON.stringify(new_migraine_attacks));
        } catch (error) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
        }
    }

    /**
     * Sends migraine attack to remote server.
     * @param {*} current - migraine attack to send
     */
    async send_migraine_attack(current) {
        /* Save to remote storage */
        let data = new FormData();
        data.append("dt_start", current.DT_Start.getTime());
        data.append("dt_end", current.DT_End.getTime());
        data.append("strength", current.Strength);
        data.append("triggers", JSON.stringify(current.Triggers));
        data.append("symptoms", JSON.stringify(current.Symptoms));
        data.append("drugs", JSON.stringify(current.Drugs.map(element => MigraineDrug.code_to_atx(element))));
        
        const response = await fetch('/api/add_entry', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            this.assign_id_to_migraine_attack(current.LocalID, result["id"]);
        } else if (result["error_code"] != 13) {
            this.remove_migraine_attack(current.LocalID);
            compose_migraine_diary();
        }
    }

    /**
     * Closes (saves as ended) current migraine attack.
     */
    async close_current_migraine_attack() {
        let attacks = this.get_migraine_attacks();
        let current = this.get_current_migraine_attack();
        current.DT_End = new Date();
        if (this.LoggedIn) {
            current.Status = "PENDING_SERVER_CREATING";
        } else {
            current.Status = "LOCAL_ONLY";
        }
        attacks.push(current);
        localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
        localStorage.removeItem("current_migraine_attack");

        if (!this.LoggedIn) {
            compose_migraine_diary();
            return;
        }

        /* Save to remote storage */
        let data = new FormData();
        data.append("dt_start", current.DT_Start.getTime());
        data.append("dt_end", current.DT_End.getTime());
        data.append("strength", current.Strength);
        data.append("triggers", JSON.stringify(current.Triggers));
        data.append("symptoms", JSON.stringify(current.Symptoms));
        data.append("drugs", JSON.stringify(current.Drugs.map(element => MigraineDrug.code_to_atx(element))));
        
        const response = await fetch('/api/add_entry', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            this.updateAttack(current.LocalID, { ID: result["id"], Status: "BACKED_UP" });
        } else if (result["error_code"] == 13) {
            this.updateAttack(current.LocalID, { Status: "FAILED_SERVER_CREATING" });
            compose_migraine_diary();
        } else {
            this.remove_migraine_attack(current.LocalID);
            //this.updateAttack(current.LocalID, { Status: "FAILED_SERVER_CREATING" });
            compose_migraine_diary();
        }
    }

    /**
     * Changes strength of current migraine attack.
     * @param {*} strength 
     */
    edit_strength_of_current_migraine_attack(strength) {
        let current = this.get_current_migraine_attack();
        current.Strength = strength;
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Adds trigger to current migraine attack.
     * @param {*} trigger 
     */
    add_trigger_to_current_migraine_attack(trigger) {
        let current = this.get_current_migraine_attack();
        current.add_trigger(trigger);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Adds symptom to current migraine attack.
     * @param {*} symptom 
     */
    add_symptom_to_current_migraine_attack(symptom) {
        let current = this.get_current_migraine_attack();
        current.Symptoms.push(symptom);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Adds drug to current migraine attack.
     * @param {*} symptom 
     */
    add_drug_to_current_migraine_attack(symptom) {
        let current = this.get_current_migraine_attack();
        current.Drugs.push(symptom);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Deletes trigger from current migraine attack.
     * @param {*} trigger 
     */
    remove_trigger_from_current_migraine_attack(trigger) {
        let current = this.get_current_migraine_attack();
        current.remove_trigger(trigger);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Deletes symptom from current migraine attack.
     * @param {*} symptom 
     */
    remove_symptom_from_current_migraine_attack(symptom) {
        let current = this.get_current_migraine_attack();
        current.Symptoms = current.Symptoms.filter(item => item !== symptom);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * Deletes drug from current migraine attack.
     * @param {*} symptom 
     */
    remove_drug_from_current_migraine_attack(symptom) {
        let current = this.get_current_migraine_attack();
        current.Drugs = current.Drugs.filter(item => item !== symptom);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    /**
     * This function returns next autoincrement value for migraine attacks and increments it in storage.
     * @returns 
     */
    next_autoincrement() {
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
        this.LoggedIn = false;
        this.Triggers = {
            "0": {
                "name": 'Менструальный цикл'
            },
            "1": {
                "name": 'Стресс'
            },
            "2": {
                "name": 'Нарушение сна'
            },
            "3": {
                "name": 'Переутомление'
            },
            "4": {
                "name": 'Голод'
            },
            "5": {
                "name": 'Яркий свет'
            },
            "6": {
                "name": 'Громкие звуки'
            },
            "7": {
                "name": 'Сильные запахи'
            },
            "8": {
                "name": 'Кофеин'
            },
            "9": {
                "name": 'Алкоголь'
            },
            "10": {
                "name": 'Красное вино'
            },
            "11": {
                "name": 'Пиво'
            },
            "12": {
                "name": 'Темный шоколад'
            },
            "13": {
                "name": 'Твердый сыр'
            },
            "14": {
                "name": 'Цитрусы'
            },
            "15": {
                "name": 'Орехи'
            },
            "16": {
                "name": 'Консерванты'
            },
            "17": {
                "name": 'Погода'
            },
            "18": {
                "name": 'Препараты'
            },
        };
    }
}

/**
 * Onclick event of pressing the "Migraine now" button
 */
function migraine_now_button_Clicked() {
    if (Core.is_migraine_now()) {
        Core.toggle_migraine_status();
        Core.close_current_migraine_attack();
        configure_main_bottom_buttoms(false);
        document.getElementById("migre-now-wrapper").style.display = 'none';
    } else {
        Core.toggle_migraine_status();
        for (let i = 0; i < MigraineTrigger.total_triggers(); i++) {
            document.getElementById(`migre-trigger-${i}`).setAttribute("data-selected", false);
        }
        for (let i = 0; i < MigraineSymptom.total_symptoms(); i++) {
            document.getElementById(`migre-symptom-${i}`).setAttribute("data-selected", false);
        }
        for (let i = 0; i < MigraineDrug.total_drugs(); i++) {
            document.getElementById(`migre-drug-${i}`).setAttribute("data-selected", false);
        }
        let strength = document.getElementById("migre-current-strength-input").value;
        Core.add_new_migraine_attack(new MigraineAttack(Core.next_autoincrement(), new Date(), strength));
        configure_main_bottom_buttoms(true);
        let now = new Date();
        document.getElementById("migre-current-dt-start-value").innerHTML = `${now.getDate()} ${Calendar.month_number_to_name(now.getMonth())} ${now.getFullYear()} ${now.getHours() < 10 ? "0" : ""}${now.getHours()}:${now.getMinutes() < 10 ? "0" : ""}${now.getMinutes()}`;
        display_migraine_now_block(true);
    }
    compose_migraine_diary();
}

function login_Clicked() {
    window.location.href = "/login/";
    //window.history.pushState(null, null, "/login/");
}

/**
 * Onclick event of pressing the "Logout" button
 */
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
            Core.clear_local_storage_from_remote_entries();
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

/**
 * Composes migraine diary on the main page.
 */
function compose_migraine_diary() {
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    document.getElementById("migre-unspecified-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks();
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i];
        let diary_item = create_element(
            "div",
            "migre-v1-main-diary-item"
        );
        diary_item.appendChild(create_element(
            "div",
            "migre-v1-main-diary-item-basics",
            undefined,
            `<div class="migre-v1-main-diary-item-left"><img src="/static/assets/images/icons/calendar.svg">${Calendar.date_to_quick_format(migraine_attack.DT_Start)} &ndash; ${Calendar.date_to_quick_format(migraine_attack.DT_End)}</div>`
        ));
        diary_item.appendChild(create_element(
            "div",
            "migre-v1-main-diary-item-strength",
            undefined,
            `Интенсивность: <div class="migre-v1-main-diary-item-strength-visual" data-strength="${migraine_attack.Strength}"></div>${migraine_attack.Strength}/10`
        ));
        diary_item.appendChild(el_diary_triggers_block(migraine_attack.Triggers));
        diary_item.appendChild(el_diary_symptoms_block(migraine_attack.Symptoms));
        diary_item.appendChild(el_diary_drugs_block(migraine_attack.Drugs));
        let delete_button = create_element(
            "a",
            undefined, undefined,
            "Удалить"
        );
        delete_button.addEventListener("click", () => {
            delete_entry_Clicked(migraine_attack.LocalID);
        })
        diary_item.appendChild(delete_button);
        if (migraine_attack.Status == "LOCAL_ONLY" && Core.LoggedIn == true) {
            let save_button = create_element(
                "a",
                undefined, undefined,
                "Сохранить"
            );
            save_button.addEventListener("click", () => {
                Core.send_migraine_attack(migraine_attack);
            })
            diary_item.appendChild(save_button);
        } else {
            console.log(migraine_attack.Status);
            console.log(Core.LoggedIn);
        }
        if (migraine_attack.Status != "LOCAL_ONLY" || Core.LoggedIn == false) {
            document.getElementById("migre-diary-wrapper").appendChild(diary_item);
        } else {
            document.getElementById("migre-unspecified-diary-wrapper").appendChild(diary_item);
            document.getElementById("migre-unspecified-entries-wrapper").style.display = "block";
        }
    }
}

/**
 * Onclick event of pressing the "Delete" button on diary entry
 * @param {*} local_id 
 * @returns 
 */
async function delete_entry_Clicked(local_id) {
    let attacks = Core.get_migraine_attacks();
    let attack_to_delete = null;
    for (const attack of attacks) {
        if (attack.LocalID == local_id) {
            attack_to_delete = attack.ID;
            break;
        }
    }
    if (attack_to_delete == null) {
        Core.remove_migraine_attack(local_id);
        compose_migraine_diary();
        return;
    }
    let response = await fetch(`https://migrenoznik.ru/api/delete_entry?id=${attack_to_delete}`);
    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    if (data["success"]) {
        Core.remove_migraine_attack(local_id);
        compose_migraine_diary();
    }
}

/**
 * Shows error box on logon/signup page or perform loggin/signup.
 */
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

function calculate_password_strength(password) {
    let score = 0;

    // Базовые требования
    if (!validate_password(password)) {
        return 0;
    }

    // Длина пароля (+1 балл за каждые дополнительные 4 символа сверх минимальных 8)
    score += Math.min((password.length - 8) / 4, 3);

    // Наличие специальных символов (+1 балл)
    if (password.match(/[^a-zA-Z\d\s]/)) {
        score++;
    }

    // Количество уникальных символов (+1 балл за каждые дополнительные 5 уникальных символов)
    const uniqueChars = new Set(password.split('')).size;
    score += Math.min(uniqueChars / 5, 2); // Максимум +2 балла

    // Отсутствие очевидных последовательностей (-1 балл)
    if (/abc|def|ghi|jkl|mno|pqr|stu|vwx|yz|\d{3}/i.test(password)) {
        score--;
    }

    // Равномерность распределения символов (+1 балл)
    const groups = { lower: 0, upper: 0, digit: 0, special: 0 };
    for (let char of password) {
        if (char >= 'a' && char <= 'z') groups.lower++;
        else if (char >= 'A' && char <= 'Z') groups.upper++;
        else if (char >= '0' && char <= '9') groups.digit++;
        else groups.special++;
    }
    const stdDev = Object.values(groups).reduce(
        (acc, val) => acc + Math.pow(val - (password.length / 4), 2),
        0
    ) / 4;
    if (stdDev > 10) score++; // Чем ближе стандартное отклонение к нулю, тем лучше

    // Частота встречаемости редких символов (+1 балл)
    const rareSymbols = '@#$%^&*';
    if ([...password].some(char => rareSymbols.includes(char))) {
        score++;
    }

    // Нетривиальность структуры (+1 балл)
    if (
        !/(qwertyuiop|asdfghjkl|zxcvbnm|1234567890)/i.test(password) &&
        !/[a-z]{3,}|[A-Z]{3,}|\d{3,}/.test(password)
    ) {
        score++;
    }

    // Проверяем известный словарь часто употребляемых паролей (-2 балла)
    const commonPasswords = ['password', 'admin', '123456'];
    if (commonPasswords.some(pass => pass === password.toLowerCase())) {
        score -= 2;
    }

    return Math.max(Math.min(score, 10), 0);
}

function password_color(strength) {
    strength = Math.max(0, Math.min(10, strength));

    const normalizedStrength = strength / 10;

    let red, green, blue;

    if (normalizedStrength < 0.5) {
        red = 255;
        green = Math.round(normalizedStrength * 2 * 255);
        blue = 0;
    } else {
        red = Math.round((1 - normalizedStrength) * 2 * 255);
        green = 255;
        blue = 0;
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }

    return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
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

function signup_password_fields_Oninput() {
    login_fields_Oninput();
    let color = "black";
    let password = document.getElementById("migre-signup-password").value;
    if (password.length > 0) {
        color = password_color(calculate_password_strength(password));
    }

    document.getElementById("migre-signup-password").style.borderBottom = `1px solid ${color}`;
}

function signup_password2_fields_Oninput() {
    login_fields_Oninput();
    let color = "black";
    let password1 = document.getElementById("migre-signup-password").value;
    let password2 = document.getElementById("migre-signup-password2").value;
    if (password1 == password2 && password1.length > 0) {
        color = password_color(calculate_password_strength(password1));
    }

    document.getElementById("migre-signup-password2").style.borderBottom = `1px solid ${color}`;
}

function clear_element(elem) {
    while (elem?.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}

function stop_animation_and_remove(element) {
    if (!element) { 
        return; 
    }
    element.onanimationend = null;
    element.remove();
}

function play_animation(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    element.style.removeProperty('animation');
    element.style.animation = `trams-v3-ani-${animation} ${duration}s ${func} forwards`;
    element.style.animationDelay = `${delay}s`;
}

function play_animation_and_remove(element, animation, duration, func, absolute = true) {
    if (!element) {
        return;
    }
    if (absolute) {
        element.style.position = 'absolute';
    }
    play_animation(element, animation, duration, func, absolute);
    element.onanimationend = function () {
        stop_animation_and_remove(element);
    }
}

function play_animation_and_calm(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    play_animation(element, animation, duration, func, delay);
    element.onanimationend = function() {
        element.onanimationend = null;
        element.style.removeProperty('transform');
        element.style.removeProperty('animation');
    };
}

/**
 * Oninput event of sliding current migraine strength input
 * @param {*} value 
 */
function migraine_now_strength_Inputed(value) {
    document.getElementById("migre-current-strength-value").innerHTML = value;
}

/**
 * Onchange event of changing current migraine strength input
 * @param {*} value 
 */
function migraine_now_strength_Changed(value) {
    Core.edit_strength_of_current_migraine_attack(value);
}

/**
 * Adds or removes trigger from current migraine attack
 * @param {*} id 
 * @param {*} item 
 */
function toggle_trigger_Clicked(id, item) {
    let selected = item.getAttribute("data-selected") == "true";
    if (selected) {
        Core.remove_trigger_from_current_migraine_attack(id);
    } else {
        Core.add_trigger_to_current_migraine_attack(id);
    }
    item.setAttribute("data-selected", selected == false);
}

/**
 * Adds or removes symptom from current migraine attack
 * @param {*} id 
 * @param {*} item 
 */
function toggle_symptom_Clicked(id, item) {
    let selected = item.getAttribute("data-selected") == "true";
    if (selected) {
        Core.remove_symptom_from_current_migraine_attack(id);
    } else {
        Core.add_symptom_to_current_migraine_attack(id);
    }
    item.setAttribute("data-selected", selected == false);
}

/**
 * Adds or removes drug from current migraine attack
 * @param {*} id 
 * @param {*} item 
 */
function toggle_drug_Clicked(id, item) {
    let selected = item.getAttribute("data-selected") == "true";
    if (selected) {
        Core.remove_drug_from_current_migraine_attack(id);
    } else {
        Core.add_drug_to_current_migraine_attack(id);
    }
    item.setAttribute("data-selected", selected == false);
}

/**
 * Creating singleton instance of MigrenoznikCore
 */
const Core = new MigrenoznikCore();