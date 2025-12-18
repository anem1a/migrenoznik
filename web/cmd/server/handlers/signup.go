// package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// Отвечает за регистрацию новых пользователей,
// валидацию вводимых данных и создание пользовательской сессии.
package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"regexp"
	"time"
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
func SignupHandler(w http.ResponseWriter, r *http.Request) {
	// Разрешён только POST-метод
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	login := r.FormValue("login")
	password := r.FormValue("password")

	// Проверка на пустые поля
	if login == "" || password == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 4})
		return
	}

	// Проверка логина: длина 5–20 символов, латинские буквы и символ "_"
	matchLogin, _ := regexp.MatchString(`^[A-Za-z_]{5,20}$`, login)
	if !matchLogin {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 3})
		return
	}

	// Проверка сложности пароля
	if !isPasswordStrong(password) {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 2})
		return
	}

	// Проверка, существует ли пользователь с таким логином
	var exists bool
	err := global.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Accounts" WHERE acc_login = $1);`, login).Scan(&exists)
	if err != nil {
		log.Println("Ошибка при проверке логина:", err)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 5})
		return
	}
	if exists {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 1})
		return
	}

	// Создание пользователя
	_, err = global.DB.Exec(`INSERT INTO "Accounts" (acc_login, acc_password, acc_created) VALUES ($1, $2, NOW());`, login, password)
	if err != nil {
		log.Println("Ошибка при добавлении пользователя:", err)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 5})
		return
	}

	// Создание сессионного идентификатора
	sessionID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), login)
	global.Sessions[sessionID] = login

	// Установка cookie с идентификатором сессии
	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true, // недоступна из JavaScript
		Secure:   true, // передаётся только по HTTPS
	})
	
	// Отправка успешного ответа
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "code": 0})
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
