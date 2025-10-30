package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"time"

	_ "github.com/lib/pq"
)

const (
	host     = "oferolefket.beget.app"
	port     = 5432
	user     = "anna"
	password = "пароль"
	dbname   = "migrenoznik"
)

var db *sql.DB
var sessions = make(map[string]string)

func main() {
	var err error

	connStr := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=require", host, port, user, password, dbname)
	db, err = sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Ошибка подключения к БД:", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatal("БД недоступна:", err)
	}
	log.Println("✅ Подключение к БД установлено")

	mux := http.NewServeMux()

	// Раздача статики
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Страницы
	mux.HandleFunc("/", indexHandler)
	mux.HandleFunc("/login/", loginPageHandler)
	mux.HandleFunc("/sign-up/", signupPageHandler)

	// API
	mux.HandleFunc("/api/login", loginHandler)
	mux.HandleFunc("/api/check-session", checkSessionHandler)
	mux.HandleFunc("/api/logout", logoutHandler)

	// HTTPS сервер
	go func() {
		log.Println("🚀 HTTPS сервер запущен на https://migrenoznik.ru")
		err := http.ListenAndServeTLS(
			":443",
			"/etc/letsencrypt/live/migrenoznik.ru/fullchain.pem",
			"/etc/letsencrypt/live/migrenoznik.ru/privkey.pem",
			mux,
		)
		if err != nil {
			log.Fatal("Ошибка HTTPS сервера:", err)
		}
	}()

	// HTTP → HTTPS редирект
	log.Println("➡️ HTTP сервер запущен (редиректит на HTTPS)")
	log.Fatal(http.ListenAndServe(":80", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		http.Redirect(w, r, "https://"+r.Host+r.RequestURI, http.StatusMovedPermanently)
	})))

	// log.Println("🚀 Сервер запущен на http://localhost:8080")
	// log.Fatal(http.ListenAndServe(":8080", mux))
}

func renderTemplate(w http.ResponseWriter, name string) {
	tmpl, err := template.ParseFiles("templates/"+name, "templates/head.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if err := tmpl.Execute(w, nil); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// Значение по умолчанию — пустое (пользователь не вошёл)
	data := map[string]interface{}{
		"Username": "",
	}

	// Пробуем получить куку, если она есть
	if cookie, err := r.Cookie("session_id"); err == nil {
		if user, ok := sessions[cookie.Value]; ok {
			data["Username"] = user
		}
	}

	// Рендерим шаблон (страница работает в любом случае)
	tmpl, err := template.ParseFiles("templates/index.html", "templates/head.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if err := tmpl.Execute(w, data); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func loginPageHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "login.html")
}

func signupPageHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "sign-up.html")
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	login := r.FormValue("login")
	password := r.FormValue("password")

	var exists bool

	err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Accounts"  WHERE acc_login = $1 AND acc_password = $2);`, login, password).Scan(&exists)
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
	sessions[sessionID] = login

	http.SetCookie(w, &http.Cookie{
		Name:     "session_id",
		Value:    sessionID,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]bool{"success": true})
}

func checkSessionHandler(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("session_id")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"logged_in": false})
		return
	}

	login, ok := sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]bool{"logged_in": false})
		return
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"logged_in": true,
		"user":      login,
	})
}

func logoutHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session_id")
	if err == nil {
		// Удаляем сессию из памяти
		delete(sessions, cookie.Value)

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
