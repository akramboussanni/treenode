// @title treenode API
// @version 1.0.0
// @description A secure, fast, and feature-rich Go-Chi backend with JWT authentication, email verification, and password management. Built with modern Go practices and comprehensive security features.
// @termsOfService https://github.com/akramboussanni/treenode/blob/main/LICENSE

// @contact.name API Support
// @contact.url https://github.com/akramboussanni/treenode/issues
// @contact.email support@example.com

// @license.name MIT License
// @license.url https://github.com/akramboussanni/treenode/blob/main/LICENSE

// @host localhost:9520
// @BasePath /
// @schemes http https

// @securityDefinitions.apikey CookieAuth
// @in cookie
// @name session
// @description JWT session cookie for authenticated endpoints. Automatically set by login endpoint. Required for endpoints marked with @Security CookieAuth.

// @securityDefinitions.apikey RecaptchaToken
// @in header
// @name X-Recaptcha-Token
// @description reCAPTCHA verification token for bot protection. Optional - only required if reCAPTCHA is configured in environment variables. Obtain from reCAPTCHA widget.

// @tag.name Authentication
// @tag.description User registration, login, and token management endpoints. reCAPTCHA verification is optional if configured.

// @tag.name Account
// @tag.description User profile and account management endpoints. All endpoints require session cookie authentication.

// @tag.name Email Verification
// @tag.description Email confirmation and verification endpoints. reCAPTCHA verification is optional if configured.

// @tag.name Password Management
// @tag.description Password reset, change, and recovery endpoints. Public endpoints have optional reCAPTCHA, authenticated endpoints require session cookie.

package main

import (
	"context"
	"crypto/tls"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"github.com/akramboussanni/treenode/config"
	"github.com/akramboussanni/treenode/internal/api/routes"
	"github.com/akramboussanni/treenode/internal/db"
	"github.com/akramboussanni/treenode/internal/repo"
	"github.com/akramboussanni/treenode/internal/utils"
)

func main() {
	config.Init()

	err := utils.InitSnowflake(1)
	if err != nil {
		panic(err)
	}

	db.Init(config.App.DbConnectionString)
	db.RunMigrations()

	repos := repo.NewRepos(db.DB)
	r := routes.SetupRouter(repos)

	port := strconv.Itoa(config.App.AppPort)
	server := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	if config.App.TLSEnabled {
		if config.App.TLSCertFile == "" || config.App.TLSKeyFile == "" {
			log.Fatal("TLS_ENABLED is true but TLS_CERT_FILE or TLS_KEY_FILE is not set")
		}

		server.TLSConfig = &tls.Config{
			MinVersion:               tls.VersionTLS12,
			PreferServerCipherSuites: true,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			},
		}
	}

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		<-quit
		log.Println("shutting down server...")
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := server.Shutdown(ctx); err != nil {
			log.Fatalf("server forced to shutdown: %v", err)
		}
		log.Println("server exited gracefully")
	}()

	protocol := "http"
	if config.App.TLSEnabled {
		protocol = "https"
	}

	log.Printf("server will run @ %s://localhost:%s", protocol, port)

	if config.App.TLSEnabled {
		if err := server.ListenAndServeTLS(config.App.TLSCertFile, config.App.TLSKeyFile); err != nil && err != http.ErrServerClosed {
			log.Fatalf("error when starting TLS server: %v", err)
		}
	} else {
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("error when starting server: %v", err)
		}
	}
}
