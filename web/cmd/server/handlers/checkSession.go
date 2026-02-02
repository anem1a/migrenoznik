package handlers

import (
	"migrenoznik/cmd/server/global"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CheckSessionHandler(c *gin.Context) {
	sessionID, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"logged_in": false})
		return
	}

	login, ok := global.Sessions[sessionID]
	if !ok {
		c.JSON(http.StatusOK, gin.H{"logged_in": false})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"logged_in": true,
		"user":      login,
	})
}
