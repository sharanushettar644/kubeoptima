-- KubeOptima PostgreSQL Schema
-- Stores configuration, tenants, policies, recommendations, audit log

-- ─────────────────────────────────────────────
-- Organizations / Tenants
-- ─────────────────────────────────────────────
CREATE TABLE organizations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings    JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    oidc_subject    TEXT,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ─────────────────────────────────────────────
-- Clusters
-- ─────────────────────────────────────────────
CREATE TABLE clusters (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    provider        TEXT NOT NULL CHECK (provider IN ('aws', 'azure', 'gcp', 'on-prem')),
    region          TEXT NOT NULL,
    k8s_version     TEXT,
    node_count      INTEGER DEFAULT 0,
    status          TEXT NOT NULL DEFAULT 'connecting' CHECK (status IN ('connecting', 'connected', 'disconnected', 'error')),
    agent_version   TEXT,
    kubeconfig_ref  TEXT,  -- reference to external secrets
    metadata        JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at    TIMESTAMPTZ,
    UNIQUE(org_id, name)
);

CREATE INDEX idx_clusters_org_id ON clusters(org_id);

-- ─────────────────────────────────────────────
-- Optimization Policies
-- ─────────────────────────────────────────────
CREATE TABLE optimization_policies (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id      UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    mode            TEXT NOT NULL DEFAULT 'observe' CHECK (mode IN ('autonomous', 'approval', 'observe')),
    spec            JSONB NOT NULL DEFAULT '{}',  -- full policy spec
    enabled         BOOLEAN NOT NULL DEFAULT true,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(cluster_id, name)
);

-- ─────────────────────────────────────────────
-- AI Recommendations
-- ─────────────────────────────────────────────
CREATE TABLE recommendations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id          UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    policy_id           UUID REFERENCES optimization_policies(id),
    type                TEXT NOT NULL CHECK (type IN (
                            'rightsizing_pod', 'rightsizing_node', 'spot_migration',
                            'bin_packing', 'predictive_scale', 'live_migration',
                            'failure_prevention', 'cost_optimization'
                        )),
    namespace           TEXT,
    workload_name       TEXT,
    workload_kind       TEXT,
    node_name           TEXT,
    title               TEXT NOT NULL,
    description         TEXT,
    impact              TEXT NOT NULL CHECK (impact IN ('critical', 'high', 'medium', 'low')),
    confidence          FLOAT NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    risk_level          TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    estimated_saving_usd DECIMAL(10,2),
    before_spec         JSONB,   -- current state
    after_spec          JSONB,   -- recommended state
    explanation         TEXT,
    shap_values         JSONB,
    rollback_strategy   TEXT,
    status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                            'pending', 'approved', 'applying', 'applied',
                            'rolled_back', 'failed', 'dismissed', 'expired'
                        )),
    applied_at          TIMESTAMPTZ,
    applied_by          UUID REFERENCES users(id),
    rolled_back_at      TIMESTAMPTZ,
    rollback_reason     TEXT,
    expires_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recs_cluster_id ON recommendations(cluster_id);
CREATE INDEX idx_recs_status ON recommendations(status);
CREATE INDEX idx_recs_type ON recommendations(type);
CREATE INDEX idx_recs_created_at ON recommendations(created_at DESC);

-- ─────────────────────────────────────────────
-- Migration Jobs
-- ─────────────────────────────────────────────
CREATE TABLE migration_jobs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cluster_id              UUID NOT NULL REFERENCES clusters(id) ON DELETE CASCADE,
    recommendation_id       UUID REFERENCES recommendations(id),
    pod_name                TEXT NOT NULL,
    pod_namespace           TEXT NOT NULL,
    source_node             TEXT NOT NULL,
    target_node             TEXT NOT NULL,
    method                  TEXT NOT NULL CHECK (method IN ('criu', 'rolling', 'drain')),
    status                  TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
                                'pending', 'pre_dump', 'checkpoint', 'transfer',
                                'restore', 'validating', 'completed', 'failed', 'cancelled'
                            )),
    progress_percent        INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
    preserved_tcp_sessions  INTEGER DEFAULT 0,
    checkpoint_path         TEXT,
    error_message           TEXT,
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- Audit Log
-- ─────────────────────────────────────────────
CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    org_id          UUID NOT NULL,
    cluster_id      UUID,
    user_id         UUID REFERENCES users(id),
    action          TEXT NOT NULL,  -- e.g. "recommendation.applied", "policy.created"
    resource_type   TEXT,
    resource_id     TEXT,
    details         JSONB NOT NULL DEFAULT '{}',
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE audit_log_2026_07 PARTITION OF audit_log
    FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE audit_log_2026_08 PARTITION OF audit_log
    FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE INDEX idx_audit_org_id ON audit_log(org_id);
CREATE INDEX idx_audit_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_action ON audit_log(action);
