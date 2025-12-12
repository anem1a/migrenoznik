package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"time"
)

func EntriesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Проверка сессии
	cookie, err := r.Cookie("session_id")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"entries": nil,
		})
		log.Println("Ошибка сессии")
		return
	}

	login, ok := global.Sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"entries": nil,
		})
		log.Println("Ошибка логина")
		return
	}

	var accID int
	err = global.DB.QueryRow(`
        SELECT acc_id
        FROM "Accounts"
        WHERE acc_login = $1
    `, login).Scan(&accID)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"entries": nil,
		})
		log.Println("Аккаунт не найден")
		return
	}

	rows, err := global.DB.Query(`
        SELECT id_entry, date, duration, pain_level
        FROM "Attacks"
        WHERE acc_id = $1
        ORDER BY date DESC
    `, accID)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
			"entries": nil,
		})
		log.Println("Ошибка запроса в бд")
		return
	}
	defer rows.Close()

	type Entry struct {
		DT_Start string   `json:"DT_Start"`
		Duration float64  `json:"Duration"` // в часах
		Strength int      `json:"Strength"`
		Triggers []string `json:"Triggers"`
		Symptoms []string `json:"Symptoms"`
		Drugs    []string `json:"Drugs"`
		ID       int      `json:"ID"`
	}

	var entries []Entry

	for rows.Next() {
		var id int
		var date time.Time
		var duration float64
		var strength int

		if err := rows.Scan(&id, &date, &duration, &strength); err != nil {
			continue
		}
		// Форматируем дату: 27.11.25
		dtDisplay := date.Format("02.01.06")

		// Получаем триггеры для этой атаки
		trigRows, err := global.DB.Query(`
    		SELECT t.name
    		FROM "Attack-Trigger" at
    		JOIN "Triggers" t ON at.id_trigger = t.id_trigger
    		WHERE at.id_entry = $1
		`, id)
		if err != nil {
			fmt.Println("Trigger error:", err)
			continue
		}

		var triggers []string
		for trigRows.Next() {
			var name string
			trigRows.Scan(&name)
			triggers = append(triggers, name)
		}

		trigRows.Close()

		if triggers == nil {
			triggers = []string{}
		}

		// Получаем симптомы для этой атаки
		symptRows, err := global.DB.Query(`
			SELECT s.name
			FROM "Attack-Symptom" ast		
			JOIN "Symptoms" s ON ast.id_sympt = s.id_sympt
			WHERE ast.id_entry = $1
		`, id)
		if err != nil {
			fmt.Println("Symptom error:", err)
			continue
		}
		var symptoms []string
		for symptRows.Next() {
			var name string
			symptRows.Scan(&name)
			symptoms = append(symptoms, name)
		}
		symptRows.Close()
		if symptoms == nil {
			symptoms = []string{}
		}

		// Получаем лекарства для этой атаки
		drugsRows, err := global.DB.Query(`
			SELECT ad.drug_name
			FROM "Attack-Drug" add
			JOIN "Drugs" ad ON add.atx_code = ad.atx_code
			WHERE add.id_entry = $1
		`, id)
		if err != nil {
			fmt.Println("Drug error:", err)
			continue
		}

		var drugs []string
		for drugsRows.Next() {
			var atxCode string
			drugsRows.Scan(&atxCode)
			drugs = append(drugs, atxCode)
		}
		drugsRows.Close()
		if drugs == nil {
			drugs = []string{}
		}

		// Добавляем запись с нужными полями
		entries = append(entries, Entry{
			DT_Start: dtDisplay,
			Duration: duration,
			Strength: strength,
			Triggers: triggers,
			Symptoms: symptoms,
			Drugs:    drugs,
			ID:       id,
		})

		// fmt.Println(dtDisplay, duration, strength, triggers, symptoms, drugs)
	}

	// Отправляем JSON
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"entries": entries,
	})
}
