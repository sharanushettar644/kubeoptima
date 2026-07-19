# Multi-stage Dockerfile — Go API Gateway
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates git

COPY . .
RUN go mod tidy
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" \
    -o /bin/api-gateway ./cmd/server/main.go

# Final minimal image
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /bin/api-gateway /api-gateway
EXPOSE 9090 9091
ENTRYPOINT ["/api-gateway"]
