# Middleware stubs for KubeOptima AI service
from fastapi import Request

async def auth_middleware(request: Request, call_next):
    response = await call_next(request)
    return response

async def rate_limit_middleware(request: Request, call_next):
    response = await call_next(request)
    return response
