package api

import (
	"net/http"
	"testing"
	"time"

	"github.com/mafanr/g"

	"github.com/stretchr/testify/assert"
)

func TestTfeStartStop(t *testing.T) {
	p := &Proxy{}
	g.InitConfig("../tfe.conf")
	g.InitLogger()

	go func() {
		p.Start()
	}()

	time.Sleep(2 * time.Second)

	resp, err := http.Get("http://localhost:" + g.Conf.Common.Port + "/service/api?service_id=" + g.TEST_API_NAME)
	assert.NoError(t, err)
	assert.Equal(t, 200, resp.StatusCode)

	p.Shutdown()
}
