function conjugate_word(amount, word1, word2, word5) {
    if (Number.isInteger(amount)) {
        if (amount % 100 >= 11 && amount % 100 <= 19) {
            return word5;
        }
        
        switch (amount % 10) {
            case 1:
                return word1;
            case 2:
            case 3:
            case 4:
                return word2;
            default:
                return word5;
        }
    }
    
    var integerPart = Math.floor(amount);
    var lastDigit = integerPart % 10;
    if (integerPart % 100 >= 11 && integerPart % 100 <= 19) {
        return word5;
    }
    if (amount == 1.5) {
        return word2;
    }
    
    switch (lastDigit) {
        case 1:
            return word1;
        case 2:
        case 3:
        case 4:
            return word2;
        default:
            return word5;
    }
}