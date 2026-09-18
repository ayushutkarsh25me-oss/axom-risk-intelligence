"""Optional HMAC session tokens. Disabled unless AUTH_ENABLED=true."""

from __future__ import annotations

import hashlib
import hmac
import time
from dataclasses import dataclass
from typing import Optional

from fastapi import Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.config import settings


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=128)
    password: str = Field(..., min_length=4, max_length=128)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str
    role: str
    auth_enabled: bool
    demo: bool


class AuthStatusResponse(BaseModel):
    auth_enabled: bool
    demo_bypass: bool
    authenticated: bool
    email: Optional[str] = None
    role: str = "operator"


@dataclass
class Principal:
    email: str
    role: str
    demo: bool


def _sign(payload: str) -> str:
    return hmac.new(
        settings.AUTH_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def create_token(email: str, ttl_seconds: int = 86400) -> str:
    expiry = int(time.time()) + ttl_seconds
    payload = f"{email}:{expiry}"
    return f"{payload}:{_sign(payload)}"


def parse_token(token: str) -> Optional[str]:
    try:
        email, expiry_s, signature = token.rsplit(":", 2)
        payload = f"{email}:{expiry_s}"
        if not hmac.compare_digest(signature, _sign(payload)):
            return None
        if int(expiry_s) < int(time.time()):
            return None
        return email
    except (ValueError, TypeError):
        return None


def authenticate_credentials(email: str, password: str) -> Optional[Principal]:
    if (
        email.strip().lower() == settings.DEMO_ADMIN_EMAIL.strip().lower()
        and hmac.compare_digest(password, settings.DEMO_ADMIN_PASSWORD)
    ):
        return Principal(email=settings.DEMO_ADMIN_EMAIL, role="operator", demo=True)
    return None


def get_principal(
    authorization: Optional[str] = Header(default=None),
) -> Principal:
    """
    Demo (AUTH_ENABLED=false): always returns a demo operator.
    Production (AUTH_ENABLED=true): requires a valid Bearer token.
    """
    if not settings.AUTH_ENABLED:
        if authorization and authorization.lower().startswith("bearer "):
            email = parse_token(authorization.split(" ", 1)[1].strip())
            if email:
                return Principal(email=email, role="operator", demo=True)
        return Principal(email="demo@axom.local", role="operator", demo=True)

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    email = parse_token(authorization.split(" ", 1)[1].strip())
    if not email:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")
    return Principal(email=email, role="operator", demo=False)


def require_auth(principal: Principal = Depends(get_principal)) -> Principal:
    return principal
