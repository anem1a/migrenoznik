class MigraineConfigItem {
    static get Config() {
        return {};
    }
    
    static total() {
        return Object.keys(this.Config).length;
    }
    
    constructor(code) {
        this.Code = code;
    }
    
    get Name() {
        return this.constructor.Config[String(this.Code)]?.name || '';
    }
}

class MigraineTrigger extends MigraineConfigItem {
    static get Config() {
        return Core.Triggers;
    }
}

class MigraineSymptom extends MigraineConfigItem {
    static get Config() {
        return Core.Symptoms;
    }
}