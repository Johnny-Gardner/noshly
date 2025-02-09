from flask import Flask, request, jsonify
from astrapy import DataAPIClient
import uuid
import bcrypt
from datetime import datetime, timedelta, timezone
import jwt
from functools import wraps
from flask_cors import CORS
import openai
from dotenv import load_dotenv
import os
import requests

load_dotenv()  # Load environment variables from a .env file

# Initialize Flask app
app = Flask(__name__)
CORS(app)

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
ASTRA_DB_TOKEN = os.getenv('ASTRA_DB_TOKEN')
ASTRA_DB_ENDPOINT = os.getenv('ASTRA_DB_ENDPOINT')
openai.api_key = os.getenv('OPENAI_API_KEY')

# Initialize DataAPIClient
client = DataAPIClient(ASTRA_DB_TOKEN)
db = client.get_database_by_api_endpoint(ASTRA_DB_ENDPOINT)

# Helper function to generate JWT tokens (now includes firstname)
def generate_token(user_id, email, firstname, role):
    payload = {
        "user_id": user_id,
        "email": email,
        "firstname": firstname,  # Include firstname in the token payload
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(hours=1)  # Token expires in 1 hour
    }
    token = jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm="HS256")
    return token

def generate_reset_token(email):
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15)  # 15-minute expiration
    }
    return jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm="HS256")

