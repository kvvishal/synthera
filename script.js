// ===============================
// GLOBAL VARIABLES
// ===============================
let isLogin = false;

let selectedSymptoms = [];
let questions = [];
let currentQ = 0;
let answers = [];


// ===============================
// HERO BUTTON REDIRECT
// ===============================
const startBtn = document.getElementById("startBtn");

if (startBtn) {
    startBtn.addEventListener("click", () => {
        window.location.href = "login.html";
    });
}


// ===============================
// LOGIN / SIGNUP TOGGLE
// ===============================
function setupToggle() {
    const toggleBtn = document.getElementById("toggleBtn");

    if (!toggleBtn) return;

    toggleBtn.addEventListener("click", () => {
        isLogin = !isLogin;

        const title = document.getElementById("formTitle");
        const nameField = document.getElementById("nameField");
        const authBtn = document.getElementById("authBtn");
        const toggleText = document.getElementById("toggleText");

        if (isLogin) {
            title.innerText = "Login";
            nameField.style.display = "none";
            authBtn.innerText = "Login";
            toggleText.innerHTML = `Don't have an account? <span id="toggleBtn">Sign Up</span>`;
        } else {
            title.innerText = "Create Account";
            nameField.style.display = "block";
            authBtn.innerText = "Sign Up";
            toggleText.innerHTML = `Already have an account? <span id="toggleBtn">Login</span>`;
        }

        setupToggle();
    });
}
setupToggle();


// ===============================
// SIGNUP
// ===============================
async function signupUser() {
    const name = document.querySelector("input[placeholder='Full Name']")?.value;
    const email = document.querySelector("input[placeholder='Email']")?.value;
    const password = document.querySelector("input[placeholder='Password']")?.value;

    if (!name || !email || !password) {
        alert("Fill all fields");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.message);

    } catch {
        alert("Server error");
    }
}


// ===============================
// LOGIN
// ===============================
async function loginUser() {
    const email = document.querySelector("input[placeholder='Email']")?.value;
    const password = document.querySelector("input[placeholder='Password']")?.value;

    try {
        const res = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.status === 200) {
            localStorage.setItem("loggedIn", true);
            localStorage.setItem("userEmail", email);
            window.location.href = "dashboard.html";
        } else {
            alert(data.message);
        }

    } catch {
        alert("Server error");
    }
}


// ===============================
// AUTH BUTTON
// ===============================
const authBtn = document.getElementById("authBtn");

if (authBtn) {
    authBtn.addEventListener("click", () => {
        const mode = document.getElementById("formTitle")?.innerText;

        if (mode === "Login") loginUser();
        else signupUser();
    });
}


// ===============================
// DASHBOARD SAVE DATA
// ===============================
const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {
    nextBtn.addEventListener("click", async () => {

        const age = document.getElementById("age")?.value;
        const height = document.getElementById("height")?.value;
        const weight = document.getElementById("weight")?.value;
        const email = localStorage.getItem("userEmail");

        if (!age || !height || !weight) {
            alert("Fill all fields");
            return;
        }

        localStorage.setItem("userData", JSON.stringify({ age, height, weight }));

        await fetch("http://127.0.0.1:5000/save-personal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, age, height, weight })
        });

        window.location.href = "questions.html";
    });
}


// ===============================
// SYMPTOM MULTI SELECT
// ===============================
document.querySelectorAll(".option").forEach(option => {
    option.addEventListener("click", () => {

        const text = option.innerText;

        if (text === "None") {
            selectedSymptoms = ["None"];
            document.querySelectorAll(".option").forEach(o => o.classList.remove("selected"));
            option.classList.add("selected");
        } else {
            selectedSymptoms = selectedSymptoms.filter(i => i !== "None");

            if (selectedSymptoms.includes(text)) {
                selectedSymptoms = selectedSymptoms.filter(i => i !== text);
                option.classList.remove("selected");
            } else {
                selectedSymptoms.push(text);
                option.classList.add("selected");
            }
        }
    });
});


// ===============================
// QUESTION DATA
// ===============================
const questionFlow = {
    "PCOS": ["Irregular periods", "Acne", "Weight gain"],
    "Endometriosis": ["Severe pain", "Heavy bleeding"],
    "Thyroid disorder": ["Fatigue", "Weight changes"]
};


// ===============================
// NEXT → START QUESTION FLOW
// ===============================
document.getElementById("nextQ")?.addEventListener("click", () => {

    if (selectedSymptoms.length === 0) {
        alert("Select at least one");
        return;
    }

    localStorage.setItem("diagnosis", JSON.stringify(selectedSymptoms));

    questions = [];

    if (selectedSymptoms.includes("None")) {
        questions = ["Fatigue", "Sleep issues", "Mood swings"];
    } else {
        selectedSymptoms.forEach(s => {
            if (questionFlow[s]) {
                questions.push(...questionFlow[s]);
            }
        });
    }

    document.getElementById("symptomStep").style.display = "none";
    document.getElementById("questionStep").style.display = "block";

    currentQ = 0;
    answers = [];

    showQuestion();
});


