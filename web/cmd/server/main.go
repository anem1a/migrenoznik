package main

import (
	"encoding/json"
	"html/template"
	"log"
	"net/http"
)

type LoginResponse struct {
	Success bool `json:"success"`
}

func main() {
	mux := http.NewServeMux()

	// Раздача статики
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Страницы
	mux.HandleFunc("/", indexHandler)
	mux.HandleFunc("/login/", loginPageHandler)

	// API
	mux.HandleFunc("/api/login", loginHandler)

	log.Println("🚀 Сервер запущен")
	log.Fatal(http.ListenAndServe(":80", mux))
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

	res := LoginResponse{Success: login == "admin" && password == "password"}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(res)
}
