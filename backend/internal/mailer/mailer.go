package mailer

import (
	"errors"

	"github.com/akramboussanni/treenode/internal/applog"
)

var ErrMailerNotInitialized = errors.New("mailer not initialized")

type MailerType string

const (
	MailerSMTP   MailerType = "smtp"
	MailerResend MailerType = "resend"
	MailerMock   MailerType = "mock"
)

var globalMailer Mailer
var defaultFrom string

func Init(config MailerConfig) error {
	defaultFrom = config.Username

	switch config.Type {
	case MailerSMTP:
		globalMailer = &SMTPMailer{config: config}
	case MailerResend:
		globalMailer = &ResendMailer{config: config}
	case MailerMock:
		globalMailer = &MockMailer{config: config}
	default:
		globalMailer = &MockMailer{config: config}
	}

	return globalMailer.Init(config)
}

type Mailer interface {
	Init(config MailerConfig) error
	Send(tmpl, from string, to []string, subject string, data any) error
}

func Send(tmpl string, to []string, subject string, data any) error {
	if globalMailer == nil {
		return ErrMailerNotInitialized
	}

	return globalMailer.Send(tmpl, defaultFrom, to, subject, data)
}

func SendFrom(tmpl string, from string, to []string, subject string, data any) error {
	if globalMailer == nil {
		return ErrMailerNotInitialized
	}

	return globalMailer.Send(tmpl, from, to, subject, data)
}

func SendAsync(tmpl string, to []string, subject string, data any) {
	go func() {
		if err := Send(tmpl, to, subject, data); err != nil {
			applog.Error("Failed to send async email:", err, "template:", tmpl, "to:", to)
		}
	}()
}

func SendFromAsync(tmpl string, from string, to []string, subject string, data any) {
	go func() {
		if err := SendFrom(tmpl, from, to, subject, data); err != nil {
			applog.Error("Failed to send async email:", err, "template:", tmpl, "to:", to)
		}
	}()
}

func GetGlobalMailer() Mailer {
	return globalMailer
}
