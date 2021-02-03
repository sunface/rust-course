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
	}

	User struct {
		SuperAdminUsername string `yaml:"super_admin_username"`
		SessionExpire      int64  `yaml:"session_expire"`
	}

	Server struct {
		Addr    string
		BaseUrl string `yaml:"base_url"`
	}

	Paths struct {
		Data string
		Logs string
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
