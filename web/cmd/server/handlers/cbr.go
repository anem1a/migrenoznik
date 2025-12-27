package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
)

type CBRResponse struct {
	Valute map[string]struct {
		Nominal float64 `json:"Nominal"`
		Value   float64 `json:"Value"`
	} `json:"Valute"`
}

// /api/convert?rub=1000&currency=USD
func ConvertHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")

	rubStr := r.URL.Query().Get("rub")
	currency := strings.ToUpper(r.URL.Query().Get("currency"))

	rub, err := strconv.ParseFloat(rubStr, 64)
	if err != nil {
		log.Println("Ошибка парсинга rub:", err)
		w.Write([]byte("nil"))
		return
	}

	resp, err := http.Get("https://www.cbr-xml-daily.ru/daily_json.js")
	if err != nil {
		log.Println("Ошибка запроса к ЦБР:", err)
		w.Write([]byte("nil"))
		return
	}
	defer resp.Body.Close()

	var data CBRResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Println("Ошибка декодирования ответа ЦБР:", err)
		w.Write([]byte("nil"))
		return
	}

	val, ok := data.Valute[currency]
	if !ok {
		log.Println("Валюта не найдена:", currency)
		w.Write([]byte("nil"))
		return
	}

	result := rub / (val.Value / val.Nominal)
	w.Write([]byte(fmt.Sprintf("%.2f", result)))
}
