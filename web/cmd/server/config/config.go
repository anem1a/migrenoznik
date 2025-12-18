package config

// DBConfig хранит параметры подключения к базе данных
type DBConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
}

// GetDBConfig возвращает текущие параметры БД
func GetDBConfig() DBConfig {
	return DBConfig{
		Host:     "oferolefket.beget.app",
		Port:     5432,
		User:     "anna",
		Password: "a06q*ZtF*JXN",
		DBName:   "migrenoznik",
	}
}
