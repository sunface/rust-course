package misc

import "github.com/gocql/gocql"

// CQL is the cql session for access cassandra
var CQL *gocql.Session

const (
	//CQLNotFound  when acess cql, get the not found result
	CQLNotFound = "not found"
)
