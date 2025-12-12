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

func SignupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	login := r.FormValue("login")
	password := r.FormValue("password")

	// Проверка на пустые поля
	if login == "" || password == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 4})
		return
	}

	// Проверка логина: 5–20 символов, латиница и "_"
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

	// Проверка, существует ли пользователь
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

	sessionID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), login)
	global.Sessions[sessionID] = login

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "code": 0})
}

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
