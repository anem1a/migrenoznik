package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"time"
)

func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")

	login := r.FormValue("login")
	password := r.FormValue("password")

	var exists bool

	err := global.DB.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Accounts" WHERE acc_login = $1 AND acc_password = $2);`, login, password).Scan(&exists)
	if err != nil {
		log.Println("Ошибка при проверке пользователя:", err)
		http.Error(w, "Ошибка сервера", http.StatusInternalServerError)
		return
	}

	if !exists {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
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

	
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
