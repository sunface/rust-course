package email

import (
	"fmt"
	"html/template"
	"net/smtp"
	"strings"

	"github.com/jordan-wright/email"
)

var MailTemplates *template.Template

func init() {
	MailTemplates = template.New("im.dev")
	tmpl, err := template.ParseGlob("./server/internal/email/templates/*.tmpl")
	if err != nil {
		panic(err)
	}

	MailTemplates = tmpl
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

		fmt.Println(e.To)
		r := strings.Split(to, "@")
		s := fmt.Sprintf("smtp.%s:25", r[1])
		fmt.Println("smtp:", s)
		err := e.Send(s, smtp.PlainAuth("", "61087682@qq.com", "nybusxktxfyycahh", "smtp.qq.com"))

		if err != nil {
			return err
		}
	}

	return nil
}
