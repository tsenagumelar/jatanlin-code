package api

import (
	"context"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type claimsContextKey struct{}

func (s *Server) withAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		header := r.Header.Get("Authorization")
		tokenString := strings.TrimSpace(strings.TrimPrefix(header, "Bearer "))
		if tokenString == "" || tokenString == header {
			writeError(w, http.StatusUnauthorized, "missing bearer token")
			return
		}

		token, err := s.Auth.ValidateToken(tokenString)
		if err != nil || !token.Valid {
			writeError(w, http.StatusUnauthorized, "invalid token")
			return
		}

		claims, _ := token.Claims.(jwt.MapClaims)
		ctx := context.WithValue(r.Context(), claimsContextKey{}, map[string]any(claims))
		next(w, r.WithContext(ctx))
	}
}

func (s *Server) withSiteSyncAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := strings.TrimSpace(r.Header.Get("X-Site-Sync-Key"))
		if key == "" || key != s.Config.SiteSyncKey {
			writeError(w, http.StatusUnauthorized, "invalid site sync key")
			return
		}
		next(w, r)
	}
}

func (s *Server) withCORS(next http.Handler) http.Handler {
	allowed := map[string]bool{}
	for _, origin := range s.Config.CORSOrigins {
		allowed[origin] = true
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if allowed[origin] {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}
		w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Site-Sync-Key")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
