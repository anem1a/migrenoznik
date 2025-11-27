
class MigraineAttack {
    constructor(local_id, dt_start, strength, dt_end = null, triggers = [], id = null) {
        this.LocalID = local_id;
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
        this.Strength = strength;
        this.Triggers = triggers;
        this.ID = id;
    }

    static from_json(obj) {
        return new MigraineAttack(
            obj["LocalID"] == null ? null : Number(obj["LocalID"]),
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["Strength"] == null ? null : Number(obj["Strength"]),
            obj["DT_End"] == null ? null : new Date(obj["DT_End"]),
            obj["Triggers"] == null ? [] : obj["Triggers"],
            obj["ID"] == null ? null : Number(obj["ID"]),
        );
    }
}

class MigraineTrigger {
    static total_triggers() {
        return 19;
    }
    static code_to_name(code) {
        switch (code) {
            case 0:
                return 'Менструальный цикл'
            case 1:
                return 'Стресс'
            case 2:
                return 'Нарушение сна'
            case 3:
                return 'Переутомление'
            case 4:
                return 'Голод'
            case 5:
                return 'Яркий свет'
            case 6:
                return 'Громкие звуки'
            case 7:
                return 'Сильные запахи'
            case 8:
                return 'Кофеин'
            case 9:
                return 'Алкоголь'
            case 10:
                return 'Красное вино'
            case 11:
                return 'Пиво'
            case 12:
                return 'Темный шоколад'
            case 13:
                return 'Твердый сыр'
            case 14:
                return 'Цитрусы'
            case 15:
                return 'Орехи'
            case 16:
                return 'Консерванты'
            case 17:
                return 'Погода'
            case 18:
                return 'Препараты'
            default:
                break;
        }
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
     * Returns the current migraine attack. Undefined if no attacks found or there's no migraine now.
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

    /**
     * Adds new migraine attack.
     */
    async add_new_migraine_attack(migraine_attack) {
        /* Save to local storage */
        localStorage.setItem("current_migraine_attack", JSON.stringify(migraine_attack));
    }

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

    async close_current_migraine_attack() {
        let attacks = this.get_migraine_attacks();
        let current = this.get_current_migraine_attack();
        current.DT_End = new Date();
        attacks.push(current);
        localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
        localStorage.removeItem("current_migraine_attack");

        /* Save to remote storage */
        let data = new FormData();
        data.append("dt_start", current.DT_Start.getTime());
        data.append("dt_end", current.DT_End.getTime());
        data.append("strength", current.Strength);
        data.append("triggers", JSON.stringify(current.Triggers));
        
        const response = await fetch('/api/add_entry', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            this.assign_id_to_migraine_attack(current.LocalID, result["id"]);
        }
    }

    edit_strength_of_current_migraine_attack(strength) {
        let current = this.get_current_migraine_attack();
        current.Strength = strength;
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    add_trigger_to_current_migraine_attack(trigger) {
        let current = this.get_current_migraine_attack();
        current.Triggers.push(trigger);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

    remove_trigger_from_current_migraine_attack(trigger) {
        let current = this.get_current_migraine_attack();
        current.Triggers = current.Triggers.filter(item => item !== trigger);
        localStorage.setItem("current_migraine_attack", JSON.stringify(current));
    }

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
    }
}

function display_migraine_now_block(show) {
    if (show) {
        document.getElementById("migre-now-wrapper").style.display = 'block';
    } else {
        document.getElementById("migre-now-wrapper").style.display = 'none';
    }
}

function configure_main_bottom_buttoms(migraine_now) {
    if (migraine_now) {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить конец мигрени";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'none';
    } else {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить мигрень сейчас";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'block';
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
        let triggers = [];
        for (const trigger of migraine_attack.Triggers) {
            triggers.push(MigraineTrigger.code_to_name(trigger));
        }
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
        diary_item.appendChild(create_element(
            "div",
            "migre-v1-main-diary-item-triggers",
            undefined,
            `Триггеры: ${triggers.join(", ")}`
        ));
        let delete_button = create_element(
            "a",
            undefined, undefined,
            "Удалить"
        );
        delete_button.addEventListener("click", () => {
            delete_entry_Clicked(migraine_attack.LocalID);
        })
        diary_item.appendChild(delete_button);
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
}

function delete_entry_Clicked(local_id) {
    Core.remove_migraine_attack(local_id);
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

function migraine_now_strength_Inputed(value) {
    document.getElementById("migre-current-strength-value").innerHTML = value;
}

function migraine_now_strength_Changed(value) {
    Core.edit_strength_of_current_migraine_attack(value);
}

function toggle_trigger_Clicked(id, item) {
    let selected = item.getAttribute("data-selected") == "true";
    if (selected) {
        Core.remove_trigger_from_current_migraine_attack(id);
    } else {
        Core.add_trigger_to_current_migraine_attack(id);
    }
    item.setAttribute("data-selected", selected == false);
}

const Core = new MigrenoznikCore();
