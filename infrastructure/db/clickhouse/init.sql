-- KubeOptima ClickHouse Schema
-- Stores all time-series metrics, cost data, and ML training data
-- Optimized for high-throughput writes and fast analytical queries

-- ─────────────────────────────────────────────
-- Node Metrics (real-time)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS node_metrics (
    timestamp           DateTime64(3, 'UTC'),
    cluster_id          String,
    node_name           String,
    provider            LowCardinality(String),
    instance_type       LowCardinality(String),
    zone                LowCardinality(String),
    cpu_capacity_millicores     UInt32,
    cpu_requested_millicores    UInt32,
    cpu_used_millicores         UInt32,
    memory_capacity_mib         UInt32,
    memory_requested_mib        UInt32,
    memory_used_mib             UInt32,
    pod_count                   UInt16,
    pod_capacity                UInt16,
    network_in_bytes            UInt64,
    network_out_bytes           UInt64,
    disk_read_bytes             UInt64,
    disk_write_bytes            UInt64,
    gpu_count                   UInt8,
    gpu_used                    UInt8,
    node_condition              LowCardinality(String),  -- Ready, NotReady, etc
    is_spot                     UInt8,
    spot_price_usd              Nullable(Float32)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (cluster_id, node_name, timestamp)
TTL timestamp + INTERVAL 90 DAY;

-- ─────────────────────────────────────────────
-- Pod Metrics (real-time)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pod_metrics (
    timestamp                   DateTime64(3, 'UTC'),
    cluster_id                  String,
    namespace                   LowCardinality(String),
    pod_name                    String,
    workload_name               String,
    workload_kind               LowCardinality(String),
    node_name                   String,
    container_name              LowCardinality(String),
    cpu_request_millicores      UInt32,
    cpu_limit_millicores        UInt32,
    cpu_used_millicores         UInt32,
    cpu_throttle_rate           Float32,
    memory_request_mib          UInt32,
    memory_limit_mib            UInt32,
    memory_used_mib             UInt32,
    memory_working_set_mib      UInt32,
    oom_killed                  UInt8,
    restart_count               UInt16,
    network_in_bytes            UInt64,
    network_out_bytes           UInt64,
    phase                       LowCardinality(String)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMMDD(timestamp)
ORDER BY (cluster_id, namespace, workload_name, pod_name, timestamp)
TTL timestamp + INTERVAL 90 DAY;

-- ─────────────────────────────────────────────
-- Cost Data (hourly)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cost_hourly (
    hour                DateTime,
    cluster_id          String,
    org_id              String,
    provider            LowCardinality(String),
    region              LowCardinality(String),
    cost_component      LowCardinality(String),  -- compute, storage, network, etc
    namespace           Nullable(String),
    workload_name       Nullable(String),
    node_name           Nullable(String),
    instance_type       LowCardinality(String),
    purchasing_option   LowCardinality(String),  -- on-demand, spot, reserved
    cost_usd            Decimal32(6),
    savings_usd         Decimal32(6),            -- savings vs on-demand
    cpu_hours           Float32,
    memory_gib_hours    Float32
)
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(hour)
ORDER BY (org_id, cluster_id, hour, cost_component)
TTL hour + INTERVAL 2 YEAR;

-- ─────────────────────────────────────────────
-- AI Predictions (for audit and retraining)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_predictions (
    timestamp           DateTime64(3, 'UTC'),
    prediction_id       String,
    cluster_id          String,
    model_name          LowCardinality(String),
    model_version       LowCardinality(String),
    prediction_type     LowCardinality(String),
    target_resource     String,
    predicted_value     Float64,
    actual_value        Nullable(Float64),
    confidence          Float32,
    horizon_minutes     UInt32,
    features            String,       -- JSON serialized
    shap_values         String        -- JSON serialized
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (cluster_id, prediction_type, timestamp)
TTL timestamp + INTERVAL 1 YEAR;

-- ─────────────────────────────────────────────
-- Spot Interruption History (for ML training)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spot_interruptions (
    timestamp           DateTime,
    region              LowCardinality(String),
    az                  LowCardinality(String),
    instance_type       LowCardinality(String),
    interrupted         UInt8,
    spot_price_usd      Float32,
    on_demand_price_usd Float32,
    capacity_pool_size  Nullable(UInt32)
)
ENGINE = MergeTree()
PARTITION BY toYYYYMM(timestamp)
ORDER BY (region, az, instance_type, timestamp)
TTL timestamp + INTERVAL 2 YEAR;

-- ─────────────────────────────────────────────
-- Materialised Views for fast queries
-- ─────────────────────────────────────────────

-- Daily cost summary per cluster
CREATE MATERIALIZED VIEW IF NOT EXISTS cost_daily_mv
ENGINE = SummingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (org_id, cluster_id, day, cost_component)
AS SELECT
    toDate(hour) AS day,
    org_id,
    cluster_id,
    cost_component,
    provider,
    sum(cost_usd) AS cost_usd,
    sum(savings_usd) AS savings_usd
FROM cost_hourly
GROUP BY day, org_id, cluster_id, cost_component, provider;

-- P95/P99 CPU by workload (last 30 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS workload_cpu_percentiles_mv
ENGINE = AggregatingMergeTree()
PARTITION BY toYYYYMM(day)
ORDER BY (cluster_id, namespace, workload_name, day)
AS SELECT
    toDate(timestamp) AS day,
    cluster_id,
    namespace,
    workload_name,
    quantileState(0.95)(cpu_used_millicores) AS cpu_p95_state,
    quantileState(0.99)(cpu_used_millicores) AS cpu_p99_state,
    quantileState(0.95)(memory_used_mib) AS mem_p95_state,
    quantileState(0.99)(memory_used_mib) AS mem_p99_state,
    maxState(cpu_used_millicores) AS cpu_max_state,
    maxState(memory_used_mib) AS mem_max_state,
    sumState(oom_killed) AS oom_kills_state,
    maxState(restart_count) AS restart_count_state
FROM pod_metrics
GROUP BY day, cluster_id, namespace, workload_name;
