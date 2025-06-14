import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "app.db"
conn = sqlite3.connect(str(db_path))
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = [row[0] for row in cursor.fetchall()]
print("Existing tables:", tables)

if 'tech_invites' in tables:
    cursor.execute("PRAGMA table_info(tech_invites)")
    columns = cursor.fetchall()
    print("tech_invites columns:", [col[1] for col in columns])

conn.close()
