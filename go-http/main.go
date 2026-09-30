package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
)

type greeting struct {
	Message string `json:"message"`
}

func routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /{$}", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "text/html; charset=utf-8")
		fmt.Fprint(w, "<h1>Hello from Go</h1><p>Edit main.go, then restart the app.</p>")
	})

	mux.HandleFunc("GET /api/hello", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("name")
		if name == "" {
			name = "world"
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(greeting{Message: "Hello, " + name + "!"})
	})

	return mux
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func main() {
	addr := env("HOST", "0.0.0.0") + ":" + env("PORT", "8080")

	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, routes()))
}
