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
	}

	Server struct {
		Addr string
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
