package handlers

import (
	"encoding/json"
	"log"
	"migrenoznik/cmd/server/global"
	"net/http"
	"strconv"
)

func DeleteEntryHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cookie, err := r.Cookie("session_id")
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	login, ok := global.Sessions[cookie.Value]
	if !ok {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	entryIdStr := r.FormValue("id")
	entryID, err := strconv.Atoi(entryIdStr)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	var accID int
	err = global.DB.QueryRow(`
        SELECT acc_id FROM "Attacks"
        WHERE id_entry = $1
    `, entryID).Scan(&accID)

	if err != nil {
		log.Println("Запись не найдена:", err)
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	var accIDUser int
	err = global.DB.QueryRow(`
        SELECT acc_id FROM "Accounts"
        WHERE acc_login = $1
    `, login).Scan(&accIDUser)

	if err != nil {
		log.Println("Аккаунт не найден у пользователя:", err)
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	// Если запись не принадлежит пользователю — отказ
	if accID != accIDUser {
		log.Println("Попытка удалить чужую запись!")
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	// 2) Удаляем все связанные записи
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Trigger" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Symptom" WHERE id_entry = $1`, entryID)
	_, _ = global.DB.Exec(`DELETE FROM "Attack-Drug" WHERE id_entry = $1`, entryID)

	// 3) Удаляем саму атаку
	_, err = global.DB.Exec(`DELETE FROM "Attacks" WHERE id_entry = $1`, entryID)

	if err != nil {
		log.Println("Ошибка удаления атаки:", err)
		json.NewEncoder(w).Encode(map[string]bool{"success": false})
		return
	}

	// 4) Успех
	json.NewEncoder(w).Encode(map[string]bool{"success": true})

}
