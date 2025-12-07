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

    static code_to_atx(code) {
        switch (code) {
            case 0:
                return 'N02BA01'
            case 1:
                return 'M01AE01'
            case 2:
                return 'M01AE02'
            case 3:
                return 'M01AB05'
            case 4:
                return 'N02BE01'
            case 5:
                return 'N02CC01'
            case 6:
                return 'M01AE17'
            case 7:
                return 'M01AB15'
            case 8:
                return 'A12CC02'
            case 9:
                return 'H02AB02'
            case 10:
                return 'C07AB02'
            case 11:
                return 'C07AA05'
            case 12:
                return 'C07AB03'
            case 13:
                return 'N06AA09'
            case 14:
                return 'C09CA06'
            case 15:
                return 'A03FA01'
            case 16:
                return 'A03FA03'
            case 17:
                return 'N02CC06'
            case 18:
                return 'N02CC03'
            case 19:
                return 'N05AA01'
            case 20:
                return 'N03AG01'
            case 21:
                return 'N03AX11'
            case 22:
                return 'N02CD03'
            case 23:
                return 'N02CD01'
            case 24:
                return 'N06AX16'
            default:
                break;
        }
    }
}