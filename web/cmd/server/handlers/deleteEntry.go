// Package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// В данном файле реализован обработчик удаления записи о приступе мигрени.

package handlers

import (
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// DeleteEntryHandler обрабатывает GET-запрос на удаление записи о приступе мигрени.
// Функция выполняет следующие действия:
// 1. Проверяет метод запроса (разрешён только GET).
// 2. Проверяет наличие сессии пользователя по cookie.
// 3. Получает id записи из параметра запроса.
// 4. Проверяет принадлежность записи пользователю (нельзя удалить чужую запись).
// 5. Удаляет все связанные записи:
//   - триггеры (Attack-Trigger),
//   - симптомы (Attack-Symptom),
//   - лекарства (Attack-Drug).
//
// 6. Удаляет саму запись в таблице "Attacks".
// 7. Возвращает JSON с результатом операции.
func DeleteEntryHandler(c *gin.Context) {

	cookie, err := c.Cookie("session_id")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false})
		log.Println("Сессия не найдена в cookie")
		return
	}

	login, ok := global.Sessions[cookie]
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false})
		log.Println("Сессия не найдена в хранилище")
		return
	}

	// 📌 Получение ID записи из query-параметра
	entryIDStr := c.Query("id")
	entryID, err := strconv.Atoi(entryIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false})
		log.Println("Некорректный ID записи:", err)
		return
	}

	// 🔎 Получаем acc_id записи
	var accID int
	err = global.DB.QueryRow(`
		SELECT acc_id FROM "Attacks"
		WHERE id_entry = $1
	`, entryID).Scan(&accID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false})
		log.Println("Запись не найдена в БД:", err)
		return
	}

	// 🔎 Получаем acc_id пользователя
	var accIDUser int
	err = global.DB.QueryRow(`
		SELECT acc_id FROM "Accounts"
		WHERE acc_login = $1
	`, login).Scan(&accIDUser)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		log.Println("Аккаунт пользователя не найден в БД:", err)
		return
	}

	// 🚫 Проверка принадлежности записи
	if accID != accIDUser {
		c.JSON(http.StatusForbidden, gin.H{"success": false})
		log.Printf("⚠️ Пользователь %s попытался удалить чужую запись (id_entry=%d)\n", login, entryID)
		return
	}

	// 🧹 Удаление связанных данных
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Trigger" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Symptom" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Drug" WHERE id_entry = $1`, entryID)

	// ❌ Удаление самой записи
	_, err = global.DB.Exec(`DELETE FROM "Attacks" WHERE id_entry = $1`, entryID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false})
		log.Println("Ошибка удаления записи:", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
