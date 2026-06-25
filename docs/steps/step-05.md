# Step 5 — PostgreSQL connection

**Week 1 — Products** · Prev: [Step 4](step-04.md) · Next: [Step 6](step-06.md)

## Goal

Connect to Postgres and ping on startup.

## Commands

```bash
go get github.com/jackc/pgx/v5/stdlib
```


## Code

### `backend/internal/database/postgres.go`

```go
package database

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"
)

func Connect(databaseURL string) (*sql.DB, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("open db: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(30 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping db: %w", err)
	}

	return db, nil
}
```

## Notes

In main.go: load config, connect db, defer db.Close()

## Verify

API starts without database ping error.