// ===============================
// SHOW QUESTION
// ===============================
function showQuestion() {
    const container = document.getElementById("dynamicQuestions");

    if (!container) return;

    updateProgress();

    if (currentQ >= questions.length) {
    localStorage.setItem("answers", JSON.stringify(answers));

    // 👉 MOVE TO RESULT PAGE
    window.location.href = "result.html";
    return;
}

    container.innerHTML = "";

    let q = questions[currentQ];

    let title = document.createElement("h2");
    title.innerText = q;

    let yes = document.createElement("button");
    yes.innerText = "Yes";

    let no = document.createElement("button");
    no.innerText = "No";

    yes.onclick = () => askDuration(q);

    no.onclick = () => {
        answers[currentQ] = { question: q, answer: "No" };
        currentQ++;
        showQuestion();
    };

    container.appendChild(title);
    container.appendChild(yes);
    container.appendChild(no);
}


// ===============================
// DURATION STEP
// ===============================
function askDuration(q) {

    const container = document.getElementById("dynamicQuestions");
    container.innerHTML = "";

    let title = document.createElement("h2");
    title.innerText = `How long have you had "${q}"?`;

    container.appendChild(title);

    ["Few days", "Weeks", "Months", "6+ months"].forEach(opt => {

        let btn = document.createElement("button");
        btn.innerText = opt;

        btn.onclick = () => {
            answers[currentQ] = {
                question: q,
                answer: "Yes",
                duration: opt
            };

            currentQ++;
            showQuestion();
        };

        container.appendChild(btn);
    });
}


// ===============================
// BACK BUTTON
// ===============================
document.getElementById("backBtn")?.addEventListener("click", () => {

    if (currentQ === 0) {
        document.getElementById("questionStep").style.display = "none";
        document.getElementById("symptomStep").style.display = "block";
        return;
    }

    currentQ--;
    showQuestion();
});


// PROGRESS BAR UPDATE
function updateProgress() {

    let total = questions.length;
    let current = currentQ;

    let percent = Math.round((current / total) * 100);

    // Update UI
    const fill = document.getElementById("progressFill");
    const percentText = document.getElementById("percentText");
    const stepText = document.getElementById("stepText");

    if (fill) fill.style.width = percent + "%";
    if (percentText) percentText.innerText = percent + "% Complete";
    if (stepText) stepText.innerText = `STEP ${current + 1} OF ${total}`;
}


// ===============================
// LOGOUT
// ===============================
const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}


//Calculate risk percentage based on answers 

function calculateRisk() {

    let answers = JSON.parse(localStorage.getItem("answers")) || [];

    let score = 0;
    let maxScore = answers.length * 3;

    answers.forEach(a => {
        if (a.answer === "Yes") {
            if (a.duration === "6+ months" || a.duration === "Months") {
                score += 3;
            } else {
                score += 2;
            }
        }
    });

    let percent = Math.round((score / maxScore) * 100);

    return percent;
}


function showResult() {

    let percent = calculateRisk();

    const riskText = document.getElementById("riskText");
    const riskPercent = document.getElementById("riskPercent");
    const insights = document.getElementById("insights");
    const circle = document.querySelector(".circle");

    if (!riskPercent) return;

    let current = 0;

    // 🔥 ANIMATION
    let interval = setInterval(() => {
        if (current >= percent) {
            clearInterval(interval);
        } else {
            current++;
            riskPercent.innerText = current + "%";

            circle.style.background =
                `conic-gradient(#ff8c73 ${current}%, #333 ${current}%)`;
        }
    }, 15);

    // TEXT
    if (percent > 70) {
        riskText.innerText = "High Risk ⚠️";
    } else if (percent > 40) {
        riskText.innerText = "Moderate Risk";
    } else {
        riskText.innerText = "Low Risk ✅";
    }

    // INSIGHTS
    let answers = JSON.parse(localStorage.getItem("answers")) || [];

    insights.innerHTML = "<h3>Key Observations:</h3>";

    answers.forEach(a => {
        if (a.answer === "Yes") {
            insights.innerHTML += `<p>• ${a.question} (${a.duration})</p>`;
        }
    });
}

if (window.location.pathname.includes("result.html")) {
    showResult();
}

function goHome() {
    localStorage.clear();
    window.location.href = "dashboard.html";
}