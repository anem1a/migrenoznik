// package telegram реализует интеграцию веб-приложения «Мигренозник» с мессенджером Telegram.
// Пакет отвечает за:
//   - запуск Telegram-бота;
//   - обработку команд пользователей (/start, /stop);
//   - хранение списка подписчиков;
//   - отправку ежедневных напоминаний о заполнении дневника мигрени.
package telegram

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// botToken хранит токен Telegram-бота.
var botToken = "8537928241:AAEHMKVmX-EEn0mWNQ-knRYPQfor5m05BOk"

var Bot *tgbotapi.BotAPI

// TgUsers — список пользователей, подписанных на напоминания.
var TgUsers = make(map[string]int64)

var Mu sync.RWMutex

// StartReminderBot запускает Telegram-бота для отправки ежедневных напоминаний
// о необходимости заполнения дневника мигрени.
func StartReminderBot() {
	if botToken == "" {
		log.Println("⚠️ Telegram бот не запущен: токен не задан")
		return
	}

	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Println("Ошибка Telegram API:", err)
		return
	}

	Bot = bot

	log.Println("🤖 Telegram бот запущен:", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 30
	updates := bot.GetUpdatesChan(u)

	// Горутина: обработка входящих команд от пользователей
	go func() {
		for update := range updates {
			if update.Message == nil {
				continue
			}

			chatID := update.Message.Chat.ID
			username := update.Message.From.UserName

			switch update.Message.Text {
			case "/start":
				if username == "" {
					msg := tgbotapi.NewMessage(
						chatID,
						"⚠️ У вас не задан username в Telegram. Задайте его в настройках.",
					)
					bot.Send(msg)
					continue
				}

				Mu.Lock()
				TgUsers[username] = chatID
				Mu.Unlock()

				msg := tgbotapi.NewMessage(
					chatID,
					"✅ Вы подписались на уведомления Migrenoznik.",
				)
				bot.Send(msg)
				log.Println(TgUsers)

			case "/stop":
				if username != "" {
					Mu.Lock()
					delete(TgUsers, username)
					Mu.Unlock()
				}

				msg := tgbotapi.NewMessage(
					chatID,
					"❌ Вы отписались от уведомлений.",
				)
				bot.Send(msg)
			}
		}
	}()

	// Горутина: ежедневная отправка напоминаний в 20:00 по МСК
	go func() {
		loc, _ := time.LoadLocation("Europe/Moscow")

		for {
			now := time.Now().In(loc)
			nextRun := time.Date(
				now.Year(), now.Month(), now.Day(),
				20, 0, 0, 0, loc,
			)

			if now.After(nextRun) {
				nextRun = nextRun.Add(24 * time.Hour)
			}

			time.Sleep(time.Until(nextRun))

			Mu.RLock()
			for _, chatID := range TgUsers {
				msg := tgbotapi.NewMessage(
					chatID,
					"🧠 Не забудьте внести запись в дневник мигрени!\nhttps://migrenoznik.ru",
				)
				Bot.Send(msg)
			}
			Mu.RUnlock()

			log.Println("✅ Telegram-уведомления отправлены")
		}
	}()
}

func EnrollHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	log.Println("мы здесь")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		Address string `json:"address"`
		Med     string `json:"med"`
		Date    string `json:"date"`
		Time    string `json:"time"`
		Login   string `json:"login"` // telegram username
	}

	log.Println(req.Address, req.Med, req.Date, req.Time, req.Login)

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": false,
		})
		return
	}

	Mu.RLock()
	chatID, ok := TgUsers[req.Login]
	Mu.RUnlock()

	if !ok {
		log.Println("⚠️ Telegram user not found:", req.Login)
		return
	}

	text := fmt.Sprintf(
		"📅 Вы записаны на приём\n\n"+
			"📍 Адрес: %s\n"+
			"👨‍⚕️ Врач: %s\n"+
			"🗓 Дата: %s\n"+
			"⏰ Время: %s",
		req.Address,
		req.Med,
		req.Date,
		req.Time,
	)

	msg := tgbotapi.NewMessage(chatID, text)
	Bot.Send(msg)

	log.Println("✅ Телеграм уведомление прилетело", req.Login)
}
