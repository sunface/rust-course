package misc

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

// Config for dashboardå
type Config struct {
	Version    string `yaml:"version"`
	LogLevel   string `yaml:"log_level"`
	ListenAddr string `yaml:"listen_addr"`
	CQL        struct {
		Cluster       []string `yaml:"cluster"`
		ConnectionNum int      `yaml:"connection_num"`
		Keyspace      string
	}
}

// InitConf init the config for dashboard
func InitConf(p string) {
	conf := &Config{}
	data, err := ioutil.ReadFile(p)
	if err != nil {
		log.Fatal("load config from file error,", err)
	}

	err = yaml.Unmarshal(data, &conf)
	if err != nil {
		log.Fatal("decode config error,", err)
	}

	Conf = conf
}
