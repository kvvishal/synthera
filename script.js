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
            toggleText.innerHTML = `Don't have an account? <span id="toggleBtn" style="color:#B56576;">Sign Up</span>`;
        } else {
            title.innerText = "Create Account";
            nameField.style.display = "block";
            authBtn.innerText = "Sign Up";
            toggleText.innerHTML = `Already have an account? <span id="toggleBtn" style="color:#B56576;">Login</span>`;
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
// SYMPTOM SEARCH & AUTOCOMPLETE
// ===============================
const availableSymptoms = [
    "Irregular Cycles", "Severe Pelvic Pain", "Unexplained Fatigue",
    "Weight Gain", "Unexplained Weight Loss", "Heavy Menstrual Bleeding",
    "Excessive Hair Fall", "Acne (Jawline/Chin)", "Mood Fluctuations",
    "Poor Concentration / Brain Fog", "Cold Intolerance", "Sleep Disturbances",
    "Painful Intercourse", "Excessive Body Hair (Hirsutism)", "General Checkup"
];

const symptomInput = document.getElementById("symptomInput");
const suggestionsBox = document.getElementById("suggestionsBox");
const selectedTags = document.getElementById("selectedTags");

if (symptomInput) {
    symptomInput.addEventListener("input", function() {
        const query = this.value.toLowerCase();
        suggestionsBox.innerHTML = "";
        
        if (!query) {
            suggestionsBox.style.display = "none";
            return;
        }

        const matches = availableSymptoms.filter(s => 
            s.toLowerCase().includes(query) && !selectedSymptoms.includes(s)
        );

        if (matches.length > 0) {
            suggestionsBox.style.display = "block";
            matches.forEach(match => {
                let div = document.createElement("div");
                div.classList.add("suggestion-item");
                div.innerText = match;
                
                div.addEventListener("click", () => {
                    addSymptomTag(match);
                    symptomInput.value = "";
                    suggestionsBox.style.display = "none";
                });
                suggestionsBox.appendChild(div);
            });
        } else {
            suggestionsBox.style.display = "none";
        }
    });

    document.addEventListener("click", (e) => {
        if (e.target !== symptomInput && e.target !== suggestionsBox) {
            suggestionsBox.style.display = "none";
        }
    });
}

function addSymptomTag(symptom) {
    selectedSymptoms.push(symptom);
    renderTags();
}

function removeSymptomTag(symptom) {
    selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
    renderTags();
}

function renderTags() {
    selectedTags.innerHTML = "";
    selectedSymptoms.forEach(symptom => {
        let tag = document.createElement("div");
        tag.classList.add("symptom-tag");
        tag.innerHTML = `${symptom} <span onclick="removeSymptomTag('${symptom}')">&times;</span>`;
        selectedTags.appendChild(tag);
    });
}

// ===============================
// QUESTION DATA 
// ===============================
const questionFlow = {
    "Irregular Cycles": [
        { q: "Are your menstrual cycles longer than 35 days, or do you skip periods entirely?", what: "This indicates anovulation—meaning your ovaries might not be releasing an egg every month.", why: "Irregular periods are a primary indicator of PCOS, often caused by high androgen (male hormone) levels." },
        { q: "Have you noticed dark, velvety patches of skin around your neck, armpits, or inner thighs?", what: "This is a condition called Acanthosis Nigricans, a clinical sign of high insulin levels.", why: "Insulin resistance is a root cause for many Indian women with PCOS, affecting how the body processes sugar." }
    ],
    "Unexplained Fatigue": [
        { q: "Do you feel completely exhausted even after 7–8 hours of sleep?", what: "This type of 'heavy' unrefreshed fatigue suggests your body's energy production is impaired.", why: "This is a classic sign of Hypothyroidism (slowed metabolism) or severe Anemia (lack of oxygen to tissues)." },
        { q: "Do you follow a strictly vegetarian diet without taking Iron or B12 supplements?", what: "Plant-based diets in India are rich in nutrients but lack 'heme iron', which is easier for the body to absorb.", why: "Non-heme iron is harder to absorb, significantly increasing the risk of Iron-Deficiency Anemia." }
    ],
    "Weight Gain": [
        { q: "Are you gaining weight primarily around your belly, despite normal eating habits?", what: "Belly-centered fat storage is strongly linked to how your body processes sugar and carbohydrates.", why: "This suggests Insulin Resistance, common in PCOS, where the body struggles to process carbs like rice and roti efficiently." },
        { q: "Are the outer thirds of your eyebrows thinning or disappearing?", what: "This is a specific clinical visual clue known as the 'Sign of Hertoghe'.", why: "Thyroid hormones are essential for hair follicle growth. Thinning eyebrows is a highly specific marker for Hypothyroidism." }
    ],
    "Heavy Menstrual Bleeding": [
        { q: "Do you go through multiple pads on your heaviest days, or pass large clots?", what: "Heavy bleeding (Menorrhagia) rapidly depletes your body's iron stores.", why: "This is the leading cause of Anemia in women and can also be an underlying sign of Thyroid dysfunction." },
        { q: "Do you feel dizzy or lightheaded when standing up quickly?", what: "Your brain is temporarily not receiving enough oxygen-rich blood.", why: "Because low Hemoglobin (Anemia) reduces oxygen capacity, your heart struggles to pump oxygenated blood against gravity." }
    ],
    "General Checkup": [
        { q: "Do you feel unusually cold, needing a sweater in the AC when others feel completely fine?", what: "Temperature sensitivity indicates your basal metabolic rate is running slower than normal.", why: "The thyroid gland acts as your body's thermostat. Feeling cold is a major symptom of Hypothyroidism." },
        { q: "Do you experience intense cravings for sweets or heavy carbs right after a full meal?", what: "Frequent 'sugar crashes' mean your blood sugar is spiking and dropping rapidly.", why: "This is a strong behavioral indicator of early insulin resistance, pointing toward PCOS or metabolic syndrome." }
    ]
};

// ===============================
// ROUTING LOGIC: PURPOSE STEP -> SYMPTOMS OR GENERAL
// ===============================
const btnPurposeSymptoms = document.getElementById("btnPurposeSymptoms");
const btnPurposeGeneral = document.getElementById("btnPurposeGeneral");

// Path 1: User has symptoms
if(btnPurposeSymptoms) {
    btnPurposeSymptoms.addEventListener("click", () => {
        document.getElementById("purposeStep").style.display = "none";
        document.getElementById("symptomStep").style.display = "block";
    });
}

// Path 2: User wants General Checkup (Skips symptom search)
if(btnPurposeGeneral) {
    btnPurposeGeneral.addEventListener("click", () => {
        document.getElementById("purposeStep").style.display = "none";
        document.getElementById("questionStep").style.display = "block";
        
        selectedSymptoms = ["General Checkup"];
        localStorage.setItem("diagnosis", JSON.stringify(selectedSymptoms));
        localStorage.setItem("primaryDuration", "N/A"); // Skips duration requirement
        
        questions = [...questionFlow["General Checkup"]];
        currentQ = 0;
        answers = [];
        showQuestion();
    });
}

// Proceed from Symptom Search
document.getElementById("nextQ")?.addEventListener("click", () => {
    const initialDuration = document.getElementById("initialDuration")?.value;

    if (selectedSymptoms.length === 0) {
        alert("Please search and select at least one symptom.");
        return;
    }
    if (!initialDuration) {
        alert("Please tell us how long you have noticed these symptoms.");
        return;
    }

    localStorage.setItem("diagnosis", JSON.stringify(selectedSymptoms));
    localStorage.setItem("primaryDuration", initialDuration);

    questions = [];
    selectedSymptoms.forEach(s => {
        if (questionFlow[s]) {
            questions.push(...questionFlow[s]);
        }
    });

    if (questions.length === 0) {
        questions = ["Do you experience frequent mood swings?", "Have you noticed changes in your sleep patterns?"];
    }

    document.getElementById("symptomStep").style.display = "none";
    document.getElementById("questionStep").style.display = "block";

    currentQ = 0;
    answers = [];
    showQuestion();
});

// ===============================
// SHOW QUESTION (Clean Build)
// ===============================
function showQuestion() {
    const container = document.getElementById("dynamicQuestions");
    if (!container) return;

    updateProgress();

    // EXIT LOGIC -> Routes to LAB REPORTS STEP instead of result page
    if (currentQ >= questions.length) {
        localStorage.setItem("answers", JSON.stringify(answers));
        document.getElementById("questionStep").style.display = "none";
        document.getElementById("labStep").style.display = "block";
        return;
    }

    container.innerHTML = "";
    
    let qObj = questions[currentQ];
    if (typeof qObj === 'string') {
        qObj = { q: qObj, what: "General screening question.", why: "To better understand your overall health pattern." };
    }

    let card = document.createElement("div");
    card.className = "syn-q-card";

    let infoRow = document.createElement("div");
    infoRow.className = "syn-info-row";

    let whatBtn = document.createElement("button");
    whatBtn.className = "syn-small-btn";
    whatBtn.innerHTML = "💡 What does this mean?";
    whatBtn.onclick = () => openModal("What it means", qObj.what);

    let whyBtn = document.createElement("button");
    whyBtn.className = "syn-small-btn";
    whyBtn.innerHTML = "🔍 Why ask this?";
    whyBtn.onclick = () => openModal("Why we ask", qObj.why);

    infoRow.appendChild(whatBtn);
    infoRow.appendChild(whyBtn);

    let title = document.createElement("div");
    title.className = "syn-q-title";
    title.innerText = qObj.q;

    let optionsGrid = document.createElement("div");
    optionsGrid.className = "syn-options-grid";

    let btnYes = document.createElement("div");
    btnYes.className = "syn-opt-btn";
    btnYes.innerHTML = `<div class="syn-radio-circle"></div><span style="font-weight: 500; color: #334155;">Yes</span>`;
    btnYes.onclick = () => {
        btnYes.style.borderColor = "#B56576";
        btnYes.style.background = "#fdfafb";
        btnYes.querySelector('.syn-radio-circle').style.borderWidth = "6px";
        btnYes.querySelector('.syn-radio-circle').style.borderColor = "#B56576";
        setTimeout(() => askDuration(qObj.q), 250); 
    };

    let btnNo = document.createElement("div");
    btnNo.className = "syn-opt-btn";
    btnNo.innerHTML = `<div class="syn-radio-circle"></div><span style="font-weight: 500; color: #334155;">No</span>`;
    btnNo.onclick = () => {
        btnNo.style.borderColor = "#B56576";
        btnNo.style.background = "#fdfafb";
        btnNo.querySelector('.syn-radio-circle').style.borderWidth = "6px";
        btnNo.querySelector('.syn-radio-circle').style.borderColor = "#B56576";
        setTimeout(() => {
            answers[currentQ] = { question: qObj.q, answer: "No" };
            currentQ++;
            showQuestion();
        }, 250);
    };

    optionsGrid.appendChild(btnYes);
    optionsGrid.appendChild(btnNo);

    card.appendChild(infoRow);
    card.appendChild(title);
    card.appendChild(optionsGrid);
    container.appendChild(card);
}

// ===============================
// MODAL LOGIC
// ===============================
const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";
modalOverlay.style.display = "none";
modalOverlay.innerHTML = `
    <div class="modal-content">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <h3 class="modal-title" id="modalTitle" style="color: #6D597A;">Title</h3>
        <p class="modal-text" id="modalText">Text goes here.</p>
    </div>
`;
document.body.appendChild(modalOverlay);

function openModal(title, text) {
    document.getElementById("modalTitle").innerText = title;
    document.getElementById("modalText").innerText = text;
    modalOverlay.style.display = "flex"; 
}

function closeModal() {
    modalOverlay.style.display = "none";
}

modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
});

