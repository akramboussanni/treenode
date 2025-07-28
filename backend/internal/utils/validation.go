package utils

import (
	"regexp"
	"strings"
	"unicode"
)

var (
	lowerRegex    = regexp.MustCompile(`[a-z]`)
	upperRegex    = regexp.MustCompile(`[A-Z]`)
	digitRegex    = regexp.MustCompile(`\d`)
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{3,30}$`)
	urlRegex      = regexp.MustCompile(`^https?://[^\s/$.?#].[^\s]*$`)
	domainRegex   = regexp.MustCompile(`^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$`)
)

func IsValidPassword(pw string) bool {
	if len(pw) < 8 {
		return false
	}
	return lowerRegex.MatchString(pw) &&
		upperRegex.MatchString(pw) &&
		digitRegex.MatchString(pw)
}

func IsValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}

func IsValidUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

func IsValidURL(url string) bool {
	return urlRegex.MatchString(url)
}

func IsValidDomain(domain string) bool {
	return domainRegex.MatchString(domain)
}

// SanitizeString removes potentially dangerous characters
func SanitizeString(input string) string {
	// Remove null bytes and other control characters
	input = strings.Map(func(r rune) rune {
		if r < 32 && r != 9 && r != 10 && r != 13 {
			return -1
		}
		return r
	}, input)

	// Trim whitespace
	return strings.TrimSpace(input)
}

// ValidateAndSanitizeString validates and sanitizes input
func ValidateAndSanitizeString(input string, maxLength int) (string, bool) {
	if len(input) > maxLength {
		return "", false
	}

	sanitized := SanitizeString(input)
	if sanitized == "" {
		return "", false
	}

	return sanitized, true
}

// ContainsXSS attempts to detect basic XSS patterns
func ContainsXSS(input string) bool {
	xssPatterns := []string{
		"<script", "</script>", "javascript:", "onload=", "onerror=",
		"onclick=", "onmouseover=", "vbscript:", "data:text/html",
	}

	inputLower := strings.ToLower(input)
	for _, pattern := range xssPatterns {
		if strings.Contains(inputLower, pattern) {
			return true
		}
	}

	return false
}

// IsStrongPassword checks for additional password strength requirements
func IsStrongPassword(password string) bool {
	if len(password) < 12 {
		return false
	}

	var (
		hasLower   bool
		hasUpper   bool
		hasDigit   bool
		hasSpecial bool
	)

	for _, char := range password {
		switch {
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsDigit(char):
			hasDigit = true
		case unicode.IsPunct(char) || unicode.IsSymbol(char):
			hasSpecial = true
		}
	}

	return hasLower && hasUpper && hasDigit && hasSpecial
}
