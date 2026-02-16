// package main является точкой входа веб-приложения «Мигренозник».
// В данном пакете осуществляется:
//   - инициализация подключения к базе данных PostgreSQL;
//   - настройка HTTP/HTTPS серверов;
//   - регистрация маршрутов страниц и API;
//   - запуск Telegram-бота для напоминаний.
package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	"migrenoznik/cmd/server/config"
	"migrenoznik/cmd/server/global"
	"migrenoznik/cmd/server/handlers"
	"migrenoznik/cmd/server/pages"
	"migrenoznik/cmd/server/telegram"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	var err error

	dbConfig := config.GetDBConfig()
	connStr := fmt.Sprintf(
		"host=%s port=%d user=%s password=%s dbname=%s sslmode=require",
		dbConfig.Host,
		dbConfig.Port,
		dbConfig.User,
		dbConfig.Password,
		dbConfig.DBName,
	)

	global.DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}
	defer global.DB.Close()

	if err = global.DB.Ping(); err != nil {
		log.Fatal("БД недоступна:", err)
	}
	log.Println("✅ Подключение к БД установлено")

	// gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.Static("/static", "./static")

	router.GET("/", pages.IndexHandler)
	router.GET("/login/", pages.LoginPageHandler)
	router.GET("/sign-up/", pages.SignupPageHandler)

	api := router.Group("/api")
	{
		api.POST("/login", handlers.LoginHandler)
		api.GET("/check-session", handlers.CheckSessionHandler)
		api.POST("/logout", handlers.LogoutHandler)
		api.POST("/signup", handlers.SignupHandler)
		api.POST("/add_entry", handlers.AddEntryHandler)
		api.GET("/entries", handlers.EntriesHandler)
		api.GET("/delete_entry", handlers.DeleteEntryHandler)
	}

	go telegram.StartReminderBot()

	go func() {
		log.Println("🚀 HTTPS сервер запущен на https://migrenoznik.ru")
		err := router.RunTLS(
			":443",
			"/etc/letsencrypt/live/migrenoznik.ru/fullchain.pem",
			"/etc/letsencrypt/live/migrenoznik.ru/privkey.pem",
		)
		if err != nil {
			log.Fatal("Ошибка HTTPS сервера:", err)
		}
	}()

	// HTTP → HTTPS редирект
	log.Println("➡️ HTTP сервер запущен (редиректит на HTTPS)")
	log.Fatal(http.ListenAndServe(":8080", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
	})))

	// log.Println("🚀 Сервер запущен на http://localhost:8080")

	// if err := router.Run(":8080"); err != nil {
	// 	log.Fatal(err)
	// }
}
