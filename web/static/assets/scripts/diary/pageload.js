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

        fetch('https://migrenoznik.ru/api/entries').then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // костыль, пока Аня не переделала
            for (let i = 0; i < data["entries"].length; i++) {
                for (let j = 0; j < data["entries"][i]["Triggers"].length; j++) {
                    const element = data["entries"][i]["Triggers"][j];
                    for (let k = 0; k < MigraineTrigger.total_triggers(); k++) {
                        if (MigraineTrigger.code_to_name(k) == element) {
                            data["entries"][i]["Triggers"][j] = k;
                        }
                    }
                }
                for (let j = 0; j < data["entries"][i]["Symptoms"].length; j++) {
                    const element = data["entries"][i]["Symptoms"][j];
                    for (let k = 0; k < MigraineSymptom.total_symptoms(); k++) {
                        if (MigraineSymptom.code_to_name(k) == element) {
                            data["entries"][i]["Symptoms"][j] = k;
                        }
                    }
                }
                for (let j = 0; j < data["entries"][i]["Drugs"].length; j++) {
                    const element = data["entries"][i]["Drugs"][j];
                    for (let k = 0; k < MigraineDrug.total_drugs(); k++) {
                        if (MigraineDrug.code_to_name(k) == element) {
                            data["entries"][i]["Drugs"][j] = MigraineDrug.code_to_atx(k);
                        }
                    }
                }

                // Конец костыля

                let attacks = Core.get_migraine_attacks();
                attacks.push(MigraineAttack.from_json(data["entries"][i]));
                localStorage.setItem("migraine_attacks", JSON.stringify(attacks));
            }
            console.log(data);
        })
        .catch(error => {
            console.error('Произошла ошибка:', error);
        });
    }
);