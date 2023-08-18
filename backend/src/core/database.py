import psycopg2
import psycopg2.extras

from .config import config

db_conn = psycopg2.connect(
    f"""
    host = {config["database"]["host"]}
    port = {config["database"]["port"]}
    dbname = {config["database"]["dbname"]}
    user = {config["database"]["user"]}
    password = {config["database"]["password"]}
    """
)
db_conn.autocommit = True
