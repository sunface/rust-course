package config

import (
	"io/ioutil"
	"log"

	"path/filepath"

	"gopkg.in/yaml.v2"
)

// Config ...
type Config struct {
	Common struct {
		Version  string
		LogLevel string `yaml:"log_level"`
		IsProd   bool   `yaml:"is_prod"`
		AppName  string `yaml:"app_name"`
	}

	User struct {
		SuperAdminUsername string `yaml:"super_admin_username"`
		SuperAdminEmail    string `yaml:"super_admin_email"`
		SessionExpire      int64  `yaml:"session_expire"`
	}

	Server struct {
		Addr    string
		BaseUrl string `yaml:"base_url"`
	}

	UI struct {
		Domain string
	}

	Paths struct {
		Data string
		Logs string
	}

	Posts struct {
		TitleMaxLen    int  `yaml:"title_max_len"`
		BriefMaxLen    int  `yaml:"brief_max_len"`
		WritingEnabled bool `yaml:"writing_enabled"`
	}
}

// Data ...
var Data *Config

// Init ...
func Init(path string) {
	conf := &Config{}
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("read config error :", err)
	}

	err = yaml.Unmarshal(data, &conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}

	Data = conf
}

func makeAbsolute(path string, root string) string {
	if filepath.IsAbs(path) {
		return path
	}
	return filepath.Join(root, path)
}
