// package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
//
// В данном файле реализован обработчик добавления новой записи о приступе мигрени.
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

// AddEntryHandler обрабатывает POST-запрос на добавление новой записи о приступе мигрени.
// Функция выполняет следующие действия:
// 1. Проверяет метод запроса (разрешён только POST).
// 2. Проверяет наличие сессии пользователя по cookie.
// 3. Находит acc_id пользователя в базе по его логину.
// 4. Получает данные из POST-запроса:
//   - dt_start, dt_end — время начала и конца приступа в миллисекундах;
//   - strength — интенсивность боли (0–10);
//   - triggers — JSON-массив идентификаторов триггеров;
//   - symptoms — JSON-массив идентификаторов симптомов;
//   - drugs — JSON-массив названий лекарств.
//
// 5. Выполняет валидацию данных:
//   - проверка пустых полей;
//   - проверка правильности дат и диапазона времени;
//   - проверка диапазона силы боли;
//   - корректность JSON-полей.
//
// 6. Добавляет запись в таблицу "Attacks".
// 7. Добавляет связи с триггерами в таблицу "Attack-Trigger".
// 8. Добавляет связи с симптомами в таблицу "Attack-Symptom".
// 9. Добавляет лекарства в таблицу "Attack-Drug".
// 10. Возвращает JSON-ответ с результатом операции.
func AddEntryHandler(w http.ResponseWriter, r *http.Request) {
	// Разрешён только POST-метод
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

	// Получение логина из массива сессий
	login, ok := global.Sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 13,
		})
		log.Println("Сессия не найдена")
		return
	}

	// Нахождение acc_id по логину в БД
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

	// Получение POST-полей
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

	// Парсинг и конвертация дат
	dtStartUnix, err := strconv.ParseInt(dtStartStr, 10, 64)
	dtStartUnix /= 1000
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		log.Println("Ошибка конвертации даты начала")
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
		log.Println("Ошибка конвертации даты окончания")
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

	// Парсинг интенсивности боли
	strength, err := strconv.Atoi(strengthStr)
	if err != nil || strength < 0 || strength > 10 {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		log.Println("Ошибка конвертации интенсивности боли")
		return
	}

	// Парсинг триггеров
	var triggers []int
	err = json.Unmarshal([]byte(triggersSlice), &triggers)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		log.Println("Ошибка парсинга триггеров")
		return
	}

	// Парсинг симптомов
	var symptoms []int
	err = json.Unmarshal([]byte(symptomsSlice), &symptoms)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		log.Println("Ошибка парсинга симптомов")
		return
	}

	// Парсинг лекарств
	var drugs []string
	err = json.Unmarshal([]byte(drugsSliceMap), &drugs)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success":    false,
			"id":         nil,
			"error_code": 444,
		})
		log.Println("Ошибка парсинга лекарств")
		return
	}

	// Вставка записи в Attacks
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
		log.Println("SQL ошибка при добавлении записи:", err)
		return
	}

	// Вставка триггеров
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
			log.Println("SQL ошибка при добавлении триггеров:", err)
			return
		}
	}

	// Вставка симптомов
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
			log.Println("SQL ошибка при вставке симптома:", err)
			return
		}
	}
	// Вставка лекарств
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
			log.Println("SQL ошибка при вставке лекарства:", err)
			return
		}
	}

	// Отправка успешного ответа
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":    true,
		"id":         entryID,
		"error_code": 0,
	})
	log.Printf("✅ Запись добавлена для пользователя: %s, id записи: %d\n", login, entryID)

}
