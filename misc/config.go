//  Copyright © 2018 Sunface <CTO@188.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package misc

import (
	"io/ioutil"
	"log"

	"gopkg.in/yaml.v2"
)

type Config struct {
	Common struct {
		Version    string
		LogLevel   string
		AdminToken string
	}
	Api struct {
		Port     string
		ServerID int64
	}
	Manage struct {
		Port string
	}
	Mysql struct {
		Addr     string
		Port     string
		Database string
		Acc      string
		Pw       string
	}
	Etcd struct {
		Addrs []string
	}

	Traffic struct {
		Host string
		Port string
	}
}

var Conf *Config

func InitConfig(path string) {
	conf := &Config{}
	data, err := ioutil.ReadFile(path)
	if err != nil {
		log.Fatal("read config error :", err)
	}

	err = yaml.Unmarshal(data, &conf)
	if err != nil {
		log.Fatal("yaml decode error :", err)
	}

	Conf = conf
}
