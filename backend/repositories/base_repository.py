import pymysql
from contextlib import contextmanager
from dbutils.pooled_db import PooledDB
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# Pool de conexiones MySQL de alto rendimiento y bajo consumo
_pool = PooledDB(
    creator=pymysql,
    maxconnections=25,
    mincached=3,
    maxcached=10,
    maxshared=0,
    blocking=True,
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
    cursorclass=pymysql.cursors.DictCursor,
    autocommit=True
)

class BaseRepository:
    """Clase base de repositorio con gestión de pool de conexiones y transacciones seguras."""

    @staticmethod
    def get_connection():
        """Obtiene una conexión activa desde el pool optimizado."""
        return _pool.connection()

    @staticmethod
    @contextmanager
    def get_transaction():
        """Context Manager para transacciones ACID seguras (commit/rollback automático)."""
        conn = _pool.connection()
        conn.autocommit(False)
        try:
            with conn.cursor() as cursor:
                yield conn, cursor
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            conn.autocommit(True)
            conn.close()
