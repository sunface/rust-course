package api

import (
	"sync"
	"testing"

	"github.com/mafanr/juz/g"

	"github.com/stretchr/testify/assert"
)

func TestLoadRow(t *testing.T) {
	g.InitConfig("../tfe.conf")
	g.InitLogger()

	g.InitMysql()

	p := &Proxy{}
	p.apis = &sync.Map{}
	p.loadAPIRow(g.TEST_API_NAME)
	_, ok := p.apis.Load(g.TEST_API_NAME)
	assert.True(t, ok)
}

func TestLoadAll(t *testing.T) {
	g.InitConfig("../tfe.conf")
	g.InitLogger()

	g.InitMysql()

	p := &Proxy{}
	p.apis = &sync.Map{}
	p.loadAllAPIs()

	_, ok := p.apis.Load(g.TEST_API_NAME)
	assert.True(t, ok)
}
