import sqlite3

conn = sqlite3.connect('backend/app.db')
cursor = conn.cursor()

# Get companies table schema
cursor.execute("PRAGMA table_info(companies)")
companies_columns = cursor.fetchall()
print('Companies table columns:')
for col in companies_columns:
    print(f'  {col[1]} ({col[2]}) - NotNull: {col[3]}, Default: {col[4]}')

print()

# Get users table schema
cursor.execute("PRAGMA table_info(users)")
users_columns = cursor.fetchall()
print('Users table columns:')
for col in users_columns:
    print(f'  {col[1]} ({col[2]}) - NotNull: {col[3]}, Default: {col[4]}')

conn.close()
