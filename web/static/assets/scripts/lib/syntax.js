function conjugate_word(amount, word1, word2, word5) {
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