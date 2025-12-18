// package telegram реализует интеграцию веб-приложения «Мигренозник» с мессенджером Telegram.
// Пакет отвечает за:
//   - запуск Telegram-бота;
//   - обработку команд пользователей (/start, /stop);
//   - хранение списка подписчиков;
//   - отправку ежедневных напоминаний о заполнении дневника мигрени.
package telegram

import (
	"log"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// botToken хранит токен Telegram-бота.
var botToken = "мегаультратокен"

// subscribers — список пользователей, подписанных на напоминания.
var subscribers = make(map[int64]bool)

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

			switch update.Message.Text {
			case "/start":
				subscribers[chatID] = true
				msg := tgbotapi.NewMessage(chatID,
					"Вы подписались на напоминания дневника мигрени!")
				bot.Send(msg)

			case "/stop":
				delete(subscribers, chatID)
				msg := tgbotapi.NewMessage(chatID,
					"Вы отписались от напоминаний.")
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

			for chatID := range subscribers {
				msg := tgbotapi.NewMessage(
					chatID,
					"🧠 Не забудьте внести запись в дневник мигрени!\nhttps://migrenoznik.ru",
				)
				bot.Send(msg)
			}

			log.Println("✅ Telegram-уведомления отправлены")
		}
	}()
}
