package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"

	_ "github.com/lib/pq"
)


const (
	host     = "oferolefket.beget.app"
	port     = 5432
	user     = "anna"
	password = ""
	dbname   = "migrenoznik"
)

var db *sql.DB

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

	// API
	mux.HandleFunc("/api/login", loginHandler)

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
	renderTemplate(w, "index.html")
}

func loginPageHandler(w http.ResponseWriter, r *http.Request) {
	renderTemplate(w, "login.html")
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


	res := map[string]bool{"success": exists}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
