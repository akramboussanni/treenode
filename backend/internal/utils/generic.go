package utils

import (
	"crypto/rand"
	"encoding/hex"
	"reflect"
	"strconv"
	"time"
)

func IfNil[T any](val *T, defaultVal T) *T {
	if val == nil {
		return &defaultVal
	}
	return val
}

func StripUnsafeFields[T any](ptr *T) {
	v := reflect.ValueOf(ptr)
	if v.Kind() != reflect.Ptr || v.Elem().Kind() != reflect.Struct {
		panic("StripUnsafeFields requires pointer to struct")
	}
	v = v.Elem()
	t := v.Type()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		if field.Tag.Get("safe") != "true" {
			fv := v.Field(i)
			if fv.CanSet() {
				fv.Set(reflect.Zero(field.Type))
			}
		}
	}
}

func ParseID(idStr string) (int64, error) {
	return strconv.ParseInt(idStr, 10, 64)
}

func GenerateSecureToken() string {
	bytes := make([]byte, 32)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func pluralize(n int, singular, plural string) string {
	if n == 1 {
		return singular
	}
	return plural
}

func ExpiryToString(seconds int) string {
	d := time.Duration(seconds) * time.Second
	hours := int(d.Hours())
	minutes := int(d.Minutes())
	days := hours / 24

	switch {
	case d < time.Minute:
		return "less than a minute"
	case d < time.Hour:
		min := minutes
		return strconv.Itoa(min) + " " + pluralize(min, "minute", "minutes")
	case d < 24*time.Hour:
		h := hours
		return strconv.Itoa(h) + " " + pluralize(h, "hour", "hours")
	default:
		return strconv.Itoa(days) + " " + pluralize(days, "day", "days")
	}
}