// ===============================
// DURATION STEP (Clinical Layout)
// ===============================
function askDuration(q) {
    const container = document.getElementById("dynamicQuestions");
    container.innerHTML = "";

    let card = document.createElement("div");
    card.className = "syn-q-card";

    let title = document.createElement("div");
    title.className = "syn-q-title";
    title.innerText = "How long have you been experiencing this specific symptom?";

    let subtitle = document.createElement("p");
    subtitle.style.fontSize = "14px";
    subtitle.style.color = "#666";
    subtitle.style.marginBottom = "25px";
    subtitle.innerText = `Reference: "${q}"`;

    let optionsGrid = document.createElement("div");
    optionsGrid.className = "syn-options-grid";
    optionsGrid.style.flexWrap = "wrap"; 

    const durationOptions = ["A few days", "A few weeks", "1 - 3 months", "More than 3 months"];

    durationOptions.forEach(opt => {
        let btn = document.createElement("div");
        btn.className = "syn-opt-btn";
        btn.style.flex = "1 1 40%"; 
        
        btn.innerHTML = `<div class="syn-radio-circle"></div><span style="font-weight: 500; color: #334155;">${opt}</span>`;

        btn.onclick = () => {
            btn.style.borderColor = "#B56576";
            btn.style.background = "#fdfafb";
            let circle = btn.querySelector('.syn-radio-circle');
            circle.style.borderWidth = "6px";
            circle.style.borderColor = "#B56576";

            setTimeout(() => {
                answers[currentQ] = {
                    question: q,
                    answer: "Yes",
                    duration: opt
                };
                currentQ++;
                showQuestion();
            }, 250);
        };
        optionsGrid.appendChild(btn);
    });

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(optionsGrid);
    container.appendChild(card);
}

