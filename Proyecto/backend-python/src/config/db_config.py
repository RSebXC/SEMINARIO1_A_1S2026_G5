import pymysql, os
from dotenv import load_dotenv
load_dotenv()
def get_connection():
    try:
        return pymysql.connect(host=os.getenv("DB_HOST"), port=int(os.getenv("DB_PORT",3306)),
            database=os.getenv("DB_NAME"), user=os.getenv("DB_USER"), password=os.getenv("DB_PASSWORD"),
            cursorclass=pymysql.cursors.DictCursor, connect_timeout=5)
    except Exception as e:
        print(f"⚠️  RDS: {e}"); return None
