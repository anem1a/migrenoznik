/**
 * Displays or hides "Migraine Now" block
 * @param {boolean} show true if you need to show it, false if to hide
 */
function display_migraine_now_block(show) {
    if (show) {
        document.getElementById("migre-now-wrapper").style.display = 'block';
    } else {
        document.getElementById("migre-now-wrapper").style.display = 'none';
    }
}

/**
 * Configures main bottom buttons depends on the migraine status.  
 * @param {boolean} migraine_now 
 */
function configure_main_bottom_buttoms(migraine_now) {
    if (migraine_now) {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить конец мигрени";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'none';
    } else {
        document.getElementById("migre-diary-main-bottom-button-now").innerText = "Отметить мигрень сейчас";
        document.getElementById("migre-diary-main-bottom-button-add").style.display = 'block';
    }
}

function el_diary_triggers_block(triggers) {
    let _triggers = [];
    for (const trigger of triggers) {
        _triggers.push(trigger.Name);
    }
    return el_diary_enumeration_block(_triggers, "triggers", "Нет триггеров", "Триггеры");
}

function el_diary_symptoms_block(symptoms) {
    let _symptoms = [];
    for (const symptom of symptoms) {
        _symptoms.push(MigraineSymptom.code_to_name(symptom));
    }
    return el_diary_enumeration_block(_symptoms, "symptoms", "Нет симптомов", "Симптомы");
}

function el_diary_drugs_block(drugs) {
    let _drugs = [];
    for (const drug of drugs) {
        _drugs.push(MigraineDrug.code_to_name(drug));
    }
    return el_diary_enumeration_block(_drugs, "drugs", "Нет препаратов", "Препараты");
}

function el_diary_enumeration_block(e, class_suffix, no_e_text, pre_colon_text) {
    if (e.length == 0) {
        return create_element(
            "div",
            `migre-v1-main-diary-item-${class_suffix}`,
            undefined,
            no_e_text
        );
    }
    return create_element(
        "div",
        `migre-v1-main-diary-item-${class_suffix}`,
        undefined,
        `${pre_colon_text}: ${e.join(", ")}`
    );
}