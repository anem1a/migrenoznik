
class Calendar {
    static month_number_to_name(month_number) { /* Мария: имена методов должны быть в стиле camelCase: month_number_to_name → monthNumberToName */
        switch (month_number) { /* Мария: имена переменных должны быть в стиле camelCase: month_number → monthNumber */
            case 0:
                return "янв";
            case 1:
                return "фев";
            case 2:
                return "мар";
            case 3:
                return "апр";
            case 4:
                return "мая";
            case 5:
                return "июня";
            case 6:
                return "июля";
            case 7:
                return "авг";
            case 8:
                return "сен";
            case 9:
                return "окт";
            case 10:
                return "ноя";
            case 11:
                return "дек";
            default:
                break;
        }
    }
}
