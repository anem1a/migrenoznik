// Package handlers содержит HTTP-обработчики API для веб-приложения «Мигренозник».
// В данном файле реализован обработчик всех записей пользователя из БД.
package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"time"
)

// EntriesHandler обрабатывает GET-запрос для получения всех записей пользователя.
// Функция выполняет следующие действия:
// 1. Проверяет наличие сессии по cookie.
// 2. Получает логин пользователя из сессии.
// 3. Определяет acc_id пользователя в базе.
// 4. Получает все записи пользователя из таблицы "Attacks", сортируя по дате (новые первыми).
// 5. Для каждой записи:
//   - форматирует дату для отображения;
//   - получает список триггеров, связанных с записью;
//   - получает список симптомов, связанных с записью;
//   - получает список лекарств, связанных с записью;
//   - собирает все данные в структуру Entry.
//
// 6. Возвращает JSON с массивом всех записей.
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

	// Получение логина из массива сессий
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
	// Получение всех записей пользователя из таблицы "Attacks"
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

	// Структура одной записи
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

	// Перебор всех записей пользователя
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

		// Получение триггеров
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

		// Получение симптомов
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

		// Получение лекарств
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

		// Добавляем запись в список
		entries = append(entries, Entry{
			DT_Start: dtDisplay,
			Duration: duration,
			Strength: strength,
			Triggers: triggers,
			Symptoms: symptoms,
			Drugs:    drugs,
			ID:       id,
		})

	}

	// Отправка ответа с записями
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"entries": entries,
	})
}
