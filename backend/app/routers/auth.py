from fastapi import APIRouter, Depends

from app.auth import LoginRequest, LoginResponse, AuthStatusResponse, authenticate_credentials, create_token, get_principal, Principal
from app.config import settings
from fastapi import HTTPException

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/status", response_model=AuthStatusResponse)
def auth_status(principal: Principal = Depends(get_principal)):
    return AuthStatusResponse(
        auth_enabled=settings.AUTH_ENABLED,
        demo_bypass=not settings.AUTH_ENABLED,
        authenticated=True,
        email=principal.email,
        role=principal.role,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    principal = authenticate_credentials(payload.email, payload.password)
    if not principal:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_token(principal.email)
    return LoginResponse(
        access_token=token,
        email=principal.email,
        role=principal.role,
        auth_enabled=settings.AUTH_ENABLED,
        demo=principal.demo,
    )
