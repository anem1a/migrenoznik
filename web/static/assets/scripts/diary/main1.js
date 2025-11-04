async function signup_button_Clicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const password_repeat = document.getElementsByName('password_repeat')[0].value;

    if (password != password_repeat) {
        logon_show_errorbox("Пароли не совпадают.");
        return;
    }
    if (password.length == 0) {
        logon_show_errorbox("Пароль не должен быть пустым.");
        return;
    }
    if (login.length == 0) {
        logon_show_errorbox("Логин не должен быть пустым.");
        return;
    }
    if (!validate_login(login)) {
        logon_show_errorbox("Логин должен быть от 5 до 20 символов, допускаются только латинские буквы и символ \"_\".");
        return;
    }
    if (!validate_password(password)) {
        logon_show_errorbox("Пароль должен быть не менее 8 символов, содержать как минимум одну заглавную, одну строчную букву и одну цифру.");
        return;
    }

    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch('/api/signup', {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
        
        const result = await response.json();
        if (result["success"]) {
            window.location.href = "/";
        } else {
            if (result["code"] == 1) {
                logon_show_errorbox("Пользователь с таким логином уже есть.");
            } else if (result["code"] == 2) {
                logon_show_errorbox("Пароль слишком простой.");
            } else if (result["code"] == 3) {
                logon_show_errorbox("Логин содержит недопустимые символы.");
            } else if (result["code"] == 4) {
                if (password.length == 0) {
                    logon_show_errorbox("Пароль не должен быть пустым.");
                } else if (login.length == 0) {
                    logon_show_errorbox("Логин не должен быть пустым.");
                } else {
                    logon_show_errorbox("Логин или пароль пуст.");
                }
            } else {
                logon_show_errorbox("Ошибка на сервере.");
            }
        }

    } catch(error) {
        logon_show_errorbox("Ошибка на сервере.");
    }
    
}

function login_fields_Oninput() {
    document.getElementById("migre-id-main-login-errorbox").classList.remove('migre-v1-visible');
}

function signup_password_fields_Oninput() {
    login_fields_Oninput();
    let color = "black";
    let password = document.getElementById("migre-signup-password").value;
    if (password.length > 0) {
        color = password_color(calculate_password_strength(password));
    }

    document.getElementById("migre-signup-password").style.borderBottom = `1px solid ${color}`;
}

function signup_password2_fields_Oninput() {
    login_fields_Oninput();
    let color = "black";
    let password1 = document.getElementById("migre-signup-password").value;
    let password2 = document.getElementById("migre-signup-password2").value;
    if (password1 == password2 && password1.length > 0) {
        color = password_color(calculate_password_strength(password1));
    }

    document.getElementById("migre-signup-password2").style.borderBottom = `1px solid ${color}`;
}

function clear_element(elem) {
    while (elem?.firstChild) {
        elem.removeChild(elem.firstChild);
    }
}

function stop_animation_and_remove(element) {
    if (!element) { 
        return; 
    }
    element.onanimationend = null;
    element.remove();
}

function play_animation(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    element.style.removeProperty('animation');
    element.style.animation = `trams-v3-ani-${animation} ${duration}s ${func} forwards`;
    element.style.animationDelay = `${delay}s`;
}
