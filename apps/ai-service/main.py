"""
KubeOptima AI Service — FastAPI ML Inference Server

Serves predictions for:
  - Resource forecasting (CPU, Memory, Storage, Network)
  - Cost prediction
  - Anomaly detection
  - Failure prediction
  - Spot interruption prediction
  - Rightsizing recommendations

Models:
  - LSTM (PyTorch) — time series forecasting
  - Prophet — seasonal decomposition
  - XGBoost — tabular predictions
  - Transformer (custom) — multi-variate time series
  - Isolation Forest — anomaly detection
  - LSTM Autoencoder — anomaly detection
"""

from __future__ import annotations

import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional

import numpy as np
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
import uvicorn

from app.config import settings
from app.models import model_registry
from app.routers import (
    forecast_router,
    rightsizing_router,
    cost_router,
    anomaly_router,
    failure_router,
    spot_router,
    recommendations_router,
)
from app.middleware import auth_middleware, rate_limit_middleware

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all ML models at startup."""
    logger.info("🤖 KubeOptima AI Service starting — loading models...")
    start = time.time()

    await model_registry.load_all()

    elapsed = time.time() - start
    logger.info(f"✅ All models loaded in {elapsed:.2f}s")

    yield

    logger.info("AI Service shutting down — releasing model memory...")
    await model_registry.unload_all()


app = FastAPI(
    title="KubeOptima AI Service",
    description="""
    Enterprise AI inference service for Kubernetes cost optimization.

    Provides ML-powered predictions for resource rightsizing, cost forecasting,
    anomaly detection, failure prediction, and spot interruption risk.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routers
app.include_router(forecast_router, prefix="/api/v1/forecast", tags=["Forecasting"])
app.include_router(rightsizing_router, prefix="/api/v1/rightsizing", tags=["Rightsizing"])
app.include_router(cost_router, prefix="/api/v1/cost", tags=["Cost Prediction"])
app.include_router(anomaly_router, prefix="/api/v1/anomaly", tags=["Anomaly Detection"])
app.include_router(failure_router, prefix="/api/v1/failure", tags=["Failure Prediction"])
app.include_router(spot_router, prefix="/api/v1/spot", tags=["Spot Optimizer"])
app.include_router(recommendations_router, prefix="/api/v1/recommendations", tags=["Recommendations"])


@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "running",
        "service": "KubeOptima AI Service",
        "version": "1.0.0",
        "health": "/healthz",
        "docs": "/docs"
    }


@app.get("/healthz", tags=["Health"])
async def healthz():
    return {"status": "ok", "models_loaded": model_registry.loaded_count, "time": time.time()}


@app.get("/readyz", tags=["Health"])
async def readyz():
    if not model_registry.all_loaded:
        raise HTTPException(status_code=503, detail="Models not yet loaded")
    return {"status": "ready"}


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        workers=int(os.getenv("WORKERS", "4")),
        loop="uvloop",
        http="httptools",
        log_level="info",
        access_log=True,
    )
