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

/**
 * Onclick event of pressing the "Migraine now" button
 */
function migraine_now_button_Clicked() {
    if (Core.is_migraine_now()) {
        Core.toggle_migraine_status();
        Core.close_last_migraine_attack();
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить мигрень сейчас";
    } else {
        Core.toggle_migraine_status();
        Core.add_new_migraine_attack(new MigraineAttack(Core.next_autoincrement(), new Date()));
        document.getElementById("migre-diary-main-bottom-button").innerText = "Отметить конец мигрени";
    }
    compose_migraine_diary();
}

function login_Clicked() {
    window.location.href = "/login/";
    //window.history.pushState(null, null, "/login/");
}

async function logout_Clicked() {
    try {
        let data = new FormData();
        
        const response = await fetch('/api/logout', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(Ошибка HTTP ${response.status});
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/login/";
        }

    } catch(error) {
        
    }
}

function delete_entry_Clicked(no) {
    Core.remove_migraine_attack(no);
    compose_migraine_diary();
}

async function login_button_Clicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;

    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch('/api/login', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(Ошибка HTTP ${response.status});
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/";
        } else {
            logon_show_errorbox("Неверный логин или пароль.");
        }

    } catch(error) {
        logon_show_errorbox("Ошибка на сервере.");
    }
    
}

function play_animation_and_remove(element, animation, duration, func, absolute = true) {
    if (!element) {
        return;
    }
    if (absolute) {
        element.style.position = 'absolute';
    }
    play_animation(element, animation, duration, func, absolute);
    element.onanimationend = function () {
        stop_animation_and_remove(element);
    }
}

function play_animation_and_calm(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    play_animation(element, animation, duration, func, delay);
    element.onanimationend = function() {
        element.onanimationend = null;
        element.style.removeProperty('transform');
        element.style.removeProperty('animation');
    };
}
