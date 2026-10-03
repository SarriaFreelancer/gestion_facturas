import os
import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from backend.config.settings import JWT_SECRET, JWT_ALGORITHM

def hash_password(password: str) -> str:
    """Hashea una contraseña utilizando bcrypt con salt seguro."""
    if not password:
        password = "123"
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, stored_hash: str) -> bool:
    """
    Verifica si una contraseña en texto plano coincide con el hash bcrypt.
    Soporta fallback transparente para contraseñas en texto plano heredadas.
    """
    if not stored_hash or not plain_password:
        return False
    try:
        # Si es un hash bcrypt válido (inicia con $2a$, $2b$ o $2y$)
        if stored_hash.startswith("$2a$") or stored_hash.startswith("$2b$") or stored_hash.startswith("$2y$"):
            return bcrypt.checkpw(plain_password.encode("utf-8"), stored_hash.encode("utf-8"))
        # Fallback para texto plano antiguo durante migración
        return plain_password == stored_hash
    except Exception:
        return plain_password == stored_hash

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Genera un token JWT firmado con fecha de expiración."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7) # 7 días de sesión
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodifica y valida la firma y expiración de un token JWT."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception:
        return None

def is_safe_path(base_dir: str, path: str, follow_symlinks: bool = True) -> bool:
    """
    Protección contra Path Traversal:
    Verifica si la ruta solicitada reside estrictamente dentro del directorio base.
    """
    if follow_symlinks:
        matchpath = os.path.realpath(path)
        base_dir = os.path.realpath(base_dir)
    else:
        matchpath = os.path.abspath(path)
        base_dir = os.path.abspath(base_dir)
    return os.path.commonpath([base_dir, matchpath]) == base_dir
