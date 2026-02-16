package global

import "database/sql"

var DB *sql.DB
var Sessions = make(map[string]string)
