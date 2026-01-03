class MigraineAttack {
    constructor(local_id, dt_start, strength, dt_end = null, triggers = [], symptoms = [], drugs = [], id = null) {
        this.LocalID = local_id;
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
        this.Duration = (dt_end - dt_start) / 3600000;
        this.Strength = strength;
        this.Triggers = triggers;
        this.Symptoms = symptoms;
        this.Drugs = drugs;
        this.ID = id;

        /**
         * Возможные статусы:
         * - LOCAL_ONLY: создан локально, когда вход не совершен
         * - LOCAL_CREATED: создан локально, не отправлен на сервер
         * - PENDING_SERVER_CREATING: создан локально, отправлен на сервер, но ответ от него ещё не получен
         * - FAILED_SERVER_CREATING: создан локально, отправлен на сервер, но сервер вернул ошибку
         * - BACKED_UP: есть на сервере
         * - LOCAL_DELETED: удален локально, запрос удаления не отправлен на сервер
         * - PENDING_SERVER_DELETING: удален локально, запрос удаления отправлен на сервер, пока нет ответа
         * - FAILED_SERVER_DELETING: удален локально, запрос удаления отправлен на сервер, но сервер вернул ошибку
         * - DELETED: удален и на сервере, и на клиенте. Такие записи должны удаляться при первой возможности
         */
        this.Status = "LOCAL_CREATED";
    }

    static from_json(obj) {
        let attack = new MigraineAttack(
            obj["LocalID"] == null ? Core.next_autoincrement() : Number(obj["LocalID"]),
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["Strength"] == null ? null : Number(obj["Strength"]),
            obj["DT_End"] == null ? (obj["Duration"] == null ? null : new Date(obj["DT_Start"])) : new Date(obj["DT_End"]),
            obj["Triggers"] == null ? [] : obj["Triggers"].map(code => new MigraineTrigger(code)),
            obj["Symptoms"] == null ? [] : obj["Symptoms"],
            obj["Drugs"] == null ? [] : obj["Drugs"],
            obj["ID"] == null ? null : Number(obj["ID"]),
        );
        attack.set_status(obj["Status"]);
        return attack;
    }

    backed_up() {
        return this.ID != null;
    }

    set_status(status) {
        this.Status = status;
    }
}