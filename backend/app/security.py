from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import jwt


# CONFIGURATION



SECRET_KEY = "CHANGE_ME_TO_A_VERY_LONG_RANDOM_SECRET_KEY_123456789"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60



# PASSWORD HASHING


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)

def hash_password(password: str) -> str:
    """
    Hash un mot de passe en utilisant bcrypt
    """
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """
    Vérifie un mot de passe par rapport à son hash
    """
    return pwd_context.verify(password, password_hash)


# JWT


def create_access_token(subject: str, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES) -> str:
    """
    Crée un token JWT avec :
    - sub : user_id
    - exp : expiration
    """
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)

    payload = {
        "sub": subject,
        "exp": expire
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
