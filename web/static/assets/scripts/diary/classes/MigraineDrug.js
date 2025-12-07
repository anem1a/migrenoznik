class MigraineDrug {
    static total_drugs() {
        return 25;
    }
    static code_to_name(code) {
        switch (code) {
            case 0:
                return 'Ацетилсалициловая кислота'
            case 1:
                return 'Ибупрофен'
            case 2:
                return 'Напроксен'
            case 3:
                return 'Диклофенак'
            case 4:
                return 'Парацетамол'
            case 5:
                return 'Суматриптан'
            case 6:
                return 'Декскетопрофен'
            case 7:
                return 'Кеторолак'
            case 8:
                return 'Магния сульфат'
            case 9:
                return 'Дексаметазон'
            case 10:
                return 'Метопролол'
            case 11:
                return 'Пропранолол'
            case 12:
                return 'Атенолол'
            case 13:
                return 'Амитриптилин'
            case 14:
                return 'Кандесартан'
            case 15:
                return 'Метоклопрамид'
            case 16:
                return 'Домперидон'
            case 17:
                return 'Элетриптан'
            case 18:
                return 'Золмитриптан'
            case 19:
                return 'Хлорпромазин'
            case 20:
                return 'Вальпроевая кислота'
            case 21:
                return 'Топирамат'
            case 22:
                return 'Фреманезумаб'
            case 23:
                return 'Эренумаб'
            case 24:
                return 'Венлафаксин'
            default:
                break;
        }
    }
}