# WARNING: This file contains several code review red flags!
# DO NOT use this code in production - it's for educational purposes only.

import os
import sys
import json
import base64
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

if __name__ == "__main__":
    # Red Flag 11: No proper main function structure
    user_input = input("Enter some code to execute: ")
    result = process_user_input(user_input)
    print(f"Result: {result}") 