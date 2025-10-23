
// Добавим JSdoc
/**
 * Класс MigraineAttack описывает одну запись приступа мигрени.
 */
class MigraineAttack {
    /**
    * Создаёт новую запись приступа мигрени.
    * @param {Date} dtStart - Время начала приступа.
    * @param {?Date} dtEnd - Время окончания приступа (null, если не завершён).
    */
    constructor(dt_start, dt_end = null) { // Параметры не в camelCase. Рекомендуется dtStart, dtEnd.
        this.DT_Start = dt_start; // Свойства не в camelCase. Рекомендуется this.dtStart, this.dtEnd — в JS поля объектов обычно в camelCase.
        this.DT_End = dt_end;
    }

    /**
    * Создаёт экземпляр MigraineAttack из JSON-объекта.
    * @param {Object} obj - Объект с полями "DT_Start" и "DT_End".
    * @param {string} obj.DT_Start - Дата начала в формате ISO.
    * @param {string|null} obj.DT_End - Дата окончания в формате ISO или null.
    * @returns {MigraineAttack} Новый экземпляр MigraineAttack.
    * @example
    * const attack = MigraineAttack.fromJson({DT_Start: "2025-10-23T08:00:00Z", DT_End: null});
    */
    static from_json(obj) { // Используется snake_case. Рекомендуется fromJson().
        return new MigraineAttack(
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["DT_End"] == null ? null : new Date(obj["DT_End"]),
        );
    }
}
// Нарушение S: класс MigraineAttack совмещает модель данных и преобразование из JSON.
// Лучше вынести JSON-сериализацию/десериализацию в отдельный DataMapper или Static Utility.


/**
* Класс MigrenoznikCore управляет логикой хранения и обработки данных о мигрени.
* @class
*/
class MigrenoznikCore {

    /**
    * Проверяет, активен ли сейчас приступ мигрени.
    * @returns {boolean} true, если мигрень сейчас, иначе false.
    */
    is_migraine_now() { // Функция в snake_case. Рекомендуется: isMigraineNow().
        let migraine_now = localStorage.getItem("migraine_now"); // Переменная в snake_case. Рекомендуется migraineNow.
        if (migraine_now == undefined) {
            localStorage.setItem("migraine_now", "false");
            return false;
        }
        return migraine_now == "true";
    }

    /**
     * Переключает статус текущего приступа мигрени.
     * Если мигрень активна — завершает, иначе начинает новый приступ.
     */
    toggle_migraine_status() { // Рекомендуется toggleMigraineStatus().
        if (this.is_migraine_now()) {
            localStorage.setItem("migraine_now", "false");
        } else {
            localStorage.setItem("migraine_now", "true");
        }
    }

    /**
    * Возвращает список всех приступов мигрени из хранилища.
    * @returns {MigraineAttack[]} Массив экземпляров MigraineAttack. Если данных нет или они некорректны — пустой массив.
    * @throws {Error} Может выбросить ошибку при некорректном формате данных в localStorage.
    * @example
    * const attacks = core.getMigraineAttacks();
    * attacks.forEach(a => console.log(a.dtStart, a.dtEnd));
    */
    get_migraine_attacks() { // Рекомендуется getMigraineAttacks().
        let migraine_attacks = localStorage.getItem("migraine_attacks"); // Рекомендуется migraineAttacks.
        if (migraine_attacks == undefined) {
            return [];
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let migraine_attacks_obj = []; // Рекомендуется migraineAttacksObj.
            for (const migraine_attack of migraine_attacks) { // Рекомендуется migraineAttack.
                migraine_attacks_obj.push(MigraineAttack.from_json(migraine_attack));
            }
            return migraine_attacks_obj;
        } catch (error) {
            return [];
        }
    }

    /**
    * Добавляет новую запись приступа мигрени.
    * @param {MigraineAttack} migraine_attack — объект приступа.
    */
    add_new_migraine_attack(migraine_attack) { // Рекомендуется: addNewMigraineAttack(migraineAttack).
        let migraine_attacks = localStorage.getItem("migraine_attacks"); // Рекомендуется migraineAttacks.
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

    /**
    * Удаляет запись приступа по индексу.
    * @param {number} no — индекс записи в списке.
    */
    remove_migraine_attack(no) { // Рекомендуется removeMigraineAttack(index).
        let migraine_attacks = localStorage.getItem("migraine_attacks"); // Рекомендуется migraineAttacks.
        if (migraine_attacks == undefined) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            if (migraine_attacks.length < no) {
                return;
            }
            let new_migraine_attacks = []; // Рекомендуется newMigraineAttacks.
            for (let i = 0; i < migraine_attacks.length; i++) { // Нарушение KISS: Не очень читаемо. Рекомендуется migraineAttacks.forEach((attack, index) => { ... });
                const migraine_attack = migraine_attacks[i]; // Рекомендуется migraineAttack.
                if (i != no) {
                    new_migraine_attacks.push(migraine_attack);
                }
            }
            localStorage.setItem("migraine_attacks", JSON.stringify(new_migraine_attacks));
        } catch (error) {
            localStorage.setItem("migraine_attacks", JSON.stringify([]));
        }
    }

