package api

import (
	"encoding/json"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func WriteMessage(w http.ResponseWriter, status int, msgType, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(map[string]string{msgType: msg})
}

func DecodeJSON[T any](w http.ResponseWriter, r *http.Request) (T, error) {
	var data T
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return data, err
	}
	return data, nil
}

func WriteInternalError(w http.ResponseWriter) {
	http.Error(w, "server error", http.StatusInternalServerError)
}

func WriteInvalidCredentials(w http.ResponseWriter) {
	http.Error(w, "invalid credentials", http.StatusUnauthorized)
}
