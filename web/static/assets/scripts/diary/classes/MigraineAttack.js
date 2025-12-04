class MigraineAttack {
    constructor(local_id, dt_start, strength, dt_end = null, triggers = [], symptoms = [], id = null) {
        this.LocalID = local_id;
        this.DT_Start = dt_start;
        this.DT_End = dt_end;
        this.Strength = strength;
        this.Triggers = triggers;
        this.Symptoms = symptoms;
        this.ID = id;
    }

    static from_json(obj) {
        return new MigraineAttack(
            obj["LocalID"] == null ? null : Number(obj["LocalID"]),
            obj["DT_Start"] == null ? null : new Date(obj["DT_Start"]),
            obj["Strength"] == null ? null : Number(obj["Strength"]),
            obj["DT_End"] == null ? null : new Date(obj["DT_End"]),
            obj["Triggers"] == null ? [] : obj["Triggers"],
            obj["Symptoms"] == null ? [] : obj["Symptoms"],
            obj["ID"] == null ? null : Number(obj["ID"]),
        );
    }
}