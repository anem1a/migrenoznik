/**
 * Создаёт DOM-элемент с указанными тегом, классом, ID и HTML-содержимым.
 * @param {string} elTag - Тег создаваемого элемента (например, 'div', 'span').
 * @param {string|undefined} elClass - CSS-класс элемента (опционально).
 * @param {string|undefined} elId - ID элемента (опционально).
 * @param {string|undefined} elHtml - HTML-содержимое элемента (опционально).
 * @returns {HTMLElement} Созданный DOM-элемент.
 */
function createElement(elTag, elClass, elId, elHtml) {
    let element = document.createElement(elTag);
    if (elClass) element.className = elClass;
    if (elId) element.id = elId;
    if (elHtml) element.innerHTML = elHtml;
    return element;
}

/**
 * Форматирует дату в читаемую строку вида "день месяц год часы:минуты".
 * Если дата не передана, возвращает пустую строку.
 * @param {Date|null|undefined} date - Объект даты для форматирования.
 * @returns {string} Отформатированная строка с датой или пустая строка.
 */
function formatDate(date) {
    if (!date) return '';

    const day = date.getDate();
    const month = Calendar.monthNumberToName(date.getMonth());
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Формирует и отображает список записей мигреневого дневника.
 * Очищает контейнер и добавляет по одной записи на каждый эпизод мигрени.
 * Для каждой записи отображается дата начала, при наличии — дата окончания и кнопка удаления.
 */
function composeMigraineDiary() {
    const wrapper = document.getElementById("migre-diary-wrapper");
    wrapper.innerHTML = "";
    let migraineAttacks = Core.getMigraineAttacks();

    for (let i = 0; i < migraineAttacks.length; i++) {
        const migraineAttack = migraineAttacks[i];

        // Формируем начальную часть записи
        const startLabel = `<b>Запись&nbsp;${i + 1}.</b> ${formatDate(migraineAttack.DateStart)}`;
        let endLabel = '';
        if (migraineAttack.DateEnd) {
            endLabel = ` &ndash; ${formatDate(migraineAttack.DateEnd)}`;
        }

        // Создаём элемент
        const diaryItem = createElement(
            "div",
            "migre-v1-main-diary-item",
            undefined,
            startLabel + endLabel
        );

        // Добавляем кнопку "Удалить" с делегированным обработчиком
        if (migraineAttack.DateEnd) {
            const deleteLink = createElement(
                "a",
                undefined,
                undefined,
                " Удалить"
            );
            deleteLink.style.cursor = "pointer";
            deleteLink.addEventListener("click", () => deleteEntryClicked(i));
            diaryItem.appendChild(deleteLink);
        }
        wrapper.appendChild(diaryItem);
    }
}

/**
 * Удаляет запись о мигреневом приступе по индексу и обновляет отображение дневника.
 * @param {number} index - Индекс записи в списке приступов (начиная с 0).
 */
function deleteEntryClicked(no) {
    Core.removeMigraineAttack(no);
    composeMigraineDiary();
}


/**
 * Проверяет, соответствует ли логин заданным требованиям.
 * Логин должен содержать только латинские буквы и символ подчёркивания, длиной от 5 до 20 символов.
 * @param {string} login - Логин для проверки.
 * @returns {boolean} true, если логин валиден, иначе false.
 */
function validateLogin(login) {
    const regex = /^[a-zA-Z_]{5,20}$/;
    return regex.test(login);
}

/**
 * Проверяет, соответствует ли пароль базовым требованиям безопасности.
 * Должен содержать хотя бы одну строчную, одну заглавную букву и цифру, длина не менее 8 символов.
 * @param {string} password - Пароль для проверки.
 * @returns {boolean} true, если пароль соответствует требованиям, иначе false.
 */
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

/**
 * Оценивает сложность пароля по 10-балльной шкале.
 * Учитывает длину, разнообразие символов, отсутствие шаблонов и популярных паролей.
 * @param {string} password - Пароль для анализа.
 * @returns {number} Оценка от 0 до 10.
 */
function calculatePasswordStrength(password) {
    let score = 0;

    // Базовая валидация
    if (!validatePassword(password)) {
        return 0;
    }

    // Пошаговые проверки
    score += checkLength(password);
    score += checkSpecialChars(password);
    score += checkUniqueChars(password);
    score -= checkCommonSequences(password) ? 1 : 0;
    score += checkCharacterDistribution(password);
    score += checkRareSymbols(password);
    score += checkNonTrivialStructure(password);
    score -= checkCommonPasswords(password) ? 2 : 0;

    return Math.max(Math.min(score, 10), 0);
}

// === Вспомогательные функции проверки ===

/**
 * +1 балл за каждые 4 символа сверх 8, максимум +3.
 * @param {string} password
 * @returns {number} От 0 до 3.
 */
function checkLength(password) {
    return Math.min(Math.floor((password.length - 8) / 4), 3);
}

/**
 * +1, если есть хотя бы один специальный символ (не буква, не цифра, не пробел).
 * @param {string} password
 * @returns {number} 1 или 0.
 */
function checkSpecialChars(password) {
    return /[^a-zA-Z\d\s]/.test(password) ? 1 : 0;
}

/**
 * +1 за каждые 5 уникальных символов, максимум +2.
 * @param {string} password
 * @returns {number} От 0 до 2.
 */
function checkUniqueChars(password) {
    const uniqueChars = new Set(password.split('')).size;
    return Math.min(Math.floor(uniqueChars / 5), 2);
}

/**
 * -1, если пароль содержит очевидные последовательности (abc, 123 и т.п.).
 * @param {string} password
 * @returns {boolean} true, если найдена последовательность.
 */
function checkCommonSequences(password) {
    return /abc|def|ghi|jkl|mno|pqr|stu|vwx|yz|\d{3}/i.test(password);
}

/**
 * +1, если символы равномерно распределены по группам (строчные, заглавные, цифры, спецсимволы).
 * @param {string} password
 * @returns {number} 1 или 0.
 */
function checkCharacterDistribution(password) {
    const groups = { lower: 0, upper: 0, digit: 0, special: 0 };
    for (const char of password) {
        if (/[a-z]/.test(char)) groups.lower++;
        else if (/[A-Z]/.test(char)) groups.upper++;
        else if (/[0-9]/.test(char)) groups.digit++;
        else groups.special++;
    }
    const mean = password.length / 4;
    const variance = Object.values(groups)
        .reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 4;
    return variance > 10 ? 1 : 0;
}

/**
 * +1, если используются редкие спецсимволы (@#$%^&*).
 * @param {string} password
 * @returns {number} 1 или 0.
 */
function checkRareSymbols(password) {
    const rareSymbols = '@#$%^&*';
    return [...password].some(char => rareSymbols.includes(char)) ? 1 : 0;
}

/**
 * +1, если пароль не содержит клавиатурных последовательностей и длинных повторов.
 * @param {string} password
 * @returns {number} 1 или 0.
 */
function checkNonTrivialStructure(password) {
    const hasKeyboardSequence = /(qwertyuiop|asdfghjkl|zxcvbnm|1234567890)/i.test(password);
    const hasLongRepeats = /[a-z]{3,}|[A-Z]{3,}|\d{3,}/.test(password);
    return !hasKeyboardSequence && !hasLongRepeats ? 1 : 0;
}

/**
 * Проверяет, не входит ли пароль в список распространённых.
 * @param {string} password
 * @returns {boolean} true, если пароль общеизвестный.
 */
function checkCommonPasswords(password) {
    const commonPasswords = ['password', 'admin', '123456'];
    return commonPasswords.some(pass => pass === password.toLowerCase());
}
/**
 * Преобразует числовое значение в цвет по градиенту от красного к зелёному.
 * @param {number} value - Текущее значение (например, 7).
 * @param {number} max - Максимальное значение шкалы (например, 10).
 * @returns {string} Цвет в формате HEX (например, '#ff9900').
 */
function gradientColor(value, max = 10) {
    const normalized = Math.max(0, Math.min(value, max)) / max;
    let red, green, blue;

    if (normalized < 0.5) {
        red = 255;
        green = Math.round(normalized * 2 * 255);
        blue = 0;
    } else {
        red = Math.round((1 - normalized) * 2 * 255);
        green = 255;
        blue = 0;
    }

    const toHex = (c) => c.toString(16).padStart(2, '0');
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
}

/**
 * Возвращает цветовую метку сложности пароля (от красного к зелёному).
 * @param {number} strength - Оценка сложности пароля (0–10).
 * @returns {string} Цвет в формате HEX.
 */
function passwordColor(strength) {
    return gradientColor(strength, 10);
}


/**
 * Отображает сообщение об ошибке в блоке входа.
 * Добавляет текст ошибки и делает контейнер видимым.
 * @param {string} errorText - Текст ошибки для отображения.
 */
function logonShowErrorBox(errorText) {
    document.getElementById("migre-id-main-login-errorbox").innerHTML = `<p>${errorText}</p>`
    document.getElementById("migre-id-main-login-errorbox").classList.add('migre-v1-visible');
}
