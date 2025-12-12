package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"strconv"
	"time"
)

func AddEntryHandler(w http.ResponseWriter, r *http.Request) {
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
		log.Println("Ошибка сессии")
		return
	}

	login, ok := global.Sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 13,
		})
		log.Println("Ошибка логина")
		return
	}

	// Находим acc_id по логину
	var accID int
	err = global.DB.QueryRow(
		`SELECT acc_id FROM "Accounts" WHERE acc_login = $1`,
		login,
	).Scan(&accID)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 666,
		})
		log.Println("Аккаунт не найден")
		return
	}

	// Получаем POST-поля
	dtStartStr := r.FormValue("dt_start")
	dtEndStr := r.FormValue("dt_end")
	strengthStr := r.FormValue("strength")
	triggersSlice := r.FormValue("triggers")
	symptomsSlice := r.FormValue("symptoms")
	drugsSliceMap := r.FormValue("drugs")

	if dtStartStr == "" || dtEndStr == "" || strengthStr == "" || triggersSlice == "" || symptomsSlice == "" || drugsSliceMap == "" {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		return
	}

	dtStartUnix, err := strconv.ParseInt(dtStartStr, 10, 64)
	dtStartUnix /= 1000
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		fmt.Println("что-то с датой")
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
		fmt.Println("что-то с силой")
		return
	}

	// triggers — JSON массив
	var triggers []int
	err = json.Unmarshal([]byte(triggersSlice), &triggers)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		fmt.Println("что-то с триггерами")
		return
	}

	// symptoms — JSON массив
	var symptoms []int
	err = json.Unmarshal([]byte(symptomsSlice), &symptoms)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		fmt.Println("что-то с симптомами")
		return
	}

	// drugs — JSON объект (словарь)
	var drugs []string
	err = json.Unmarshal([]byte(drugsSliceMap), &drugs)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		fmt.Println("что-то с лекарствами")
		return
	}

	// 1. Вставляем запись в Attacks
	var entryID int
	err = global.DB.QueryRow(`
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
		fmt.Println("SQL Error:", err)
		return
	}

	// 2. Вставляем триггеры
	for _, trID := range triggers {
		_, err = global.DB.Exec(`
        INSERT INTO "Attack-Trigger" (id_entry, id_trigger)
        VALUES ($1, $2)
    `, entryID, trID)

		if err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":    false,
				"id":         nil,
				"error_code": 666,
			})
			fmt.Println("SQL Trigger Error:", err)
			return
		}
	}

	// 2. Вставляем симптомы
	for _, symID := range symptoms {
		_, err = global.DB.Exec(`
		INSERT INTO "Attack-Symptom" (id_entry, id_sympt)
		VALUES ($1, $2)
	`, entryID, symID)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":    false,
				"id":         nil,
				"error_code": 666,
			})
			fmt.Println("SQL Symptom Error:", err)
			return
		}
	}
	// 3. Вставляем лекарства
	for _, drugName := range drugs {
		fmt.Println(entryID, drugName)
		_, err = global.DB.Exec(`
		INSERT INTO "Attack-Drug" (id_entry, atx_code, dosage)	
		VALUES ($1, $2, '')
	`, entryID, drugName)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success":    false,
				"id":         nil,
				"error_code": 666,
			})
			fmt.Println("SQL Drug Error:", err)
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
