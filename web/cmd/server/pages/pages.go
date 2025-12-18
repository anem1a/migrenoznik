// Package pages содержит HTTP-обработчики, отвечающие за отображение HTML-страниц.
// Пакет реализует:
//  - рендеринг HTML-шаблонов;
//  - обработку страниц регистрации, входа и главной страницы;
//  - отображение пользовательских данных при наличии активной сессии.

package pages

import (
	"migrenoznik/cmd/server/global"
	"net/http"
	"text/template"
)

// RenderTemplate выполняет рендеринг HTML-шаблона.
// Принимает имя HTML-файла, подключает общий шаблон head.html и отправляет результат в HTTP-ответ.
func RenderTemplate(w http.ResponseWriter, name string) {
	tmpl, err := template.ParseFiles("templates/"+name, "templates/head.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

// IndexHandler обрабатывает запрос к главной странице приложения.
// Функция:
//  - проверяет наличие пользовательской сессии;
//  - при наличии сессии подставляет имя пользователя в шаблон;
//  - отображает главную страницу независимо от статуса авторизации.
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	// Значение по умолчанию — пустое (пользователь не вошёл)
	data := map[string]interface{}{
		"Username": "",
	}

	// Проверка наличия сессионной cookie
	if cookie, err := r.Cookie("session_id"); err == nil {
		if user, ok := global.Sessions[cookie.Value]; ok {
			data["Username"] = user
		}
	}

	// Загрузка и рендеринг HTML-шаблона главной страницы
	tmpl, err := template.ParseFiles("templates/index.html", "templates/head.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}


// LoginPageHandler отображает страницу авторизации пользователя.
func LoginPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "login.html")
}

// SignupPageHandler отображает страницу регистрации нового пользователя.
func SignupPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "sign-up.html")
}

// DoctorPageHandler отображает страницу врача,
// предназначенную для просмотра записей пациентов.
func DoctorPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "doctor.html")
}
