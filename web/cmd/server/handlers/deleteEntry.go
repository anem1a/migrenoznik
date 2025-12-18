// Package handlers содержит HTTP-обработчики API, реализующие бизнес-логику веб-приложения «Мигренозник».
// В данном файле реализован обработчик удаления записи о приступе мигрени.

package handlers

import (
	"encoding/json"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"strconv"
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
func DeleteEntryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	// Разрешён только GET-метод
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Проверка сессии
	cookie, err := r.Cookie("session_id")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Println("Ошибка сессии")
		return
	}

	// Получение логина из массива сессий
	login, ok := global.Sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Println("Сессия не найдена")
		return
	}
	// Получение ID записи из параметра запроса
	entryIdStr := r.FormValue("id")
	entryID, err := strconv.Atoi(entryIdStr)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Println("Некорректный ID записи:", err)
		return
	}

	// Проверка, что запись принадлежит пользователю
	var accID int
	err = global.DB.QueryRow(`
        SELECT acc_id FROM "Attacks"
        WHERE id_entry = $1
    `, entryID).Scan(&accID)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Println("Запись не найдена:", err)
		return
	}

	// Получение acc_id пользователя по логину
	var accIDUser int
	err = global.DB.QueryRow(`
        SELECT acc_id FROM "Accounts"
        WHERE acc_login = $1
    `, login).Scan(&accIDUser)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Println("Аккаунт не найден у пользователя:", err)
		return
	}

	// Проверка принадлежности записи пользователю
	if accID != accIDUser {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		log.Printf("⚠️ Пользователь %s попытался удалить чужую запись (id_entry=%d)\n", login, entryID)
		return
	}

	// Удаление связанных записей
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Trigger" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Symptom" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Drug" WHERE id_entry = $1`, entryID)

	// Удаление самой записи
	_, err = global.DB.Exec(`DELETE FROM "Attacks" WHERE id_entry = $1`, entryID)

	if err != nil {
		log.Println("Ошибка удаления атаки:", err)
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	// Отправка успешного ответа
	json.NewEncoder(w).Encode(map[string]bool{"success": true})

}