    /**
    * Закрывает последний приступ мигрени (устанавливает DT_End текущего времени).
    */
    close_last_migraine_attack() { // Рекомендуется closeLastMigraineAttack().
        let migraine_attacks = localStorage.getItem("migraine_attacks"); // Рекомендуется migraineAttacks.
        if (migraine_attacks == undefined) {
            return;
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let last_element = migraine_attacks.pop(); // Рекомендуется lastElement.
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

// Нарушение S: MigrenoznikCore совмещает бизнес-логику, управление состоянием и работу с хранилищем (localStorage).
// Лучше разделить:
// - MigraineService (логика работы с приступами)
// - MigraineStorage (обертка над localStorage)

// Нарушение D:
// Класс напрямую зависит от реализации localStorage. Следует инжектировать абстракцию StorageInterface, чтобы можно было
// легко заменить хранилище (например, на IndexedDB, API или mock при тестировании).

// Потенциальное нарушение O:
// При добавлении нового источника данных (например, серверного API) придётся изменять этот класс. Лучше использовать шаблон репозитория.


/**
* Обрабатывает нажатие на кнопку «Мигрень сейчас».
* Переключает статус мигрени и обновляет UI.
*/
function migraine_now_button_Clicked() { // Рекомендуется: migraineNowButtonClicked().
    if (Core.is_migraine_now()) { // Соответственно: Core.isMigraineNow().
        Core.toggle_migraine_status(); // toggleMigraineStatus()
        Core.close_last_migraine_attack(); // closeLastMigraineAttack()
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        Core.toggle_migraine_status();
        Core.add_new_migraine_attack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    compose_migraine_diary(); // composeMigraineDiary()
}

// Нарушение S: функция управляет и логикой состояния, и обновлением UI.
// Лучше разделить на:
// - handleMigraineNowButton() — только логика;
// - updateMigraineButtonUI() — обновление интерфейса.


/**
* Переход на страницу логина.
*/
function login_Clicked() { // Рекомендуется loginClicked().
    window.location.href = "/login/";
    //window.history.pushState(null, null, "/login/");
}

/**
* Составляет HTML-дневник приступов.
*/
function compose_migraine_diary() { // Рекомендуется: composeMigraineDiary().
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks(); // migraineAttacks 
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i]; // migraineAttack
        let diary_item = document.createElement("div"); // diaryItem
        diary_item.className = "migre-v1-main-diary-item";
        let a = new Date(); // Переменная не используется — удалить или назвать осмысленно.

        // Длинная строка формирования innerHTML — превышает 80 символов. Рекомендация: сделать отдельную функцию formatDateTime(date)
        diary_item.innerHTML = `<b>Запись&nbsp;${i + 1}.</b> ${migraine_attack.DT_Start.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_Start.getMonth())} ${migraine_attack.DT_Start.getFullYear()} ${migraine_attack.DT_Start.getHours() < 10 ? "0" : ""}${migraine_attack.DT_Start.getHours()}:${migraine_attack.DT_Start.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_Start.getMinutes()}`;
        if (migraine_attack.DT_End != null) {
            diary_item.innerHTML += ` &ndash; ${migraine_attack.DT_End.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_End.getMonth())} ${migraine_attack.DT_End.getFullYear()} ${migraine_attack.DT_End.getHours() < 10 ? "0" : ""}${migraine_attack.DT_End.getHours()}:${migraine_attack.DT_End.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_End.getMinutes()}`;
            diary_item.innerHTML += ` <a onclick=\"delete_entry_Clicked(${i})\">Удалить</a>`;
        }
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
}

// Нарушение S: функция одновременно получает данные, создает DOM-элементы и вставляет их в интерфейс.
// Рекомендуется вынести генерацию HTML в отдельный renderer-компонент.


/**
 * Удаляет запись из дневника по индексу.
 * @param {number} index - Индекс записи в списке.
 * @example
 * deleteEntryClicked(2); // удаляет третью запись
 */
function delete_entry_Clicked(no) { // Рекомендуется deleteEntryClicked(index).
    Core.remove_migraine_attack(no);
    compose_migraine_diary();
}

/**
* Авторизация пользователя по введённым данным.
*/
async function login_button_Clicked() { // Рекомендуется loginButtonClicked().
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
            alert("Логин и пароль правильные"); // alert(...) находится внутри try/catch — если нужно централизованное логирование, оно мешает.
        } else {
            alert("Неверный логин или пароль");
        }

    } catch (error) {
        console.error('Ошибка:', error.message); // Это просто логирование. Ошибка не пробрасывается, вызывающий код не узнаёт о проблеме. Все ошибки просто в console.error. Стандарт требует централизованного логирования через сервис.
    }
    // Следует использовать, например, ApiError, ValidationError, чтобы код обработчика и UI понимал, что произошло.

}
// Нарушение S: смешана логика запроса к API и UI-реакция (alert).
// Лучше разделить на ApiService (fetch + валидация ответа) и UI-обработчик (alert/redirect).


const Core = new MigrenoznikCore(); // Название константы корректно, но по соглашению константы верхнего уровня лучше писать заглавными: CORE.