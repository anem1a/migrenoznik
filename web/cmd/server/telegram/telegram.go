package telegram

import (
	"log"
	"time"

	tgbotapi "github.com/go-telegram-bot-api/telegram-bot-api/v5"
)

// список пользователей, которым нужно слать напоминания
var subscribers = make(map[int64]bool)

func StartReminderBot(botToken string) {
	bot, err := tgbotapi.NewBotAPI(botToken)
	if err != nil {
		log.Println("Ошибка Telegram API:", err)
		return
	}

	log.Println("Telegram бот запущен:", bot.Self.UserName)

	u := tgbotapi.NewUpdate(0)
	u.Timeout = 30

	updates := bot.GetUpdatesChan(u)

	// Горутинa: слушает чат и добавляет юзеров
	go func() {
		for update := range updates {
			if update.Message == nil {
				continue
			}

			chatID := update.Message.Chat.ID

			if update.Message.Text == "/start" {
				subscribers[chatID] = true

				msg := tgbotapi.NewMessage(chatID, "Вы подписались на напоминания дневника мигрени!")
				bot.Send(msg)
				continue
			}

			if update.Message.Text == "/stop" {
				delete(subscribers, chatID)

				msg := tgbotapi.NewMessage(chatID, "Вы отписались от напоминаний.")
				bot.Send(msg)
				continue
			}
		}
	}()

	// Горутинa: отправляет напоминения каждый день в 20:00
	go func() {
		for {
			// текущее время
			now := time.Now()

			// время следующего запуска — сегодня в 20:00
			nextRun := time.Date(
				now.Year(),
				now.Month(),
				now.Day(),
				20, 0, 0, 0,
				now.Location(),
			)

			// если 20:00 уже прошло — запускаем завтра
			if now.After(nextRun) {
				nextRun = nextRun.Add(24 * time.Hour)
			}

			// ждем до 20:00
			sleepDuration := time.Until(nextRun)
			log.Println("Следующая отправка уведомлений в:", nextRun.Format("15:04"))
			time.Sleep(sleepDuration)

			// отправляем уведомления
			for chatID := range subscribers {
				msg := tgbotapi.NewMessage(chatID, "Надеемся вы не забыли оставить запись в дневнике мигрени! migrenoznik.ru")
				bot.Send(msg)
			}
		}
	}()
}
