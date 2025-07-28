package mailer

import (
	"gopkg.in/gomail.v2"
)

type SMTPMailer struct {
	config MailerConfig
	dialer *gomail.Dialer
}

func (m *SMTPMailer) Init(config MailerConfig) error {
	m.config = config
	m.dialer = gomail.NewDialer(config.Host, config.Port, config.Username, config.Password)
	return nil
}

func (m *SMTPMailer) Send(tmpl, from string, to []string, subject string, data any) error {
	body, err := LoadTemplate(tmpl, data)
	if err != nil {
		return err
	}

	msg := gomail.NewMessage()
	msg.SetHeader("From", from)
	msg.SetHeader("To", to...)
	msg.SetHeader("Subject", subject)
	msg.SetBody("text/html", body)

	if err := m.dialer.DialAndSend(msg); err != nil {
		return err
	}

	return nil
}
