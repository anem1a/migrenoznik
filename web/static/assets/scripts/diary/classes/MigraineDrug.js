class MigraineDrug {
    static total_drugs() {
        return Object.keys(Core.Drugs).length;
    }

    constructor(code) {
        this.Code = code;
    }

    get Name() {
        return Core.Drugs[String(this.Code)]["name"];
    }

    get ATX() {
        return Core.Drugs[String(this.Code)]["atx"];
    }
}