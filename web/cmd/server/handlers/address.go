package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"
	"time"
)

const dadataAPIKey = "2199d3f7b8aa2e7ea0f52ce0787479c160cc7966"

type dadataRequest struct {
	Query string `json:"query"`
	Count int    `json:"count,omitempty"`
}

type dadataResponse struct {
	Suggestions []struct {
		Value string `json:"value"`
	} `json:"suggestions"`
}

func AddressHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")

	query := r.URL.Query().Get("query")
	if query == "" {
		log.Println("Пустой query в запросе к DaData")
		w.Write([]byte("nil"))
		return
	}

	reqBody, _ := json.Marshal(dadataRequest{
		Query: query,
		Count: 5,
	})

	req, err := http.NewRequest("POST", "https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address",
		strings.NewReader(string(reqBody)))
	if err != nil {
		log.Println("Ошибка создания запроса к DaData:", err)
		w.Write([]byte("nil"))
		return
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Authorization", "Token "+dadataAPIKey)

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Println("Ошибка запроса к DaData:", err)
		w.Write([]byte("nil"))
		return
	}

	defer resp.Body.Close()

	var data dadataResponse
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		log.Println("Dadata decode error:", err)
		w.Write([]byte("nil"))
		return
	}

	if len(data.Suggestions) == 0 {
		w.Write([]byte("nil"))
		return
	}

	w.Write([]byte(data.Suggestions[0].Value))

}
