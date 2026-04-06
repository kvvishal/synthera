from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

USERS_FILE = "users.json"
DATA_FILE = "data.json"


# ===============================
# INIT FILES
# ===============================
def init_file(file):
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump([], f)

init_file(USERS_FILE)
init_file(DATA_FILE)


# ===============================
# LOAD & SAVE
# ===============================
def load(file):
    with open(file, "r") as f:
        return json.load(f)

def save(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


# ===============================
# SIGNUP
# ===============================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    users = load(USERS_FILE)

    for user in users:
        if user["email"] == data["email"]:
            return jsonify({"message": "User already exists"}), 400

    users.append({
        "name": data["name"],
        "email": data["email"],
        "password": data["password"]
    })

    save(USERS_FILE, users)

    return jsonify({"message": "Signup successful"}), 200


# ===============================
# LOGIN
# ===============================
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    users = load(USERS_FILE)

    for user in users:
        if user["email"] == data["email"] and user["password"] == data["password"]:
            return jsonify({
                "message": "Login successful",
                "user": user
            }), 200

    return jsonify({"message": "Invalid credentials"}), 401


# ===============================
# SAVE PERSONAL INFO
# ===============================
@app.route("/save-personal", methods=["POST"])
def save_personal():
    data = request.json
    db = load(DATA_FILE)

    db.append({
        "email": data["email"],
        "age": data["age"],
        "height": data["height"],
        "weight": data["weight"]
    })

    save(DATA_FILE, db)

    return jsonify({"message": "Personal data saved"}), 200


# ===============================
# SAVE DIAGNOSIS
# ===============================
@app.route("/save-diagnosis", methods=["POST"])
def save_diagnosis():
    data = request.json
    db = load(DATA_FILE)

    db.append({
        "email": data["email"],
        "diagnosis": data["diagnosis"]
    })

    save(DATA_FILE, db)

    return jsonify({"message": "Diagnosis saved"}), 200


# ===============================
# GET USER DATA
# ===============================
@app.route("/get-user-data/<email>", methods=["GET"])
def get_user_data(email):
    db = load(DATA_FILE)

    user_data = [item for item in db if item.get("email") == email]

    return jsonify(user_data), 200


# ===============================
# RUN SERVER
# ===============================
if __name__ == "__main__":
    app.run(debug=True)