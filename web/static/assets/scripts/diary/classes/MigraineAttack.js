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
    }

    static from_json(obj) {
        return new MigraineAttack(
            obj["LocalID"] == null ? Core.next_autoincrement() : Number(obj["LocalID"]),
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["Strength"] == null ? null : Number(obj["Strength"]),
            obj["DT_End"] == null ? (obj["Duration"] == null ? null : new Date(obj["DT_Start"])) : new Date(obj["DT_End"]),
            obj["Triggers"] == null ? [] : obj["Triggers"],
            obj["Symptoms"] == null ? [] : obj["Symptoms"],
            obj["Drugs"] == null ? [] : obj["Drugs"],
            obj["ID"] == null ? null : Number(obj["ID"]),
        );
    }
}