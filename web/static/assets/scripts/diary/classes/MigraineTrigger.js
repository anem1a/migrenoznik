class MigraineTrigger {
    static total_triggers() {
        return 19;
    }
    static code_to_name(code) {
        switch (code) {
            case 0:
                return 'Менструальный цикл'
            case 1:
                return 'Стресс'
            case 2:
                return 'Нарушение сна'
            case 3:
                return 'Переутомление'
            case 4:
                return 'Голод'
            case 5:
                return 'Яркий свет'
            case 6:
                return 'Громкие звуки'
            case 7:
                return 'Сильные запахи'
            case 8:
                return 'Кофеин'
            case 9:
                return 'Алкоголь'
            case 10:
                return 'Красное вино'
            case 11:
                return 'Пиво'
            case 12:
                return 'Темный шоколад'
            case 13:
                return 'Твердый сыр'
            case 14:
                return 'Цитрусы'
            case 15:
                return 'Орехи'
            case 16:
                return 'Консерванты'
            case 17:
                return 'Погода'
            case 18:
                return 'Препараты'
            default:
                break;
        }
    }
}