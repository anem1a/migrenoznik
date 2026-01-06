class MigraineTrigger {
    static total_triggers() {
        return Object.keys(Core.Triggers).length;
    }
    /**
     * Depricated.
     */
    static code_to_name(code) {
        return Core.Triggers[String(code)];
    }

    constructor(code) {
        this.Code = code;
    }

    get Name() {
        return Core.Triggers[String(this.Code)]["name"];
    }
}