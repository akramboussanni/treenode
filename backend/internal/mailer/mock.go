package mailer

import "github.com/akramboussanni/treenode/internal/applog"

type MockMailer struct {
	config     MailerConfig
	sentEmails []MockEmail
}

type MockEmail struct {
	From     string
	To       []string
	Subject  string
	Body     string
	Template string
	Data     any
}

func (m *MockMailer) Init(config MailerConfig) error {
	m.config = config
	m.sentEmails = make([]MockEmail, 0)
	return nil
}

func (m *MockMailer) Send(tmpl, from string, to []string, subject string, data any) error {
	renderedBody, err := LoadTemplate(tmpl, data)
	if err != nil {
		return err
	}

	mockEmail := MockEmail{
		From:     from,
		To:       to,
		Subject:  subject,
		Body:     renderedBody,
		Template: tmpl,
		Data:     data,
	}
	m.sentEmails = append(m.sentEmails, mockEmail)

	applog.Info("MockMailer: sent email", "from", from, "to", to, "subject", subject, "template", tmpl, "data", data)
	return nil
}

func (m *MockMailer) GetSentEmails() []MockEmail {
	return m.sentEmails
}

func (m *MockMailer) ClearSentEmails() {
	m.sentEmails = make([]MockEmail, 0)
}

func (m *MockMailer) GetLastSentEmail() *MockEmail {
	if len(m.sentEmails) == 0 {
		return nil
	}
	return &m.sentEmails[len(m.sentEmails)-1]
}
