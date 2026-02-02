// package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// Отвечает за регистрацию новых пользователей,
// валидацию вводимых данных и создание пользовательской сессии.
package handlers

import (
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
)

// SignupHandler обрабатывает запрос на регистрацию пользователя.
// Функция:
//   - принимает POST-запрос с логином и паролем;
//   - выполняет валидацию входных данных;
//   - проверяет уникальность логина;
//   - создаёт новую запись пользователя в базе данных;
//   - автоматически создаёт пользовательскую сессию.
//
// В ответ клиенту возвращается JSON-объект с кодом результата.
func SignupHandler(c *gin.Context) {
	// Получаем данные из формы
	login := c.PostForm("login")
	password := c.PostForm("password")

	// Проверка на пустые поля
	if login == "" || password == "" {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    4,
		})
		return
	}

	// Проверка логина: 5–20 символов, латиница и "_"
	matchLogin, _ := regexp.MatchString(`^[A-Za-z_]{5,20}$`, login)
	if !matchLogin {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    3,
		})
		return
	}

	// Проверка сложности пароля
	if !isPasswordStrong(password) {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    2,
		})
		return
	}

	// Проверка существования пользователя
	var exists bool
	err := global.DB.
		QueryRow(`SELECT EXISTS(SELECT 1 FROM "Accounts" WHERE acc_login = $1);`, login).
		Scan(&exists)

	if err != nil {
		log.Println("Ошибка при проверке логина:", err)
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    5,
		})
		return
	}

	if exists {
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    1,
		})
		return
	}

	// Создание пользователя
	_, err = global.DB.Exec(
		`INSERT INTO "Accounts" (acc_login, acc_password, acc_created) VALUES ($1, $2, NOW());`,
		login,
		password,
	)
	if err != nil {
		log.Println("Ошибка при добавлении пользователя:", err)
		c.JSON(http.StatusOK, gin.H{
			"success": false,
			"code":    5,
		})
		return
	}

	// Создание сессии
	sessionID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), login)
	global.Sessions[sessionID] = login

	// Установка cookie
	c.SetCookie(
		"session_id",
		sessionID,
		0, // MaxAge (0 = сессионная cookie)
		"/",
		"",
		true, // Secure
		true, // HttpOnly
	)

	// Успешный ответ
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"code":    0,
	})
}

// isPasswordStrong проверяет сложность пароля.
// Пароль считается корректным, если:
//   - его длина не менее 8 символов;
//   - он содержит хотя бы одну заглавную букву;
//   - одну строчную букву;
//   - и одну цифру.
func isPasswordStrong(pw string) bool {
	if len(pw) < 8 {
		return false
	}

	hasUpper := false
	hasLower := false
	hasDigit := false

	for _, c := range pw {
		switch {
		case c >= 'A' && c <= 'Z':
			hasUpper = true
		case c >= 'a' && c <= 'z':
			hasLower = true
		case c >= '0' && c <= '9':
			hasDigit = true
		}
	}

	return hasUpper && hasLower && hasDigit
}
