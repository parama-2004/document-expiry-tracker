from flask import Flask, request, jsonify
from flask_cors import CORS  
from werkzeug.security import check_password_hash 
import os
from werkzeug.utils import secure_filename
from database import create_connection, verify_token
from datetime import date, timedelta
import logging

from database import (
    create_connection, get_user_by_username, get_user_by_id, create_user, update_user_password,
    record_login_attempt, get_login_attempts_count, generate_token,
    verify_token
)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

MAX_ATTEMPTS_PER_DAY = 5

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    ip_address = request.remote_addr

    user = get_user_by_username(username)
    if not user:
        return jsonify({'message': 'Invalid username or password', 'attemptsLeft': MAX_ATTEMPTS_PER_DAY}), 401

    # SECURE: Compare hashed password
    if not check_password_hash(user['password_hash'], password):
        record_login_attempt(user['id'], ip_address, False)
        attempts = get_login_attempts_count(username, ip_address)
        return jsonify({
            'message': 'Invalid username or password',
            'attemptsLeft': max(0, MAX_ATTEMPTS_PER_DAY - attempts)
        }), 401

    record_login_attempt(user['id'], ip_address, True)
    token = generate_token(user['id'])
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'username': user['username']
    })

@app.route('/change-password', methods=['POST'])
def change_password():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Invalid or expired token'}), 401

    data = request.get_json()
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    if not check_password_hash(user['password_hash'], current_password):
        return jsonify({'message': 'Current password is incorrect'}), 401

    # Hash the new password before storing (secure)
    from werkzeug.security import generate_password_hash
    new_password_hash = generate_password_hash(new_password)

    if update_user_password(user['id'], new_password_hash):
        return jsonify({'message': 'Password changed successfully'})
    else:
        return jsonify({'message': 'Failed to change password'}), 500


@app.route('/documents/<int:doc_id>/complete', methods=['POST'])
def mark_as_completed(doc_id):
    token = request.headers.get('Authorization', '').split(' ')[-1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM documents WHERE id = %s", (doc_id,))
    doc = cursor.fetchone()

    if not doc:
        return jsonify({'message': 'Document not found'}), 404

    # Insert into return table
    cursor.execute("""
        INSERT INTO Returned (original_id, name, expiry_date)
        VALUES (%s, %s, %s)
    """, (doc['id'], doc['name'], doc['expiry_date']))

    # Delete from main documents table
    cursor.execute("DELETE FROM documents WHERE id = %s", (doc_id,))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'message': 'Marked as completed'}), 200

@app.route('/dashboard-data', methods=['GET'])
def dashboard_data():
    token = request.headers.get('Authorization', '').split(' ')[-1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    user = get_user_by_id(user_id)
    role = user['role']
    today= date.today()
    cursor.execute("UPDATE documents SET status = 'expired' WHERE expiry_date < %s", (today,))
    cursor.execute("UPDATE documents SET status = 'active' WHERE expiry_date >= %s", (today,))
    conn.commit()
    cursor.execute("SELECT COUNT(*) as total FROM documents")
    total = cursor.fetchone()['total']
    cursor.execute("SELECT COUNT(*) as active FROM documents WHERE status = 'active'")
    active = cursor.fetchone()['active']
    cursor.execute("SELECT COUNT(*) as expired FROM documents WHERE status = 'expired'")
    expired = cursor.fetchone()['expired']

    if role == 'admin':
        cursor.execute("SELECT id, name, expiry_date, visible, status FROM documents")
    else:
        cursor.execute("SELECT id, name, expiry_date, visible, status FROM documents WHERE visible = TRUE")

    documents = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify({
        'documents': documents,
        'stats': { 'total': total, 'active': active, 'expired': expired },
        'role': role
    })


@app.route('/documents', methods=['GET'])
def get_documents():
    token = request.headers.get('Authorization', '').split(' ')[-1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    today = date.today()

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    # Update status in DB before fetching
    cursor.execute("UPDATE documents SET status = 'expired' WHERE expiry_date < %s", (today,))
    cursor.execute("UPDATE documents SET status = 'active' WHERE expiry_date >= %s", (today,))
    conn.commit()

    user = get_user_by_id(user_id)

    if user['role'] == 'admin':
        cursor.execute("""
            SELECT id, name, expiry_date, visible, status
            FROM documents
        """)
    else:
        cursor.execute("""
            SELECT id, name, expiry_date, status
            FROM documents
            WHERE visible = TRUE
        """)

    documents = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(documents)

@app.route('/profile', methods=['GET', 'OPTIONS'])
def profile():
    if request.method == 'OPTIONS':
        return jsonify({}), 200
        
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Missing or invalid token'}), 401

    token = auth_header.split(' ')[1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Invalid or expired token'}), 401

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    return jsonify({
        'username': user['username'],
        'role': user.get('role', 'user')  # Make sure your user object has role
    })

@app.route('/documents/<int:doc_id>/toggle-visibility', methods=['PATCH'])
def toggle_visibility(doc_id):
    token = request.headers.get('Authorization', '').split(' ')[-1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    user = get_user_by_id(user_id)
    if user['role'] != 'admin':
        return jsonify({'message': 'Forbidden'}), 403

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE documents SET visible = NOT visible WHERE id = %s", (doc_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({'message': 'Visibility toggled'})
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'jpg', 'png'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/upload', methods=['POST'])
def upload_document():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    file = request.files.get('file')
    name = request.form.get('name')
    description = request.form.get('description')
    expiry_date = request.form.get('expiry_date')

    if not file or not allowed_file(file.filename):
        return jsonify({'message': 'Invalid or missing file'}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    conn = create_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO documents (user_id, name, description, expiry_date)
        VALUES (%s, %s, %s, %s)
    """, (user_id, name, description, expiry_date))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({'message': 'Document uploaded successfully'}), 200


@app.route('/alerts', methods=['GET'])
def get_expiring_documents():
    token = request.headers.get('Authorization', '').split(' ')[-1]
    user_id = verify_token(token)
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    today = date.today()
    next_week = today + timedelta(days=7)

    user = get_user_by_id(user_id)

    conn = create_connection()
    cursor = conn.cursor(dictionary=True)

    if user['role'] == 'admin':
        cursor.execute("""
            SELECT id, name, expiry_date
            FROM documents
            WHERE expiry_date BETWEEN %s AND %s
        """, (today, next_week))
    else:
        cursor.execute("""
            SELECT id, name, expiry_date
            FROM documents
            WHERE visible = TRUE AND expiry_date BETWEEN %s AND %s
        """, (today, next_week))

    results = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify(results)

@app.route('/public-documents', methods=['GET'])
def public_documents():
    conn = create_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT id, name, description, expiry_date FROM documents WHERE visible = TRUE")
    documents = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(documents)

            
if __name__ == '__main__':
    app.run(debug=True, port=5000)
