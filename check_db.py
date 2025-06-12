import sqlite3

conn = sqlite3.connect('backend/app.db')
cursor = conn.cursor()

# Check tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print('Tables in database:')
for table in tables:
    print(f'  {table[0]}')

# Check if users table exists and get some data
try:
    cursor.execute('SELECT email, role, company_id FROM users LIMIT 5')
    users = cursor.fetchall()
    print('\nUsers in database:')
    for user in users:
        print(f'  Email: {user[0]}, Role: {user[1]}, Company ID: {user[2]}')
except Exception as e:
    print(f'\nError accessing users table: {e}')

# Check companies table
try:
    cursor.execute('SELECT id, name FROM companies LIMIT 5')
    companies = cursor.fetchall()
    print('\nCompanies in database:')
    for company in companies:
        print(f'  ID: {company[0]}, Name: {company[1]}')
except Exception as e:
    print(f'\nError accessing companies table: {e}')

conn.close()
