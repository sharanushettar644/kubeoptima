module kubeoptima/api-gateway

go 1.22

require (
	github.com/gofiber/fiber/v2 v2.52.5
	github.com/coreos/go-oidc/v3 v3.10.0
	golang.org/x/oauth2 v0.21.0
	github.com/golang-jwt/jwt/v5 v5.2.1
	github.com/redis/go-redis/v9 v9.5.3
	github.com/jackc/pgx/v5 v5.6.0
	github.com/ClickHouse/clickhouse-go/v2 v2.25.0
	go.opentelemetry.io/otel v1.27.0
	go.opentelemetry.io/otel/trace v1.27.0
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.27.0
	go.uber.org/zap v1.27.0
	github.com/prometheus/client_golang v1.19.1
	k8s.io/client-go v0.30.2
	k8s.io/apimachinery v0.30.2
)
