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
            document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
            display_migraine_now_block(true);
            let current = Core.get_current_migraine_attack();
            document.getElementById("migre-current-strength-input").value = current.Strength;
            document.getElementById("migre-current-strength-value").innerHTML = current.Strength;
        }
    }
);