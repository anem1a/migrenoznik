// package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// В данном файле реализован обработчик выхода пользователя из системы.
package handlers

import (
	"encoding/json"
	"migrenoznik/cmd/server/global"
	"net/http"
)

// LogoutHandler обрабатывает запрос на выход пользователя.
// Функция:
//  - принимает POST-запрос;
//  - удаляет пользовательскую сессию из памяти;
//  - сбрасывает cookie с идентификатором сессии на клиенте;
//  - возвращает JSON с результатом операции.
func LogoutHandler(w http.ResponseWriter, r *http.Request) {
	// Разрешён только POST-метод
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	cookie, err := r.Cookie("session_id")
	if err == nil {
		// Удаляем сессию из памяти
		delete(global.Sessions, cookie.Value)

		// Сбрасываем cookie у клиента
		http.SetCookie(w, &http.Cookie{
			Name:   "session_id",
			Value:  "",
			Path:   "/",
			MaxAge: -1, // cookie удаляется сразу
		})
	}

	// Отправка успешного ответа
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}
