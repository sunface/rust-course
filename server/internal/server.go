package internal

import "github.com/imdotdev/im.dev/server/pkg/log"

type Server struct {
}

// New ...
func New() *Server {
	return &Server{}
}

var logger = log.RootLogger.New("logger", "server")

// Start ...1=
func (s *Server) Start() error {
	return nil
}

// Close ...
func (s *Server) Close() error {
	return nil
}
