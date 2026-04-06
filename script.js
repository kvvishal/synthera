// ===============================
// GLOBAL STATE
// ===============================
let isLogin = false;


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
// SCROLL ANIMATIONS
// ===============================
const sections = document.querySelectorAll("section");

if (sections.length > 0) {

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = "translateY(50px)";
        section.style.transition = "all 0.8s ease";
    });

    window.addEventListener("scroll", () => {
        let triggerBottom = window.innerHeight * 0.85;

        sections.forEach(section => {
            const boxTop = section.getBoundingClientRect().top;

            if (boxTop < triggerBottom) {
                section.style.opacity = 1;
                section.style.transform = "translateY(0)";
            }
        });
    });

    // HERO visible by default
    const hero = document.querySelector(".hero");
    if (hero) {
        hero.style.opacity = 1;
        hero.style.transform = "translateY(0)";
    }
}


// ===============================
// LOGIN / SIGNUP TOGGLE (FIXED)
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

        setupToggle(); // reattach listener
    });
}

setupToggle();


// ===============================
// SIGNUP FUNCTION
// ===============================
async function signupUser() {
    const name = document.querySelector("input[placeholder='Full Name']")?.value;
    const email = document.querySelector("input[placeholder='Email']")?.value;
    const password = document.querySelector("input[placeholder='Password']")?.value;

    if (!name || !email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        alert(data.message);

        // Auto switch to login after signup
        if (res.status === 200) {
            isLogin = true;
            document.getElementById("formTitle").innerText = "Login";
            document.getElementById("nameField").style.display = "none";
            document.getElementById("authBtn").innerText = "Login";
            document.getElementById("toggleText").innerHTML =
                `Don't have an account? <span id="toggleBtn">Sign Up</span>`;
            setupToggle();
        }

    } catch (err) {
        alert("Server error");
        console.error(err);
    }
}


// ===============================
// LOGIN FUNCTION
// ===============================
async function loginUser() {
    const email = document.querySelector("input[placeholder='Email']")?.value;
    const password = document.querySelector("input[placeholder='Password']")?.value;

    if (!email || !password) {
        alert("Please fill all fields");
        return;
    }

    try {
        const res = await fetch("http://127.0.0.1:5000/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.status === 200) {
            alert("Login successful 🎉");

            // Save login session
            localStorage.setItem("loggedIn", true);

            // Redirect
            window.location.href = "dashboard.html";

        } else {
            alert(data.message);
        }

    } catch (err) {
        alert("Server error");
        console.error(err);
    }
}


// ===============================
// AUTH BUTTON
// ===============================
const authBtn = document.getElementById("authBtn");

if (authBtn) {
    authBtn.addEventListener("click", () => {
        const mode = document.getElementById("formTitle")?.innerText;

        if (mode === "Login") {
            loginUser();
        } else {
            signupUser();
        }
    });
}


// ===============================
// DASHBOARD: SAVE PERSONAL DATA
// ===============================
const nextBtn = document.getElementById("nextBtn");

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        const age = document.getElementById("age")?.value;
        const height = document.getElementById("height")?.value;
        const weight = document.getElementById("weight")?.value;

        if (!age || !height || !weight) {
            alert("Please fill all fields");
            return;
        }

        const userData = { age, height, weight };

        localStorage.setItem("userData", JSON.stringify(userData));

        alert("Data saved ✅");

        // 👉 Next page (you will create)
        window.location.href = "questions.html";
    });
}


// ===============================
// LOGOUT BUTTON
// ===============================
const logoutBtn = document.querySelector(".logout");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        window.location.href = "index.html";
    });
}


// ===============================
// PROTECT DASHBOARD (LOGIN CHECK)
// ===============================
if (window.location.pathname.includes("dashboard.html")) {
    const loggedIn = localStorage.getItem("loggedIn");

    if (!loggedIn) {
        alert("Please login first");
        window.location.href = "login.html";
    }
}

// ===============================
// QUESTION SELECTION
// ===============================
let selectedOptions = [];

const options = document.querySelectorAll(".option");

options.forEach(option => {
    option.addEventListener("click", () => {

        const text = option.innerText;

        if (selectedOptions.includes(text)) {
            selectedOptions = selectedOptions.filter(item => item !== text);
            option.classList.remove("selected");
        } else {
            selectedOptions.push(text);
            option.classList.add("selected");
        }
    });
});


// ===============================
// NEXT QUESTION BUTTON
// ===============================
const nextQ = document.getElementById("nextQ");

if (nextQ) {
    nextQ.addEventListener("click", () => {

        if (selectedOptions.length === 0) {
            alert("Please select at least one option");
            return;
        }

        // Save answers
        localStorage.setItem("diagnosis", JSON.stringify(selectedOptions));

        alert("Saved! Moving next...");

        // 👉 Next step page (we'll build next)
        // window.location.href = "questions2.html";
    });
}

