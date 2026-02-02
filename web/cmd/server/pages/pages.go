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

	"github.com/gin-gonic/gin"
)

// RenderTemplate выполняет рендеринг HTML-шаблона.
// Принимает имя HTML-файла, подключает общий шаблон head.html и отправляет результат в HTTP-ответ.
func renderTemplate(c *gin.Context, name string, data map[string]interface{}) {
	tmpl, err := template.ParseFiles(
		"templates/"+name,
		"templates/head.html",
	)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	if err := tmpl.Execute(c.Writer, data); err != nil {
		c.String(http.StatusInternalServerError, err.Error())
	}
}

// IndexHandler обрабатывает запрос к главной странице приложения.
// Функция:
//   - проверяет наличие пользовательской сессии;
//   - при наличии сессии подставляет имя пользователя в шаблон;
//   - отображает главную страницу независимо от статуса авторизации.
func IndexHandler(c *gin.Context) {
	// Значение по умолчанию — пользователь не авторизован
	data := map[string]interface{}{
		"Username": "",
	}

	// Проверка cookie сессии
	if cookie, err := c.Cookie("session_id"); err == nil {
		if user, ok := global.Sessions[cookie]; ok {
			data["Username"] = user
		}
	}

	renderTemplate(c, "index.html", data)
}

// LoginPageHandler отображает страницу авторизации пользователя.
func LoginPageHandler(c *gin.Context) {
	renderTemplate(c, "login.html", nil)
}

// SignupPageHandler отображает страницу регистрации нового пользователя.
func SignupPageHandler(c *gin.Context) {
	renderTemplate(c, "sign-up.html", nil)
}
