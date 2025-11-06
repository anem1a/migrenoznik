document.addEventListener('DOMContentLoaded', 
    () => {
        if (BrowserSystem.isStandalone()) {
            document.documentElement.style.setProperty('--screen-footer-margin', '20px');
        } else {
            document.documentElement.style.setProperty('--screen-footer-margin', '0px');
        }
        if (window.location.pathname == "/") {
            composeMigraineDiary();
        }
        if (Core.isMigraineNow()) {
            document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
        }
    }
);

/**
 * Onclick event of pressing the "Migraine now" button
 */
function migraineNowButtonClicked() {
    if (Core.isMigraineNow()) {
        Core.toggleMigraineStatus();
        Core.closeLastMigraineAttack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        Core.toggleMigraineStatus();
        Core.addNewMigraineAttack(new MigraineAttack(Core.nextAutoincrement(), new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    composeMigraineDiary();


function loginClicked() {
    window.location.href = "/login/";
}

async function logoutClicked() {
    try {
        const DATA = new FormData();

        const response = await fetch('/api/logout', {
            method: 'POST',
            body: DATA,
        });

        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const RESULT = await response.json();
        if (RESULT["success"]) {
            window.location.href = "/login/";
        }

    } catch (error) {
        console.error("Ошибка при выходе из системы:", error);

function deleteEntryClicked(entryId) {
    Core.removeMigraineAttack(entryId);
    composeMigraineDiary();
}

async function loginButtonClicked() {
    const LOGIN = document.getElementsByName('login')[0].value;
    const PASSWORD = document.getElementsByName('password')[0].value;

    try {
        const DATA = new FormData();
        DATA.append("login", login);
        DATA.append("password", PASSWORD);
        
        console.log("API Request: POST /api/login", { login: login });
        const RESPONSE = await fetch('/api/login', {
            method: 'POST',
            body: DATA,
        });

        if (!RESPONSE.ok) throw new Error(`Ошибка HTTP ${RESPONSE.status}`);
        
        const RESULT = await RESPONSE.json();
        if (RESULT["success"]) {
            window.location.href = "/";
        } else {
            logonShowErrorbox("Неверный логин или пароль.");
        }

    } catch (error) {
        console.error("Ошибка при входе в систему:", error);
        logonShowErrorbox("Ошибка на сервере.");
    }

}

function playAnimationAndRemove(element, animation, duration, func, absolute = true) {
    if (!element) {
        return;
    }
    if (absolute) {
        element.style.position = 'absolute';
    }
    playAnimation(element, animation, duration, func, absolute);
    element.onanimationend = function () {
        stopAnimationAndRemove(element);
    }
}

function playAnimationAndCalm(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    playAnimation(element, animation, duration, func, delay);
    element.onanimationend = function() {
        element.onanimationend = null;
        element.style.removeProperty('transform');
        element.style.removeProperty('animation');
    };
}
