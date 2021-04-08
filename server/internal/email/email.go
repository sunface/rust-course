package email

import (
	"fmt"
	"net/smtp"
	"strings"

	"github.com/imdotdev/im.dev/server/pkg/config"
	"github.com/imdotdev/im.dev/server/pkg/log"
	"github.com/jordan-wright/email"
	"github.com/matcornic/hermes/v2"
)

var H *hermes.Hermes

var logger = log.RootLogger.New("logger", "email")

func Init() {
	H = &hermes.Hermes{
		// Optional Theme
		// Theme: new(Default)
		Product: hermes.Product{
			Copyright: "Copyright © 2021 im.dev. All rights reserved.",
			// Appears in header & footer of e-mails
			Name: fmt.Sprintf("%s - The best community for developers", config.Data.Common.AppName),
		},
	}
}

type EmailContent struct {
	To       []string
	Template string
	Subject  string
	Data     map[string]interface{}
}

type EmailMessage struct {
	To      []string
	From    string
	Subject string
	Body    string
}

func Send(msg *EmailMessage) error {
	e := email.NewEmail()

	for _, to := range msg.To {
		e.From = msg.From
		e.To = []string{to}
		e.Subject = msg.Subject
		e.HTML = []byte(msg.Body)

		r := strings.Split(config.Dynamic.SMTP.Addr, ":")
		err := e.Send(config.Dynamic.SMTP.Addr, smtp.PlainAuth("", config.Dynamic.SMTP.AuthUsername, config.Dynamic.SMTP.AuthPassword, r[0]))

		if err != nil {
			return err
		}
	}

	return nil
}
