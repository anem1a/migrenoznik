// package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// В данном файле реализован обработчик выхода пользователя из системы.
package handlers

import (
	"migrenoznik/cmd/server/global"
	"net/http"

	"github.com/gin-gonic/gin"
)

// LogoutHandler обрабатывает запрос на выход пользователя.
// Функция:
//   - принимает POST-запрос;
//   - удаляет пользовательскую сессию из памяти;
//   - сбрасывает cookie с идентификатором сессии на клиенте;
//   - возвращает JSON с результатом операции.
func LogoutHandler(c *gin.Context) {

	sessionID, err := c.Cookie("session_id")
	if err == nil {
		delete(global.Sessions, sessionID)

		// Удаляем cookie у клиента
		c.SetCookie(
			"session_id",
			"",
			-1, // MaxAge < 0 => cookie удаляется
			"/",
			"",
			true, // Secure
			true, // HttpOnly
		)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
	})
}