// ===============================
// BACK BUTTON LOGIC
// ===============================
document.getElementById("backBtn")?.addEventListener("click", () => {
    if (currentQ === 0) {
        document.getElementById("questionStep").style.display = "none";
        
        // Route back to the correct starting step
        if (selectedSymptoms.includes("General Checkup")) {
            document.getElementById("purposeStep").style.display = "block";
        } else {
            document.getElementById("symptomStep").style.display = "block";
        }
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

    const fill = document.getElementById("progressFill");
    const percentText = document.getElementById("percentText");
    const stepText = document.getElementById("stepText");

    if (fill) fill.style.width = percent + "%";
    if (percentText) percentText.innerText = percent + "% Complete";
    if (stepText) stepText.innerText = `STEP ${current + 1} OF ${total}`;
}

// ===============================
// LAB REPORTS STEP LOGIC
// ===============================
const btnLabYes = document.getElementById("btnLabYes");
const btnLabNo = document.getElementById("btnLabNo");
const uploadArea = document.getElementById("uploadArea");
const labFile = document.getElementById("labFile");
const fileNameDisplay = document.getElementById("fileNameDisplay");

if(btnLabYes) {
    btnLabYes.addEventListener("click", () => {
        btnLabYes.style.borderColor = "#B56576";
        btnLabYes.style.background = "#fdfafb";
        btnLabYes.querySelector('.syn-radio-circle').style.borderWidth = "6px";
        btnLabYes.querySelector('.syn-radio-circle').style.borderColor = "#B56576";
        
        btnLabNo.style.borderColor = "#e2e8f0";
        btnLabNo.style.background = "#FFFFFF";
        btnLabNo.querySelector('.syn-radio-circle').style.borderWidth = "2px";
        btnLabNo.querySelector('.syn-radio-circle').style.borderColor = "#cbd5e1";

        uploadArea.style.display = "block"; 
        localStorage.setItem("needsLabSuggestions", "false");
    });
}

if(btnLabNo) {
    btnLabNo.addEventListener("click", () => {
        btnLabNo.style.borderColor = "#B56576";
        btnLabNo.style.background = "#fdfafb";
        btnLabNo.querySelector('.syn-radio-circle').style.borderWidth = "6px";
        btnLabNo.querySelector('.syn-radio-circle').style.borderColor = "#B56576";
        
        btnLabYes.style.borderColor = "#e2e8f0";
        btnLabYes.style.background = "#FFFFFF";
        btnLabYes.querySelector('.syn-radio-circle').style.borderWidth = "2px";
        btnLabYes.querySelector('.syn-radio-circle').style.borderColor = "#cbd5e1";

        uploadArea.style.display = "none"; 
        localStorage.setItem("needsLabSuggestions", "true");
    });
}

if(labFile) {
    labFile.addEventListener("change", (e) => {
        if(e.target.files.length > 0) {
            fileNameDisplay.innerText = "Selected File: " + e.target.files.name;
        }
    });
}

const finishAssessmentBtn = document.getElementById("finishAssessmentBtn");
if(finishAssessmentBtn) {
    finishAssessmentBtn.addEventListener("click", () => {
        window.location.href = "result.html";
    });
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

// ===============================
// RESULT CALCULATION
// ===============================
function calculateRisk() {
    let answers = JSON.parse(localStorage.getItem("answers")) || [];
    if(answers.length === 0) return 0;

    let score = 0;
    let maxScore = answers.length * 3;

    answers.forEach(a => {
        if (a.answer === "Yes") {
            if (a.duration === "More than 3 months" || a.duration === "1 - 3 months") {
                score += 3;
            } else {
                score += 2;
            }
        }
    });

    return Math.round((score / maxScore) * 100);
}

<<<<<<< HEAD

// ===============================
// SHOW RESULT (AI CONNECTED)
// ===============================
async function showResult() {

    const answers = JSON.parse(localStorage.getItem("answers")) || [];

    const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ answers })
    });

    const data = await res.json();

    const output = document.getElementById("insights");
