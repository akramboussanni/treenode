package mailer

import (
	"bytes"
	"embed"
	"html/template"
	"os"
)

var tmplCache = map[string]*template.Template{}

//go:embed templates/*
var embedded embed.FS

func GetTemplate(name string) (*template.Template, error) {
	if tmpl, ok := tmplCache[name]; ok {
		return tmpl, nil
	}

	path := "templates/" + name + ".html"
	tmpl, err := getTemplate(path)

	if err != nil {
		return nil, err
	}

	tmplCache[name] = tmpl
	return tmpl, nil
}

func getTemplate(path string) (*template.Template, error) {
	if _, err := os.Stat(path); err == nil {
		return template.ParseFiles(path)
	}
	return template.ParseFS(embedded, path)
}

func LoadTemplate(name string, data any) (string, error) {
	tmpl, err := GetTemplate(name)
	if err != nil {
		return "", err
	}

	return renderTemplate(tmpl, data)
}

func renderTemplate(tmpl *template.Template, data any) (string, error) {
	var buf bytes.Buffer
	err := tmpl.Execute(&buf, data)
	if err != nil {
		return "", err
	}
	return buf.String(), nil
}
