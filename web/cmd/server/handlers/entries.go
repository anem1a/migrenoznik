// Package handlers содержит HTTP-обработчики API для веб-приложения «Мигренозник».
// В данном файле реализован обработчик всех записей пользователя из БД.
package handlers

import (
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
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

// 📦 Структура ответа
type Entry struct {
	DT_Start string   `json:"DT_Start"`
	Duration float64  `json:"Duration"`
	Strength int      `json:"Strength"`
	Triggers []int    `json:"Triggers"`
	Symptoms []int    `json:"Symptoms"`
	Drugs    []string `json:"Drugs"`
	ID       int      `json:"ID"`
}

func EntriesHandler(c *gin.Context) {

	cookie, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"entries": []Entry{},
		})
		log.Println("Сессия не найдена в cookie")
		return
	}

	login, ok := global.Sessions[cookie]
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{
			"success": false,
			"entries": []Entry{},
		})
		log.Println("Сессия не найдена в хранилище")
		return
	}

	// 🆔 Получаем acc_id пользователя
	var accID int
	err = global.DB.QueryRow(`
		SELECT acc_id
		FROM "Accounts"
		WHERE acc_login = $1
	`, login).Scan(&accID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"entries": []Entry{},
		})
		log.Println("Аккаунт не найден в БД")
		return
	}

	// 📥 Получение всех записей
	rows, err := global.DB.Query(`
		SELECT id_entry, date, time, duration, pain_level
		FROM "Attacks"
		WHERE acc_id = $1
		ORDER BY date DESC
	`, accID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"entries": []Entry{},
		})
		log.Println("Ошибка запроса записей с БД:", err)
		return
	}
	defer rows.Close()

	var entries []Entry

	// 🔄 Перебор записей
	for rows.Next() {
		var (
			id       int
			dateVal  time.Time
			timeVal  time.Time
			duration float64
			strength int
		)

		if err := rows.Scan(&id, &dateVal, &timeVal, &duration, &strength); err != nil {
			continue
		}

		dateTime := time.Date(
			dateVal.Year(),
			dateVal.Month(),
			dateVal.Day(),
			timeVal.Hour(),
			timeVal.Minute(),
			0,
			0,
			time.UTC,
		)

		dtDisplay := dateTime.Format("2006-01-02T15:04Z")

		// 🧠 Триггеры
		triggers := fetchIntList(`
			SELECT id_trigger
			FROM "Attack-Trigger"
			WHERE id_entry = $1
		`, id)

		// 🤕 Симптомы
		symptoms := fetchIntList(`
			SELECT id_sympt
			FROM "Attack-Symptom"
			WHERE id_entry = $1
		`, id)

		// 💊 Лекарства
		drugs := fetchStringList(`
			SELECT atx_code
			FROM "Attack-Drug"
			WHERE id_entry = $1
		`, id)

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

	if entries == nil {
		entries = []Entry{}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"entries": entries,
	})
	log.Printf("📦 Записи получены для пользователя: %s, количество: %d\n", login, len(entries))
}

func fetchIntList(query string, id int) []int {
	rows, err := global.DB.Query(query, id)
	if err != nil {
		return []int{}
	}
	defer rows.Close()

	var result []int
	for rows.Next() {
		var value int
		if err := rows.Scan(&value); err == nil {
			result = append(result, value)
		}
	}

	if result == nil {
		return []int{}
	}
	return result
}

func fetchStringList(query string, id int) []string {
	rows, err := global.DB.Query(query, id)
	if err != nil {
		return []string{}
	}
	defer rows.Close()

	var result []string
	for rows.Next() {
		var value string
		if err := rows.Scan(&value); err == nil {
			result = append(result, value)
		}
	}

	if result == nil {
		return []string{}
	}
	return result
}
