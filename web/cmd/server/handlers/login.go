package handlers

import (
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func LoginHandler(c *gin.Context) {

	login := c.PostForm("login")
	password := c.PostForm("password")

	if login == "" || password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		return
	}

	var exists bool
	err := global.DB.QueryRow(
		`SELECT EXISTS(
			SELECT 1 FROM "Accounts"
			WHERE acc_login = $1 AND acc_password = $2
		);`,
		login,
		password,
	).Scan(&exists)

	if err != nil {
		log.Println("Ошибка при проверке пользователя:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		return
	}

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false})
		return
	}

	sessionID := fmt.Sprintf("%d_%s", time.Now().UnixNano(), login)
	global.Sessions[sessionID] = login

	c.SetCookie(
		"session_id",
		sessionID,
		3600*24*30, // срок жизни cookie (например, 1 день)
		"/",
		"",
		true, // Secure
		true, // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{"success": true})
}
