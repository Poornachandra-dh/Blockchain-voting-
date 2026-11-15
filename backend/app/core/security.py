import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt
from app.core.config import settings

ALGORITHM = "HS256"
PBKDF2_ITERATIONS = 100_000


def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_password_hash(password: str) -> str:
    """NIST SP 800-63-3 compliant PBKDF2-SHA256 password hashing."""
    salt = secrets.token_hex(16)
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        PBKDF2_ITERATIONS
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${key.hex()}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the stored PBKDF2 hash using constant-time comparison."""
    try:
        parts = hashed_password.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        expected_key = parts[3]
        
        computed_key = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations
        ).hex()
        return hmac.compare_digest(expected_key, computed_key)
    except Exception:
        return False


def generate_secure_salt(length: int = 32) -> str:
    return secrets.token_hex(length)


def constant_time_compare(val1: str, val2: str) -> bool:
    return hmac.compare_digest(val1.encode(), val2.encode())
