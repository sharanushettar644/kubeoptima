# Multi-stage Dockerfile — Go Kubernetes Operator
FROM golang:1.22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache ca-certificates git

COPY go.mod go.sum* ./
RUN go mod tidy

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-w -s" \
    -o /bin/k8s-operator ./cmd/operator/main.go

# Final minimal image
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /bin/k8s-operator /k8s-operator
ENTRYPOINT ["/k8s-operator"]
