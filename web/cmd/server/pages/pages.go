package pages

import (
	"migrenoznik/cmd/server/global"
	"net/http"
	"text/template"
)

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

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	// Значение по умолчанию — пустое (пользователь не вошёл)
	data := map[string]interface{}{
		"Username": "",
	}

	// Пробуем получить куку, если она есть
	if cookie, err := r.Cookie("session_id"); err == nil {
		if user, ok := global.Sessions[cookie.Value]; ok {
			data["Username"] = user
		}
	}

	// Рендерим шаблон (страница работает в любом случае)
	tmpl, err := template.ParseFiles("templates/index.html", "templates/head.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func LoginPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "login.html")
}

func SignupPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "sign-up.html")
}

func DoctorPageHandler(w http.ResponseWriter, r *http.Request) {
	RenderTemplate(w, "doctor.html")
}
