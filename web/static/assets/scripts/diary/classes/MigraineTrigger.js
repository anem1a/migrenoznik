class MigraineTrigger {
    static total_triggers() {
        return Object.keys(Core.Triggers).length;
    }

    constructor(code) {
        this.Code = code;
    }

    get Name() {
        return Core.Triggers[String(this.Code)]["name"];
    }
}