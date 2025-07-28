package config

import (
	"encoding/json"
	"log"
	"os"
	"reflect"
	"strconv"
	"strings"
)

func DeconstructConfigObject[T any]() T {
	var config T

	v := reflect.ValueOf(&config).Elem()
	t := v.Type()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		value := v.Field(i)
		envTag, ok := field.Tag.Lookup("env")
		if !ok || envTag == "-" {
			envTag = strings.ToLower(field.Name)
		}

		panicTag, ok := field.Tag.Lookup("panic")
		if !ok || panicTag == "-" {
			panicTag = "false"
		}

		defaultTag, ok := field.Tag.Lookup("default")
		if !ok || defaultTag == "-" {
			defaultTag = ""
		}

		setField(value, envTag, panicTag, defaultTag)
	}

	return config
}

var kindFuncs map[reflect.Kind](func(string) (any, error)) = map[reflect.Kind](func(string) (any, error)){
	reflect.Int: func(s string) (any, error) {
		return strconv.Atoi(s)
	},
	reflect.Float32: func(s string) (any, error) {
		f, err := strconv.ParseFloat(s, 32)
		if err != nil {
			return nil, err
		}
		return float32(f), nil
	},
	reflect.Bool: func(s string) (any, error) {
		return strconv.ParseBool(s)
	},
	reflect.Int64: func(s string) (any, error) {
		return strconv.ParseInt(s, 10, 64)
	},
	reflect.Float64: func(s string) (any, error) {
		return strconv.ParseFloat(s, 64)
	},
}

func setField(field reflect.Value, envTag string, shouldPanic string, defaultTag string) {
	switch field.Kind() {
	case reflect.String:
		field.SetString(os.Getenv(envTag))
	case reflect.Map:
		parseMapField(field, envTag, shouldPanic, defaultTag)
	default:
		kindFunc, ok := kindFuncs[field.Kind()]
		if !ok {
			panic("unsupported field type: " + field.Kind().String())
		}
		parsed := ParseSafely(os.Getenv(envTag), kindFunc, envTag, shouldPanic, defaultTag)
		field.Set(reflect.ValueOf(parsed))
	}
}

func parseMapField(field reflect.Value, envTag string, shouldPanic string, defaultTag string) {
	envValue := os.Getenv(envTag)
	if envValue == "" && defaultTag != "" {
		envValue = defaultTag
	}

	if envValue == "" {
		return
	}

	fieldType := field.Type()
	keyType := fieldType.Key()
	valueType := fieldType.Elem()

	if keyType.Kind() != reflect.String {
		panic("map key type must be string for config parsing")
	}

	switch valueType.Kind() {
	case reflect.Int64:
		var parsed map[string]int64
		if err := json.Unmarshal([]byte(envValue), &parsed); err != nil {
			switch shouldPanic {
			case "true":
				panic("failed to parse map config field \"" + envTag + "\": " + err.Error())
			case "warn":
				log.Println("failed to parse map config field \"" + envTag + "\": " + err.Error())
			}
			return
		}
		field.Set(reflect.ValueOf(parsed))
	default:
		panic("unsupported map value type: " + valueType.Kind().String())
	}
}

func ParseSafely[T any](input string, fun func(string) (T, error), envTag, shouldPanic, defaultTag string) T {
	val, err := fun(input)
	if err != nil {
		switch shouldPanic {
		case "true":
			panic("failed to parse config field \"" + envTag + "\": " + err.Error())
		case "warn":
			log.Println("failed to parse config field \"" + envTag + "\": " + err.Error())
		}
		if defaultTag != "" {
			return ParseSafely(defaultTag, fun, envTag, shouldPanic, "")
		}
		return getZero[T]()
	}
	return val
}

func getZero[T any]() T {
	var zero T
	return zero
}
