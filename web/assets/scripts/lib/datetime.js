function month_number_to_name(month_number) {
    switch (month_number) {
        case 0:
            return "января";
        case 1:
            return "февраля";
        case 2:
            return "марта";
        case 3:
            return "апреля";
        case 4:
            return "мая";
        case 5:
            return "июня";
        case 6:
            return "июля";
        case 7:
            return "августа";
        case 8:
            return "сентября";
        case 9:
            return "октября";
        case 10:
            return "ноября";
        case 11:
            return "декабря";
        default:
            break;
    }
}