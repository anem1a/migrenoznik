document.addEventListener('DOMContentLoaded', 
    () => {
        if (BrowserSystem.is_standalone()) {
            document.documentElement.style.setProperty('--screen-footer-margin', '20px');
        } else {
            document.documentElement.style.setProperty('--screen-footer-margin', '0px');
        }
        if (window.location.pathname == "/") {
            compose_migraine_diary();
        }
        if (Core.is_migraine_now()) {
            configure_main_bottom_buttoms(true);
            display_migraine_now_block(true);
            let current = Core.get_current_migraine_attack();
            if (current) {
                document.getElementById("migre-current-strength-input").value = current.Strength;
                document.getElementById("migre-current-strength-value").innerHTML = current.Strength;
                document.getElementById("migre-current-strength-value").innerHTML = current.Strength;
                for (const trigger of current.Triggers) {
                    document.getElementById(`migre-trigger-${trigger}`).setAttribute("data-selected", true);
                }
                for (const symptom of current.Symptoms) {
                    document.getElementById(`migre-symptom-${symptom}`).setAttribute("data-selected", true);
                }
                for (const drug of current.Drugs) {
                    document.getElementById(`migre-drug-${drug}`).setAttribute("data-selected", true);
                }
            }
            document.getElementById("migre-current-dt-start-value").innerHTML = `${current.DT_Start.getDate()} ${Calendar.month_number_to_name(current.DT_Start.getMonth())} ${current.DT_Start.getFullYear()} ${current.DT_Start.getHours() < 10 ? "0" : ""}${current.DT_Start.getHours()}:${current.DT_Start.getMinutes() < 10 ? "0" : ""}${current.DT_Start.getMinutes()}`;
        }

        Core.fetch_remote_migraine_attacks();
        setInterval(() => {
            Core.fetch_remote_migraine_attacks();
        }, 1000);

        /**
         * ЦБРФ
         */
        let attacks = Core.get_migraine_attacks();
        let total_cost = 0;
        for (const attack of attacks) {
            for (const drug of attack.Drugs) {
                total_cost += random_cost(drug);
            }
        }
        document.getElementById("migre-drugs-cost").innerHTML = total_cost;
        document.getElementById("migre-statistics-wrapper").style.display = "block";
        document.getElementById("migre-currency-rub").innerHTML = conjugate_word(total_cost, "рубль", "рубля", "рублей");
        document.getElementById("migre-currency-usd").innerHTML = conjugate_word(total_cost, "доллар", "доллара", "долларов");
        document.getElementById("migre-currency-dem").innerHTML = conjugate_word(new_currency, "фунт стерлингов", "фунта стерлингов", "фунтов стерлингов");
    }
);

/**
 * ЦБРФ
 */
function random_cost(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i)) % 1000000;
    }
    
    const rangeSize = 11; // 15 - 5 + 1 = 11
    const result = (hash % rangeSize) + 5;
    
    return result;
}

/**
 * ЦБРФ
 */
async function currency_select() {
    let index = document.getElementById("migre-currency-select").selectedIndex;
    let currency = "null";
    switch (index) {
        case 0:
            currency = "rub";
            break;
        case 1:
            currency = "usd";
            break;
        case 2:
            currency = "eur";
            break;
        case 3:
            currency = "gbp";
            break;
    }
    let attacks = Core.get_migraine_attacks();
    let total_cost = 0;
    for (const attack of attacks) {
        for (const drug of attack.Drugs) {
            total_cost += random_cost(drug);
        }
    }
    console.log(currency);
    document.getElementById("migre-drugs-cost").innerHTML = "...";
    let new_currency = await convert_rub_to_another(total_cost, currency);
    new_currency = Math.round(Number(new_currency) * 100) / 100;
    document.getElementById("migre-drugs-cost").innerHTML = new_currency;
    document.getElementById("migre-statistics-wrapper").style.display = "block";
    document.getElementById("migre-currency-rub").innerHTML = conjugate_word(new_currency, "рубль", "рубля", "рублей");
    document.getElementById("migre-currency-usd").innerHTML = conjugate_word(new_currency, "доллар", "доллара", "долларов");
    document.getElementById("migre-currency-dem").innerHTML = conjugate_word(new_currency, "фунт стерлингов", "фунта стерлингов", "фунтов стерлингов");

}

async function convert_rub_to_another(cost, currency) {
    if (currency == "rub") {
        return cost;
    }
    let response = await fetch(`https://migrenoznik.ru/api/convert?rub=${cost}&currency=${currency}`);
    if (!response.ok) {
        throw new Error(`Ошибка HTTP: ${response.status}`);
    }
    
    const data = await response.text();
    return data;
}