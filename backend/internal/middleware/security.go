package middleware

import (
	"crypto/rand"
	"encoding/base64"
	"net/http"

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

// CSRFProtection adds CSRF token validation for state-changing operations
func CSRFProtection(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip CSRF for GET requests and OPTIONS
		if r.Method == "GET" || r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		// Check for CSRF token in header
		csrfToken := r.Header.Get("X-CSRF-Token")
		if csrfToken == "" {
			http.Error(w, "CSRF token missing", http.StatusForbidden)
			return
		}

		// Validate CSRF token (simplified - in production, use a proper CSRF library)
		if !isValidCSRFToken(csrfToken) {
			http.Error(w, "Invalid CSRF token", http.StatusForbidden)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func isValidCSRFToken(token string) bool {
	// This is a simplified validation - in production, implement proper CSRF validation
	// using a library like gorilla/csrf
	return len(token) >= 32
}

func GenerateCSRFToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return base64.URLEncoding.EncodeToString(bytes)
}

func CORSHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		origin := r.Header.Get("Origin")
		if origin != "" {
			// Only allow specific origins, never wildcard in production
			if config.App.FrontendCors != "*" && origin == config.App.FrontendCors {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			} else if config.App.FrontendCors == "*" && r.TLS != nil {
				// Only allow wildcard in development with HTTPS
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}
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
