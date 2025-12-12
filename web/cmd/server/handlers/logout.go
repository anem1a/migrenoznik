package handlers

import (
	"encoding/json"
	"migrenoznik/cmd/server/global"
	"net/http"
)

func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session_id")
	if err == nil {
		// Удаляем сессию из памяти
		delete(global.Sessions, cookie.Value)

		// Сбрасываем куку у клиента
		http.SetCookie(w, &http.Cookie{
			Name:   "session_id",
			Value:  "",
			Path:   "/",
			MaxAge: -1, // кука удаляется сразу
		})
	}

	// Отвечаем JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
