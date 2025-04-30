# WARNING: This file contains several code review red flags!
# DO NOT use this code in production - it's for educational purposes only.

import os
import sys
import json
import base64
import sqlite3
from typing import Any

# Red Flag 1: Hardcoded credentials in the code
DATABASE_PASSWORD = "SuperSecret123!"
API_KEY = "sk-1234567890abcdef"

# Red Flag 2: Global variables that could be modified anywhere
global_state = {}

# Red Flag 3: Unsafe eval usage with user input
def process_user_input(user_input: str) -> Any:
    # WARNING: Never use eval with user input - this is a security risk!
    return eval(user_input)

# Red Flag 4: Catching all exceptions without proper handling
def risky_operation():
    try:
        # Some risky operation
        result = 1 / 0
    except:
        # Catching all exceptions without logging or proper handling
        pass

# Red Flag 5: Magic numbers without explanation
def calculate_something(value: float) -> float:
    return value * 0.7  # What does 0.7 represent?

# Red Flag 6: Inconsistent return types
def get_user_data(user_id: int):
    if user_id < 0:
        return None
    elif user_id == 0:
        return "admin"
    else:
        return {"id": user_id, "name": "User"}

# Red Flag 7: Unused imports and variables
unused_variable = "This is never used"

# Red Flag 8: No type hints for function parameters
def process_data(data):
    return data * 2

# Red Flag 9: Insecure password hashing
def hash_password(password: str) -> str:
    # WARNING: This is not a secure way to hash passwords
    return base64.b64encode(password.encode()).decode()

# Red Flag 10: No input validation
def save_to_database(data: Any):
    # No validation of input data
    with open("database.txt", "w") as f:
        f.write(str(data))

# Red Flag 12: Function with too many responsibilities and poor documentation
def handle_user_request(request_data):
    # This function does too many things and has no proper documentation
    # It handles user authentication, data processing, file operations, and email sending
    # all in one function, making it hard to test and maintain
    
    # Authentication
    if request_data.get('token') != API_KEY:
        return "Invalid token"
    
    # Data processing
    user_id = request_data.get('user_id')
    if not user_id:
        return "Missing user_id"
    
    # File operations
    try:
        with open(f"user_{user_id}.json", "r") as f:
            user_data = json.load(f)
    except:
        return "User not found"
    
    # More processing
    if user_data.get('status') == 'inactive':
        return "User is inactive"
    
    # Email sending (simulated)
    print(f"Sending email to {user_data.get('email')}")
    
    # Database update
    save_to_database(user_data)
    
    # Return multiple types of responses
    if request_data.get('format') == 'json':
        return json.dumps(user_data)
    elif request_data.get('format') == 'html':
        return f"<div>{user_data}</div>"
    else:
        return user_data

# Red Flag 13: SQL Injection vulnerability
def get_user_by_username(username):
    # WARNING: This is vulnerable to SQL injection attacks!
    # Never concatenate user input directly into SQL queries
    
    # Connect to the database
    conn = sqlite3.connect('users.db')
    cursor = conn.cursor()
    
    # VULNERABLE CODE: Direct string concatenation in SQL query
    query = "SELECT * FROM users WHERE username = '" + username + "'"
    
    # Execute the vulnerable query
    cursor.execute(query)
    result = cursor.fetchone()
    
    conn.close()
    return result
    
    # NOTE: The proper way would be to use parameterized queries:
    # cursor.execute("SELECT * FROM users WHERE username = ?", (username,))

if __name__ == "__main__":
    # Red Flag 11: No proper main function structure
    user_input = input("Enter some code to execute: ")
    result = process_user_input(user_input)
    print(f"Result: {result}") 