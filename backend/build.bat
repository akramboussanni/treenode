@echo off
REM Build Go backend for Linux (amd64)
set GOOS=linux
set GOARCH=amd64
go build -tags=debug cmd/server/main.go
set GOOS=
set GOARCH=
echo Build complete: backend/main (Linux amd64)