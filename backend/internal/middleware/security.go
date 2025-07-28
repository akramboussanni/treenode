package middleware

import (
	"log"
	"net/http"
	"strings"

	"github.com/akramboussanni/treenode/config"
)

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("X-XSS-Protection", "1; mode=block")

		if config.App.TLSEnabled || r.TLS != nil {
			w.Header().Set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")
		}

		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';")
		w.Header().Set("Server", "")
		w.Header().Set("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
		w.Header().Set("Cross-Origin-Embedder-Policy", "require-corp")
		w.Header().Set("Cross-Origin-Opener-Policy", "same-origin")

		next.ServeHTTP(w, r)
	})
}

func CORSHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		origin := r.Header.Get("Origin")
		log.Printf("CORS Debug: Request origin='%s', configured FrontendCors='%s'", origin, config.App.FrontendCors)

		if origin != "" {
			// Handle wildcard CORS for development
			if config.App.FrontendCors == "*" {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				log.Printf("CORS: Setting wildcard origin for '%s'", origin)
			} else if config.App.FrontendCors == origin {
				// Exact match
				w.Header().Set("Access-Control-Allow-Origin", origin)
				log.Printf("CORS: Setting specific origin for '%s'", origin)
			} else if strings.HasPrefix(config.App.FrontendCors, "*.") {
				domain := strings.TrimPrefix(config.App.FrontendCors, "*.")
				if strings.HasSuffix(origin, "."+domain) || origin == "https://"+domain {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					log.Printf("CORS: Setting wildcard subdomain origin for '%s' (matches '*.%s')", origin, domain)
				} else {
					log.Printf("CORS: Origin '%s' does not match wildcard subdomain '*.%s' - NO HEADER SET", origin, domain)
				}
			} else {
				log.Printf("CORS: Origin '%s' does not match configured '%s' - NO HEADER SET", origin, config.App.FrontendCors)
			}
		} else {
			log.Printf("CORS: No Origin header in request")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Recaptcha-Token")
		w.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
