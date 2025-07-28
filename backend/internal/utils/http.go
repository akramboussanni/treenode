package utils

import (
	"net"
	"net/http"
	"strings"

	"github.com/akramboussanni/treenode/config"
)

func GetClientIP(r *http.Request) string {
	if config.App.TrustIpHeaders {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			if ip := strings.Split(xff, ",")[0]; ip != "" {
				return strings.TrimSpace(ip)
			}
		}

		if ip := r.Header.Get("X-Real-IP"); ip != "" {
			return ip
		}
	}

	ip, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return ip
}
