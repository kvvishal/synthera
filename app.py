from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

from openai import OpenAI

# ===============================
# INIT
# ===============================
app = Flask(__name__)
CORS(app)

client = OpenAI(api_key="YOUR_OPENAI_API_KEY")

USERS_FILE = "users.json"
DATA_FILE = "data.json"


# ===============================
# FILE SETUP
# ===============================
def init_file(file):
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump([], f)

init_file(USERS_FILE)
init_file(DATA_FILE)


def load(file):
    with open(file, "r") as f:
        return json.load(f)


def save(file, data):
    with open(file, "w") as f:
        json.dump(data, f, indent=4)


# ===============================
# AUTH
# ===============================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    users = load(USERS_FILE)

    for user in users:
        if user["email"] == data["email"]:
            return jsonify({"message": "User already exists"}), 400

    users.append(data)
    save(USERS_FILE, users)

    return jsonify({"message": "Signup successful"})


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    users = load(USERS_FILE)

    for user in users:
        if user["email"] == data["email"] and user["password"] == data["password"]:
            return jsonify({"message": "Login successful"}), 200

    return jsonify({"message": "Invalid credentials"}), 401


# ===============================
# SAVE PERSONAL DATA
# ===============================
@app.route("/save-personal", methods=["POST"])
def save_personal():
    data = request.json
    db = load(DATA_FILE)

    db.append(data)
    save(DATA_FILE, db)

    return jsonify({"message": "Saved"})


# ===============================
# AI ANALYSIS
# ===============================
@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.json
    answers = data.get("answers", [])

    # Convert answers → readable
    user_data = ""
    for a in answers:
        if a["answer"] == "Yes":
            user_data += f"{a['question']} for {a.get('duration', '')}, "

    # ===============================
    # TRY OPENAI AI
    # ===============================
    try:
        prompt = f"""
        Symptoms: {user_data}

        Respond in this format:

        Condition:
        Risk:
        Explanation:
        Next Steps:
        """

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are a medical assistant AI."},
                {"role": "user", "content": prompt}
            ]
        )

        ai_text = response.choices[0].message.content

        return jsonify({
            "source": "AI",
            "result": ai_text
        })

    # ===============================
    # FALLBACK (SMART AI-LIKE)
    # ===============================
    except Exception as e:
        print("AI failed:", e)

        score = 0

        condition_scores = {
            "PCOS": 0,
            "Thyroid Disorder": 0,
            "Endometriosis": 0
        }

        for a in answers:
            if a["answer"] == "Yes":

                if a.get("duration") in ["6+ months", "Months"]:
                    score += 3
                else:
                    score += 2

                q = a["question"].lower()

                if "period" in q or "acne" in q:
                    condition_scores["PCOS"] += 2

                if "fatigue" in q or "weight" in q:
                    condition_scores["Thyroid Disorder"] += 2

                if "pain" in q or "bleeding" in q:
                    condition_scores["Endometriosis"] += 2

        percent = min(score * 10, 100)
        predicted = max(condition_scores, key=condition_scores.get)

        fallback_text = f"""
        Condition: {predicted}

        Risk Level: {percent}%

        Explanation:
        Based on your symptoms, there is a likelihood of {predicted}. 
        Duration and pattern of symptoms suggest moderate concern.

        Next Steps:
        • Consult a specialist
        • Maintain healthy lifestyle
        • Track symptoms regularly
        """

        return jsonify({
            "source": "fallback",
            "result": fallback_text
        })


# ===============================
# RUN
# ===============================
if __name__ == "__main__":
    app.run(debug=True)