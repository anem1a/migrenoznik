class MigraineAttackEntity {
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

class MigraineTrigger extends MigraineAttackEntity {
    static get Config() {
        return Core.Triggers;
    }
}

class MigraineSymptom extends MigraineAttackEntity {
    static get Config() {
        return Core.Symptoms;
    }
}

class MigraineDrug extends MigraineAttackEntity {
    static get Config() {
        return Core.Drugs;
    }

    get ATX() {
        return this.constructor.Config[String(this.Code)]?.atx || '';
    }
}