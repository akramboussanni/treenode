package mailer

import (
	"github.com/resend/resend-go/v2"
)

type ResendMailer struct {
	config       MailerConfig
	resendClient *resend.Client
}

func (m *ResendMailer) Init(config MailerConfig) error {
	m.config = config
	m.resendClient = resend.NewClient(config.APIKey)
	return nil
}

func (m *ResendMailer) Send(tmpl, from string, to []string, subject string, data any) error {
	body, err := LoadTemplate(tmpl, data)
	if err != nil {
		return err
	}

	params := &resend.SendEmailRequest{
		From:    from,
		To:      to,
		Html:    body,
		Subject: subject,
	}

	_, err = m.resendClient.Emails.Send(params)
	if err != nil {
		return err
	}

	return nil
}
