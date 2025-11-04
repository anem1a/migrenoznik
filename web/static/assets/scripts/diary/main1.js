
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

function logon_show_error_box(error_text) {
    document.getElementById("migre-id-main-login-errorbox").innerHTML = `<p>${error_text}</p>`
    document.getElementById("migre-id-main-login-errorbox").classList.add('migre-v1-visible');
}