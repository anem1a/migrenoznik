class MigraineAttack {
    constructor(dt_start, dt_end = null) {
        this.DT_Start = dt_start; // REVIEW: Имя свойства стоит привести к camelCase — dtStart, чтобы соответствовать общему стилю именования.
        this.DT_End = dt_end;     // REVIEW: Аналогично — dtEnd обеспечит единообразие с другими свойствами.
        // REVIEW: Хорошо, что предусмотрен параметр по умолчанию — это делает класс гибким при создании объектов.
    }

    static from_json(obj) { // REVIEW: Метод лучше назвать fromJson — это соответствует соглашениям JS.
        return new MigraineAttack(
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]), // REVIEW: Добавление проверки корректности даты повысит устойчивость метода.
            obj["DT_End"] == null ? null : new Date(obj["DT_End"]),
        );
        // REVIEW: Использование статического конструктора — удачное решение, повышает читаемость и отделяет логику создания объекта от конструктора.
    }
}

class MigrenoznikCore {

    /**
     * Проверяет, активна ли сейчас мигрень у пользователя.
     * @returns {boolean}
     */
    is_migraine_now() { // REVIEW: Имя метода стоит привести к camelCase — isMigraineNow.
        let migraine_now = localStorage.getItem("migraine_now");
        if (migraine_now == undefined) { // REVIEW: Использовать строгое сравнение (===) предпочтительнее для ясности.
            localStorage.setItem("migraine_now", "false");
            return false;
        }
        return migraine_now == "true"; // REVIEW: Можно использовать строгое сравнение и явное преобразование в Boolean.
        // REVIEW: Логика определения состояния реализована понятно и без избыточности — читается легко.
    }

    /**
     * Переключает состояние мигрени.
     */
    toggle_migraine_status() { // REVIEW: Следует использовать camelCase — toggleMigraineStatus.
        if (this.is_migraine_now()) {
            localStorage.setItem("migraine_now", "false");
        } else {
            localStorage.setItem("migraine_now", "true");
        }
        // REVIEW: Повторение кода записи в localStorage можно сократить, выделив отдельную функцию — улучшит поддержку и уменьшит дублирование.
        // REVIEW: Логика метода проста и хорошо отражает назначение — поведение легко проследить.
    }

    /**
     * Возвращает журнал всех приступов мигрени.
     */
    get_migraine_attacks() { // REVIEW: Имя метода — getMigraineAttacks.
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            return [];
        }
        migraine_attacks = JSON.parse(migraine_attacks);
        let migraine_attacks_obj = [];
        for (const migraine_attack of migraine_attacks) {
            migraine_attacks_obj.push(MigraineAttack.from_json(migraine_attack)); // REVIEW: Следует использовать fromJson для единообразия.
        }
        return migraine_attacks_obj;
        // REVIEW: Приятно, что метод возвращает уже преобразованные объекты — это улучшает интерфейс класса и снижает нагрузку на вызывающий код.
    }

    /**
     * Добавляет новую запись о приступе мигрени.
     */
    add_new_migraine_attack(migraine_attack) { // REVIEW: Имя метода — addNewMigraineAttack.
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
            // REVIEW: Желательно добавить логирование ошибок, чтобы понимать, когда данные не удалось прочитать.
        }
        // REVIEW: Метод хорошо справляется с восстановлением корректного состояния даже при ошибках — это повышает надежность приложения.
    }

    /**
     * Закрывает последний приступ мигрени.
     */
    close_last_migraine_attack() { // REVIEW: Имя метода — closeLastMigraineAttack.
        let migraine_attacks = localStorage.getItem("migraine_attacks");
        if (migraine_attacks == undefined) {
            return; // REVIEW: Можно добавить сообщение в лог, чтобы понимать, что список был пуст.
        }
        try {
            migraine_attacks = JSON.parse(migraine_attacks);
            let last_element = migraine_attacks.pop();
            last_element["DT_End"] = new Date(); // REVIEW: Имя свойства — dtEnd для единообразия.
            migraine_attacks.push(last_element);
            localStorage.setItem("migraine_attacks", JSON.stringify(migraine_attacks));
        } catch (error) {
            // REVIEW: Ошибка подавляется. Лучше добавить логирование, чтобы повысить прозрачность ошибок.
            return;
        }
        // REVIEW: Хорошо, что предусмотрено восстановление и запись данных после изменения — это снижает риск потери информации.
    }

    constructor() { 
        // REVIEW: Конструктор пустой, можно удалить. В остальном структура класса продумана и легко расширяема.
    }
}

/**
 * Обработчик клика по кнопке "Мигрень сейчас".
 */
function migraine_now_button_Clicked() { // REVIEW: camelCase — migraineNowButtonClicked.
    if (Core.is_migraine_now()) {
        Core.toggle_migraine_status();
        Core.close_last_migraine_attack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        Core.toggle_migraine_status();
        Core.add_new_migraine_attack(new MigraineAttack(new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    compose_migraine_diary(); // REVIEW: Имя функции — composeMigraineDiary.
    // REVIEW: Логика обработчика построена последовательно и понятна — хорошо читается даже без контекста.
}

/**
 * Формирует визуальное представление дневника мигреней.
 */
function compose_migraine_diary() { // REVIEW: Имя функции — composeMigraineDiary.
    document.getElementById("migre-diary-wrapper").innerHTML = "";
    let migraine_attacks = Core.get_migraine_attacks();
    for (let i = 0; i < migraine_attacks.length; i++) {
        const migraine_attack = migraine_attacks[i];
        let diary_item = document.createElement("div");
        diary_item.className = "migre-v1-main-diary-item";
        let a = new Date(); // REVIEW: Переменная не используется и может быть удалена.
        diary_item.innerHTML = `<b>Запись&nbsp;${i+1}.</b> ${migraine_attack.DT_Start.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_Start.getMonth())} ${migraine_attack.DT_Start.getFullYear()} ${migraine_attack.DT_Start.getHours() < 10 ? "0" : ""}${migraine_attack.DT_Start.getHours()}:${migraine_attack.DT_Start.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_Start.getMinutes()}`;
        // REVIEW: Форматирование даты лучше вынести в отдельную функцию formatDate() — это повысит читаемость и позволит переиспользовать код.
        if (migraine_attack.DT_End != null) {
            diary_item.innerHTML += ` &ndash; ${migraine_attack.DT_End.getDate()} ${Calendar.month_number_to_name(migraine_attack.DT_End.getMonth())} ${migraine_attack.DT_End.getFullYear()} ${migraine_attack.DT_End.getHours() < 10 ? "0" : ""}${migraine_attack.DT_End.getHours()}:${migraine_attack.DT_End.getMinutes() < 10 ? "0" : ""}${migraine_attack.DT_End.getMinutes()}`;
        }
        document.getElementById("migre-diary-wrapper").appendChild(diary_item);
    }
    // REVIEW: Генерация HTML выполнена аккуратно и логично — структура вывода понятна.
}

const Core = new MigrenoznikCore(); // REVIEW: Имя переменной лучше записать строчными буквами (core), чтобы подчеркнуть, что это экземпляр класса. Инициализация внизу файла — удачное решение, помогает соблюдать порядок загрузки.
