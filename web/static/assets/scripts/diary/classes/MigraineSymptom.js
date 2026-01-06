class MigraineSymptom {
    static total_symptoms() {
        return Object.keys(Core.Symptoms).length;
    }

    constructor(code) {
        this.Code = code;
    }

    get Name() {
        return Core.Symptoms[String(this.Code)]["name"];
    }
}