=======
function showResult() {
    let percent = calculateRisk();
    const riskText = document.getElementById("riskText");
>>>>>>> f295dce12cad74a39278b615e65e57f4391d9a8d
    const riskPercent = document.getElementById("riskPercent");
    const circle = document.querySelector(".circle");

    let text = data.result;

    // 🔥 EXTRACT PERCENT FROM TEXT
    let match = text.match(/(\d+)%/);

    let percent = match ? parseInt(match[1]) : 50; // default fallback

    // 🔥 ANIMATE CIRCLE
    let current = 0;

<<<<<<< HEAD
=======
    // 🔥 ANIMATION (Updated to match Warm Rose / Muted Plum Theme)
>>>>>>> f295dce12cad74a39278b615e65e57f4391d9a8d
    let interval = setInterval(() => {
        if (current >= percent) {
            clearInterval(interval);
        } else {
            current++;
            riskPercent.innerText = current + "%";
            circle.style.background = `conic-gradient(#B56576 ${current}%, #e2e8f0 ${current}%)`;
        }
    }, 15);

<<<<<<< HEAD
    // 🔥 DISPLAY RESULT TEXT
    output.innerHTML = `
        <h3>${data.source === "AI" ? "AI Analysis 🤖" : "Smart Analysis ⚡"}</h3>
        <pre style="white-space:pre-line;">${text}</pre>
    `;
}


// ===============================
// AUTO RUN ON RESULT PAGE
// ===============================
if (window.location.pathname.includes("result.html")) {
    showResult();
=======
    if (percent > 70) {
        riskText.innerText = "High Risk ⚠️";
    } else if (percent > 40) {
        riskText.innerText = "Moderate Risk";
    } else {
        riskText.innerText = "Low Risk ✅";
    }

    let answers = JSON.parse(localStorage.getItem("answers")) || [];
    insights.innerHTML = "<h3 style='color: #6D597A; margin-bottom: 10px;'>Key Observations:</h3>";

    answers.forEach(a => {
        if (a.answer === "Yes") {
            insights.innerHTML += `<p style='margin-bottom: 5px;'>• ${a.question} <strong style='color: #B56576;'>(${a.duration})</strong></p>`;
        }
    });
>>>>>>> f295dce12cad74a39278b615e65e57f4391d9a8d
}

if (window.location.pathname.includes("result.html")) {
    showResult();
}

function goHome() {
    localStorage.clear();
    window.location.href = "dashboard.html";
}