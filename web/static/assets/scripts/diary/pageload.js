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
            }
            document.getElementById("migre-current-dt-start-value").innerHTML = `${current.DT_Start.getDate()} ${Calendar.month_number_to_name(current.DT_Start.getMonth())} ${current.DT_Start.getFullYear()} ${current.DT_Start.getHours() < 10 ? "0" : ""}${current.DT_Start.getHours()}:${current.DT_Start.getMinutes() < 10 ? "0" : ""}${current.DT_Start.getMinutes()}`;
        }
    }
);