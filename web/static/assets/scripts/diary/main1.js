// начало модуля "HandleLoginAndPasswordErrors"
async function signupButtonClicked() {
    const login = document.getElementsByName('login')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const passwordRepeat = document.getElementsByName('password_repeat')[0].value; // Планируется обновление имён всех элементов после окончания реализации полного функционала для регистрации
    if (password != passwordRepeat) {
        logonShowErrorbox("Пароли не совпадают.");
        return;
    }
    if (password.length == 0) {
        logonShowErrorbox("Пароль не должен быть пустым.");
        return;
    }
    if (login.length == 0) {
        logonShowErrorbox("Логин не должен быть пустым.");
        return;
    }
    if (!validateLogin(login)) {
        logonShowErrorbox("Логин должен быть от 5 до 20 символов, допускаются только латинские буквы и символ \"_\".");
        return;
    }
    if (!validatePassword(password)) {
        logonShowErrorbox("Пароль должен быть не менее 8 символов, содержать как минимум одну заглавную, одну строчную букву и одну цифру.");
        return;
    }

const API_SIGNUP_URL = 'https://migrenoznik.ru/api/signup';
    
    try {
        let data = new FormData();
        data.append("login", login);
        data.append("password", password);
        
        const response = await fetch(API_SIGNUP_URL, {
            method: 'POST',
            body: data,
        });
        
        if (!response.ok) throw new Error(`Ошибка HTTP ${response.status}`);
       
        const result = await response.json();
        const errorMessages = {
            1: "Пользователь с таким логином уже есть.",
            2: "Пароль слишком простой.",
            3: "Логин содержит недопустимые символы.",
            // 4 — особый случай, обрабатывается отдельно
         };     
        if (result["success"]) {
            window.location.href = "/";
        } else {
            if (result["code"] == 4) {
                if (password.length == 0) {
                    logonShowErrorbox("Пароль не должен быть пустым.");
                } else if (login.length == 0) {
                    logonShowErrorbox("Логин не должен быть пустым.");
                } else {
                    logonShowErrorbox("Логин или пароль пуст.");
                }
            } else {
                logonShowErrorbox(errorMessages[result["code"]]);
            } 
        }

    } catch(error) {
        logonShowErrorbox("Ошибка на сервере.");
    }
    
}
// конец модуля "HandleLoginAndPasswordErrors"

// начало модуля "PasswordStrengthAssessment"
function loginFieldsOninput() {
    document.getElementById("migre-id-main-login-errorbox").classList.remove('migre-v1-visible');
}

function signupPasswordFieldsOninput() {
    loginFieldsOninput();
    let color = "black";
    let password = document.getElementById("migre-signup-password").value;
    if (password.length > 0) {
        color = passwordColorСhange(calculatePasswordStrength(password));
    }

    document.getElementById("migre-signup-password").style.borderBottom = `1px solid ${color}`;
}

function signupPassword2FieldsOninput() {
    loginFieldsOninput();
    let color = "black";
    let password1 = document.getElementById("migre-signup-password").value;
    let password2 = document.getElementById("migre-signup-password2").value;
    if (password1 == password2 && password1.length > 0) {
        color = passwordColorСhange(calculatePasswordStrength(password1));
    }

    document.getElementById("migre-signup-password2").style.borderBottom = `1px solid ${color}`;
}
// конец модуля "PasswordStrengthAssessment"

// начало модуля "ElementsAnimation"
function clearElement(element) {
    while (element?.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function stopAnimationAndRemove(element) {
    if (!element) { 
        return; 
    }
    element.onanimationend = null;
    element.remove();
}

function playAnimation(element, animation, duration, func, delay = 0) {
    if (!element) {
        return;
    }
    element.style.removeProperty('animation');
    element.style.animation = `migren-v3-ani-${animation} ${duration}s ${func} forwards`;
    element.style.animationDelay = `${delay}s`;
}
// конец модуля "ElementsAnimation"
