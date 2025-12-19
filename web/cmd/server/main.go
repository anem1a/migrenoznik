// package main является точкой входа веб-приложения «Мигренозник».
// В данном пакете осуществляется:
//  - инициализация подключения к базе данных PostgreSQL;
//  - настройка HTTP/HTTPS серверов;
//  - регистрация маршрутов страниц и API;
//  - запуск Telegram-бота для напоминаний.
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
	// "migrenoznik/cmd/server/telegram"

	_ "github.com/lib/pq"
)

func main() {
	var err error

	// Инициализация подключения к базе данных PostgreSQL
	dbConfig := config.GetDBConfig()
	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=require", dbConfig.Host, dbConfig.Port,
		dbConfig.User, dbConfig.Password, dbConfig.DBName)
	global.DB, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}
	defer global.DB.Close()

	err = global.DB.Ping()
	if err != nil {
		log.Fatal("БД недоступна:", err)
	}
	log.Println("✅ Подключение к БД установлено")

	// Инициализация маршрутизатора
	mux := http.NewServeMux()

	// Раздача статики
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Страницы
	mux.HandleFunc("/", pages.IndexHandler)
	mux.HandleFunc("/login/", pages.LoginPageHandler)
	mux.HandleFunc("/sign-up/", pages.SignupPageHandler)
	mux.HandleFunc("/doctor/", pages.DoctorPageHandler)

	// API
	mux.HandleFunc("/api/login", handlers.LoginHandler)
	mux.HandleFunc("/api/check-session", handlers.CheckSessionHandler)
	mux.HandleFunc("/api/logout", handlers.LogoutHandler)
	mux.HandleFunc("/api/signup", handlers.SignupHandler)
	mux.HandleFunc("/api/add_entry", handlers.AddEntryHandler)
	mux.HandleFunc("/api/entries", handlers.EntriesHandler)
	mux.HandleFunc("/api/doctor-entries", handlers.DoctorEntriesHandler)
	mux.HandleFunc("/api/delete_entry", handlers.DeleteEntryHandler)

	// HTTPS сервер
	// go func() {
	// 	log.Println("🚀 HTTPS сервер запущен на https://migrenoznik.ru")
	// 	err := http.ListenAndServeTLS(
	// 		":443",
	// 		"/etc/letsencrypt/live/migrenoznik.ru/fullchain.pem",
	// 		"/etc/letsencrypt/live/migrenoznik.ru/privkey.pem",
	// 		mux,
	// 	)
	// 	if err != nil {
	// 		log.Fatal("Ошибка HTTPS сервера:", err)
	// 	}
	// }()

	// // Запуск Telegram-бота
	// go telegram.StartReminderBot()

	// // HTTP → HTTPS редирект
	// log.Println("➡️ HTTP сервер запущен (редиректит на HTTPS)")
	// log.Fatal(http.ListenAndServe(":80", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 	http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
	// })))

	// Локальный HTTP сервер для разработки 
	log.Println("🚀 Сервер запущен на http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}

