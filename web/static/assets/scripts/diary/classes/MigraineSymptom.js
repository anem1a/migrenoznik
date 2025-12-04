class MigraineSymptom {
    static total_symptoms() {
        return 26;
    }
    static code_to_name(code) {
        switch (code) {
            case 0:
                return 'чувствительность к свету'
            case 1:
                return 'чувствительность к звуку'
            case 2:
                return 'чувствительность к запаху'
            case 3:
                return 'усталость'
            case 4:
                return 'тяга к еде'
            case 5:
                return 'отсутствие аппетита'
            case 6:
                return 'перепады настроения'
            case 7:
                return 'жажда'
            case 8:
                return 'вздутие живота'
            case 9:
                return 'тошнота'
            case 10:
                return 'рвота'
            case 11:
                return 'запор'
            case 12:
                return 'диарея'
            case 13:
                return 'черные точки перед глазами (аура)'
            case 14:
                return 'волнистые линии перед глазами (аура)'
            case 15:
                return 'вспышки света перед глазами (аура)'
            case 16:
                return 'туннельное зрение (аура)'
            case 17:
                return 'ухудшение зрения (аура)'
            case 18:
                return 'покалывание некоторых частей тела (аура)'
            case 19:
                return 'онемение некоторых частей тела (аура)'
            case 20:
                return 'невозможность ясно выражать свои мысли (аура)'
            case 21:
                return 'ощущение тяжести в конечностях (аура)'
            case 22:
                return 'звон в ушах (аура)'
            case 23:
                return 'изменения в обонянии (аура)'
            case 24:
                return 'изменения во вкусе (аура)'
            case 25:
                return 'изменения в осязании (аура)'
            default:
                break;
        }
    }
}