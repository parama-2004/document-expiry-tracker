import mysql.connector
from mysql.connector import Error
import os
from datetime import datetime, timedelta
import jwt
from werkzeug.security import generate_password_hash, check_password_hash

# Replace hardcoded secrets with environment variables in production
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': 'Parama@1195#',  # ⚠️ Keep secure in production
    'database': 'nlc_intern'
}

SECRET_KEY = "12345"

def create_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

def initialize_database():
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS login_attempts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    ip_address VARCHAR(45),
                    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    successful BOOLEAN,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS password_history (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    password_hash VARCHAR(255) NOT NULL,
                    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            """)
            connection.commit()
            print("Database initialized successfully")
        except Error as e:
            print(f"Error initializing database: {e}")
        finally:
            cursor.close()
            connection.close()

def create_user(username, password_plain):
    password_hash = generate_password_hash(password_plain)
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s)",
                (username, password_hash)
            )
            connection.commit()
            return cursor.lastrowid
        except Error as e:
            print(f"Error creating user: {e}")
            return None
        finally:
            cursor.close()
            connection.close()
    return None

def get_user_by_username(username):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
            return cursor.fetchone()
        except Error as e:
            print(f"Error fetching user: {e}")
            return None
        finally:
            cursor.close()
            connection.close()
    return None

def get_user_by_id(user_id):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cursor.fetchone()
        except Error as e:
            print(f"Error fetching user by ID: {e}")
            return None
        finally:
            cursor.close()
            connection.close()
    return None

def update_user_password(user_id, new_password_plain):
    new_password_hash = generate_password_hash(new_password_plain)
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(
                "UPDATE users SET password_hash = %s WHERE id = %s",
                (new_password_hash, user_id)
            )
            cursor.execute(
                "INSERT INTO password_history (user_id, password_hash) VALUES (%s, %s)",
                (user_id, new_password_hash)
            )
            connection.commit()
            return True
        except Error as e:
            print(f"Error updating password: {e}")
            return False
        finally:
            cursor.close()
            connection.close()
    return False

def record_login_attempt(user_id, ip_address, successful):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute(
                "INSERT INTO login_attempts (user_id, ip_address, successful) VALUES (%s, %s, %s)",
                (user_id, ip_address, successful)
            )
            connection.commit()
        except Error as e:
            print(f"Error recording login attempt: {e}")
        finally:
            cursor.close()
            connection.close()

def get_login_attempts_count(username, ip_address, hours=24):
    connection = create_connection()
    if connection:
        try:
            cursor = connection.cursor()
            query = """
                SELECT COUNT(*) FROM login_attempts 
                WHERE (user_id = (SELECT id FROM users WHERE username = %s) OR ip_address = %s)
                AND attempt_time > DATE_SUB(NOW(), INTERVAL %s HOUR)
                AND successful = 0
            """
            cursor.execute(query, (username, ip_address, hours))
            return cursor.fetchone()[0]
        except Error as e:
            print(f"Error counting login attempts: {e}")
            return 0
        finally:
            cursor.close()
            connection.close()
    return 0

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