def token_required(f=None, allowed_roles=None):
    if f is None:
        return lambda f: token_required(f, allowed_roles)

    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check for token in the request headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
            request.user = data  # Attach decoded token data to the request

            # If roles are specified, check if user's role is allowed
            if allowed_roles and data.get('role') not in allowed_roles:
                return jsonify({'error': 'Access denied!'}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token!'}), 401

        return f(*args, **kwargs)

    return decorated


@app.route('/generateMealPlan', methods=['POST'])
@token_required
def generate_meal_plan():

    try:
        user_id = request.user['user_id']  # Get user ID from JWT token

        # Fetch user data from the database
        users_collection = db.get_collection('user_data')
        user = users_collection.find_one({"user_id": user_id})

        if not user:
            return jsonify({"error": "User not found!"}), 404

        # Extract the stored user preferences
        adults = user.get('adults', 1)
        children = user.get('children', 0)
        allergies = user.get('allergies', [])
        dietary_preferences = user.get('dietary_preferences', [])
        plan_days = user.get('plan_days', 7)
        country = user.get('country', 'Unknown')

        # Create a prompt for ChatGPT
        prompt = f"Generate a meal plan for {adults} adults and {children} children, considering:\n"
        prompt += f"Allergies: {', '.join(allergies)}\n" if allergies else "No allergies.\n"
        prompt += f"Dietary Preferences: {', '.join(dietary_preferences)}\n" if dietary_preferences else "No specific dietary preferences.\n"
        prompt += f"Country: {country}\n, please use this for local terminology and seasonal items"
        prompt += f"The meal plan should be for 1 day and only dinner, no side dishes or dessert."
        prompt += f"The ingredients list should only contain the item and the amount, not how to prep it. The first step should be to prep the ingredients. Also only give one option, if dietary preferences contradict each other sucha as vegetarian and pescatarian you should assume this means they are vegetarian, but will eat fish."

        # Call OpenAI API
        response = openai.chat.completions.create(
            model="gpt-4-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=700,
            temperature=0.7,
        )

        # Ensure the response has 'choices' and extract the meal plan
        if response and hasattr(response, 'choices') and len(response.choices) > 0:

            # Correct way to access 'content' in the response object
            meal_plan = response.choices[0].message.content

            return jsonify({"message": "Meal plan successfully generated", "plan": meal_plan}), 200
        else:
            raise ValueError("Failed to generate meal plan")

    except Exception as e:
        return jsonify({"error": "Meal plan generation failed"}), 500

@app.route('/protected', methods=['GET'])
@token_required
def protected_route():
    return jsonify({"message": f"Welcome {request.user}!"})

# Route to handle user registration (POST request)
@app.route('/register', methods=['POST'])
def register():
    # Get data from the request
    data = request.get_json()

    firstname = data.get('firstname')
    lastname = data.get('lastname')
    email = data.get('email')
    password = data.get('password')
    country = data.get('country')
    adults = int(data.get("adults", 1))
    children = int(data.get("children", 0))
    allergies = data.get('allergies', [])
    dietary_preferences = data.get('dietary_preferences', [])
    plan_days = int(data.get('days', 1))

    # Validate the input fields
    if not firstname or not lastname or not email or not password or not country:
        return jsonify({"error": "All fields are required!"}), 400

    # Generate a unique user ID (UUID)
    user_id = str(uuid.uuid4())

    # Hash the password using bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Access the "user_data" collection
    users_collection = db.get_collection('user_data')

    # Check if the user already exists by email
    query = {"email": email}
    existing_user = users_collection.find_one(query)

    if existing_user:
        return jsonify({"error": "User with this email already exists!"}), 400

    # Create a new user document
    user_document = {
        "user_id": user_id,
        "firstname": firstname,
        "lastname": lastname,
        "email": email,
        "password": hashed_password.decode('utf-8'),
        "role": "user",  # Default role; can change to "admin" as needed
        "country": country,
        "adults": int(adults),
        "children": int(children),
        "allergies": allergies,
        "dietary_preferences": dietary_preferences,
        "plan_days": int(plan_days),
        "created_datetime": datetime.utcnow()
    }

    # Insert the new user into the collection
    users_collection.insert_one(user_document)

    # Generate a JWT token for the new user
    token = generate_token(user_id, email, firstname, role="user")

    # Return the token and a success message
    return jsonify({
        "message": "User registered successfully!",
        "token": token
    }), 201

# Route to handle user login (POST request)
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validate the inputs
    if not email or not password:
        return jsonify({"error": "Email and Password are required!"}), 400

    # Access the "user_data" collection
    users_collection = db.get_collection('user_data')
    query = {"email": email}
    user = next(users_collection.find(query), None)

    if user and bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        # Generate a JWT token including firstname
        token = generate_token(user['user_id'], user['email'], user['firstname'], user['role'])
        return jsonify({"message": "Login successful!", "token": token}), 200
    else:
        return jsonify({"error": "Invalid credentials!"}), 401

@app.route('/dashboard', methods=['GET'])
@token_required
def dashboard():
    # Only accessible if valid token is passed
    return jsonify({"message": "This is the dashboard!"})

@app.route('/analytics', methods=['GET'])
@token_required
def analytics():
    # Only accessible if valid token is passed
    return jsonify({"message": "This is your analytics!"})

@app.route('/settings', methods=['GET'])
@token_required
def settings():
    # Only accessible if valid token is passed
    return jsonify({"message": "This is your settings!"})

@app.route('/admin', methods=['GET'])
@token_required(allowed_roles=['admin'])
def admin():
    # Only accessible if valid token is passed
    return jsonify({"message": "This is your admin page!"})

@app.route('/profile', methods=['GET'])
@token_required
def get_profile():
    # Extract user_id from the token
    user_id = request.user['user_id']

    # Fetch the user's data from the database
    users_collection = db.get_collection('user_data')
    user = users_collection.find_one({"user_id": user_id})

    if not user:
        return jsonify({"error": "User not found!"}), 404

    # Return the user's profile data (excluding sensitive info like password)
    return jsonify({
        "firstname": user.get("firstname"),
        "lastname": user.get("lastname"),
        "email": user.get("email"),
        "role": user.get("role"),
        "country": user.get("country"),
        "adults": user.get("adults"),
        "children": user.get("children"),
        "allergies": user.get("allergies"),
        "dietary_preferences": user.get("dietary_preferences"),
        "plan_days": user.get("plan_days"),
    }), 200

@app.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    # Get the current user from the token
    user_id = request.user['user_id']


    # Get updated data from the request
    data = request.get_json()

    firstname = data.get('firstname')
    lastname = data.get('lastname')
    country = data.get('country')
    allergies = data.get('allergies', [])
    dietary_preferences = data.get('dietary_preferences', [])
    plan_days = data.get('plan_days', 7)  # Default to 7 days
    adults = data.get('adults', 1)
    children = data.get('children', 0)

    # Validate inputs (e.g., ensure required fields are not empty)
    if not firstname or not lastname:
        return jsonify({"error": "Firstname and lastname are required!"}), 400

    # Update user data in Astra DB
    users_collection = db.get_collection('user_data')
    query = {"user_id": user_id}
    update_fields = {
        "firstname": firstname,
        "lastname": lastname,
        "country": country,
        "allergies": allergies,
        "dietary_preferences": dietary_preferences,
        "plan_days": plan_days,
        "adults": adults,
        "children": children,
    }
    users_collection.update_one(query, {"$set": update_fields})

    return jsonify({"message": "Profile updated successfully!"})

@app.route('/delete_account', methods=['DELETE'])
@token_required
def delete_account():
    user_id = request.user['user_id']

    # Delete the user from the database
    users_collection = db.get_collection('user_data')
    result = users_collection.delete_one({"user_id": user_id})

    if result.deleted_count == 1:
        return jsonify({"message": "Account deleted successfully!"}), 200
    else:
        return jsonify({"error": "Error deleting account. Please try again."}), 500

@app.route('/request_password_reset', methods=['POST'])
def request_password_reset():
    data = request.get_json()
    email = data.get('email')

    users_collection = db.get_collection('user_data')
    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Email not found!"}), 404

    token = generate_reset_token(email)
    reset_link = f"http://localhost:3000/updatepassword?token={token}"

    headers = {
        "Authorization": f"Klaviyo-API-Key {os.getenv('KLAVIYO_API_KEY')}",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "REVISION": "2025-01-15"
    }

    # Send email via Klaviyo
    payload = {
        "data": {
    "type": "event",
    "attributes": {
      "properties": {
        "email": email,
        "PasswordResetLink": reset_link
      },
      "metric": {
        "data": {
          "type": "metric",
          "attributes": {
            "name": "Reset Password"
          }
        }
      },
      "profile": {
        "data": {
          "type": "profile",
          "attributes": {
            "email": email
          }
        }
      }
    }
  }
}

    response = requests.post("https://a.klaviyo.com/api/events/", json=payload, headers=headers)
    if response.status_code != 200:
        print("Error sending email:", response.status_code, response.text)
    else:
        print("Email sent successfully!")


    return jsonify({"message": "Password reset email sent!"}), 200


@app.route('/update_password', methods=['POST'])
def update_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    try:
        decoded_token = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=["HS256"])
        email = decoded_token.get('email')

        users_collection = db.get_collection('user_data')
        user = users_collection.find_one({"email": email})

        if not user:
            return jsonify({"error": "Invalid token!"}), 400

        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        users_collection.update_one({"email": email}, {"$set": {"password": hashed_password.decode('utf-8')}})

        return jsonify({"message": "Password updated successfully!"}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired!"}), 400
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token!"}), 400

# Route to handle user logout
@app.route('/logout', methods=['POST'])
def logout():
    # Clear the session data
    return jsonify({"message": "Logout successful!"}), 200

if __name__ == '__main__':
    app.run(debug=True)
