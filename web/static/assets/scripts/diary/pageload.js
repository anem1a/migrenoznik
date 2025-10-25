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
        }
    }
);