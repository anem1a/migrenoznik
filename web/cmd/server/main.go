package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"regexp"
	"strconv"
	"time"

	_ "github.com/lib/pq"
)

const (
	host     = "oferolefket.beget.app"
	port     = 5432
	user     = "anna"
	password = "a06q*ZtF*JXN"
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
	mux.HandleFunc("/api/signup", signupHandler)
	mux.HandleFunc("/api/add_entry", addEntryHandler)
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

func isPasswordStrong(pw string) bool {
	if len(pw) < 8 {
		return false
	}

	hasUpper := false
	hasLower := false
	hasDigit := false

	for _, c := range pw {
		switch {
		case c >= 'A' && c <= 'Z':
			hasUpper = true
		case c >= 'a' && c <= 'z':
			hasLower = true
		case c >= '0' && c <= '9':
			hasDigit = true
		}
	}

	return hasUpper && hasLower && hasDigit
}

func signupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	login := r.FormValue("login")
	password := r.FormValue("password")

	// Проверка на пустые поля
	if login == "" || password == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 4})
		return
	}

	// Проверка логина: 5–20 символов, латиница и "_"
	matchLogin, _ := regexp.MatchString(`^[A-Za-z_]{5,20}$`, login)
	if !matchLogin {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 3})
		return
	}

	// Проверка сложности пароля
	if !isPasswordStrong(password) {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 2})
		return
	}

	// Проверка, существует ли пользователь
	var exists bool
	err := db.QueryRow(`SELECT EXISTS(SELECT 1 FROM "Accounts" WHERE acc_login = $1);`, login).Scan(&exists)
	if err != nil {
		log.Println("Ошибка при проверке логина:", err)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 5})
		return
	}
	if exists {
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 1})
		return
	}

	// Создание пользователя
	_, err = db.Exec(`INSERT INTO "Accounts" (acc_login, acc_password, acc_created) VALUES ($1, $2, NOW());`, login, password)
	if err != nil {
		log.Println("Ошибка при добавлении пользователя:", err)
		json.NewEncoder(w).Encode(map[string]interface{}{"success": false, "code": 5})
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
	json.NewEncoder(w).Encode(map[string]interface{}{"success": true, "code": 0})
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

func addEntryHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Проверка сессии
	cookie, err := r.Cookie("session_id")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 13,
		})
		return
	}

	login, ok := sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 13,
		})
		return
	}

	// Находим acc_id по логину
	var accID int
	err = db.QueryRow(
		`SELECT acc_id FROM "Accounts" WHERE acc_login = $1`,
		login,
	).Scan(&accID)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 666,
		})
		return
	}

	// Получаем POST-поля
	dtStartStr := r.FormValue("dt_start")
	dtEndStr := r.FormValue("dt_end")
	strengthStr := r.FormValue("strength")
	triggersJSON := r.FormValue("triggers")
	// Валидация
	if dtStartStr == "" || dtEndStr == "" || strengthStr == "" || triggersJSON == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	// Парс dt_start и dt_end
	dtStartUnix, err := strconv.ParseInt(dtStartStr, 10, 64)
	dtStartUnix /= 1000
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	dtEndUnix, err := strconv.ParseInt(dtEndStr, 10, 64)
	dtEndUnix /= 1000
	if err != nil || dtEndUnix < dtStartUnix {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	tStart := time.Unix(dtStartUnix, 0)
	tEnd := time.Unix(dtEndUnix, 0)

	date := tStart.Format("2006-01-02")
	timeValue := tStart.Format("15:04:05")

	durationHours := int(tEnd.Sub(tStart).Hours())
	if durationHours < 0 {
		durationHours = 0
	}

	// Парсим strength
	strength, err := strconv.Atoi(strengthStr)
	if err != nil || strength < 0 || strength > 10 {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	// triggers — JSON массив
	var triggers []int
	err = json.Unmarshal([]byte(triggersJSON), &triggers)
	if err != nil || len(triggers) == 0 {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	fmt.Println(accID, date, timeValue, strength, durationHours)
	// 1. Вставляем запись в Attacks
	var entryID int
	err = db.QueryRow(`
        INSERT INTO "Attacks" (acc_id, date, time, pain_level, duration, notes)
        VALUES ($1, $2, $3, $4, $5, '')
        RETURNING id_entry
    `, accID, date, timeValue, strength, durationHours).Scan(&entryID)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 666,
		})
		fmt.Println("что-то не то в запросе бд 1")
		return
	}

	fmt.Println(entryID, triggers)
	// 2. Вставляем триггеры
	for _, trID := range triggers {
		fmt.Println(entryID, trID)
		_, err = db.Exec(`
            INSERT INTO "Attack-Trigger" (id_entry, id_trigger)
            VALUES ($1, $2)
        `, entryID, trID)

		if err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":    false,
				"id":         nil,
				"error_code": 666,
			})
			fmt.Println("SQL Error:", err)
			return
		}
	}

	// Успех
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"id":         entryID,
		"error_code": 0,
	})
	log.Println("✅ Запись добавлена")

}
