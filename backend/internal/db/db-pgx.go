//go:build !debug
// +build !debug

package db

import (
	"embed"
	"io/fs"
	"log"

	"github.com/akramboussanni/treenode/internal/applog"
	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/iofs"
	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/jmoiron/sqlx"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

var DB *sqlx.DB

func Init(dsn string) {
	applog.Info("using pgx db")

	var err error
	DB, err = sqlx.Open("pgx", dsn)
	if err != nil {
		log.Fatalf("cannot open database: %v", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatalf("cannot ping database: %v", err)
	}
}

func RunMigrations() {
	driver, err := postgres.WithInstance(DB.DB, &postgres.Config{})
	if err != nil {
		log.Fatalf("failed to create postgres driver: %v", err)
	}

	migrationsSub, err := fs.Sub(migrationsFS, "migrations")
	if err != nil {
		log.Fatalf("failed to get migrations subdir: %v", err)
	}

	d, err := iofs.New(migrationsSub, ".")
	if err != nil {
		log.Fatalf("failed to create iofs driver: %v", err)
	}

	m, err := migrate.NewWithInstance("iofs", d, "postgres", driver)
	if err != nil {
		log.Fatalf("failed to create migrate instance: %v", err)
	}

	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("failed to run migrations: %v", err)
	}

	log.Println("postgres migrations applied successfully")
}
